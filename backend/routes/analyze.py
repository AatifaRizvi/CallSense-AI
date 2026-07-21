import os
import io
import csv
import uuid
import tempfile
from fastapi import APIRouter, UploadFile, File, Form, Header
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from groq import Groq
from database import supabase
from auth import get_current_user
from llm_analyzer import analyze_text, generate_english_title

router = APIRouter()

MAX_ROWS = 100  # max rows per upload

groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY_1"))

class TextRequest(BaseModel):
    text: str
    source_type: str = "call"


def save_to_analysis_results(user_id: str, source_type: str, input_text: str, analysis: dict, record_id: str = None):
    """Insert one analyzed record into analysis_results so it shows up in
    Dashboard, Calls, and Reviews (which all read from this table)."""
    record_id = record_id or f"{source_type.upper()}-{uuid.uuid4().hex[:8]}"

    # Always generate the title in English, regardless of the original
    # language, rather than trusting whatever the main analysis returned.
    english_title = generate_english_title(input_text)

    try:
        supabase.table("analysis_results").insert({
            "record_id":  record_id,
            "user_id":    user_id,
            "source_type": source_type,
            "input_text": input_text,
            "title":      english_title,
            "sentiment":  analysis.get("sentiment"),
            "category":   analysis.get("category"),
            "intent":     analysis.get("intent"),
            "summary":    analysis.get("summary"),
            "objection":  analysis.get("objection"),
            "action_item": analysis.get("action_item"),
            "outcome":    analysis.get("outcome"),
            "risk_level": analysis.get("risk_level"),
            "language":   analysis.get("language_detected"),
        }).execute()
    except Exception as e:
        # Don't fail the whole request if the results-table insert fails —
        # the analysis itself already succeeded and is still returned to the user.
        print(f"Warning: failed to save to analysis_results: {e}")


def detect_text_column(row: dict) -> str:
    """Auto detect which column has the review text."""
    common_names = [
        "review_text", "text", "review", "content",
        "comment", "description", "feedback", "message", "body"
    ]
    for col in common_names:
        if col in row:
            return col
    # Fallback: use first column
    return list(row.keys())[0]

def parse_csv(content_str: str):
    """
    Smart CSV parser:
    - Tries with header first
    - If first row looks like a review (long text), treats as no-header CSV
    """
    # Try with header
    reader = csv.DictReader(io.StringIO(content_str))
    rows = list(reader)

    if not rows:
        return [], None

    text_col = detect_text_column(rows[0])
    first_val = rows[0].get(text_col, "")

    # If header value looks like a real review (>30 chars), no header CSV
    if len(first_val) > 30:
        # Re-parse without header — treat all lines as data
        lines = content_str.strip().split('\n')
        rows = [{"review": line.strip().strip('"')} for line in lines if line.strip()]
        text_col = "review"

    return rows, text_col

@router.post("/analyze/text")
def analyze_text_endpoint(req: TextRequest, authorization: str = Header(None)):
    if not req.text.strip():
        return {"error": "Text cannot be empty"}

    user_id, _ = get_current_user(authorization)
    result = analyze_text(req.text, source_type=req.source_type)
    save_to_analysis_results(user_id, req.source_type, req.text, result)

    return {
        "input":    req.text[:200] + "..." if len(req.text) > 200 else req.text,
        "analysis": result
    }

@router.post("/analyze/audio")
async def analyze_audio_endpoint(file: UploadFile = File(...), authorization: str = Header(None)):
    if not file.filename.endswith((".mp3", ".wav", ".m4a")):
        return {"error": "Only MP3, WAV, M4A files supported"}

    user_id, _ = get_current_user(authorization)

    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        with open(tmp_path, "rb") as audio_file:
            transcription = groq_client.audio.transcriptions.create(
                file=audio_file,
                model="whisper-large-v3",
            )
        transcript = transcription.text

        analysis = analyze_text(transcript, source_type="call")
        save_to_analysis_results(user_id, "call", transcript, analysis)
        return {
            "filename":   file.filename,
            "transcript": transcript,
            "analysis":   analysis
        }
    finally:
        os.unlink(tmp_path)

@router.post("/analyze/csv")
async def analyze_csv_endpoint(file: UploadFile = File(...), authorization: str = Header(None)):
    if not file.filename.endswith(".csv"):
        return {"error": "Only CSV files supported"}

    user_id, _ = get_current_user(authorization)

    content  = await file.read()
    decoded  = content.decode("utf-8")
    rows, text_col = parse_csv(decoded)

    if not rows:
        return {"error": "CSV is empty"}

    total_rows  = len(rows)
    rows_to_use = rows[:MAX_ROWS]
    skipped     = max(0, total_rows - MAX_ROWS)

    results = []
    for i, row in enumerate(rows_to_use):
        text = row.get(text_col, "").strip()
        if not text:
            continue
        analysis = analyze_text(text, source_type="review")
        save_to_analysis_results(user_id, "review", text, analysis)
        results.append({
            "row":               i + 1,
            "input_text":        text[:200] + "..." if len(text) > 200 else text,
            "sentiment":         analysis["sentiment"],
            "category":          analysis["category"],
            "intent":            analysis["intent"],
            "summary":           analysis["summary"],
            "objection":         analysis["objection"],
            "action_item":       analysis["action_item"],
            "outcome":           analysis["outcome"],
            "risk_level":        analysis["risk_level"],
            "language_detected": analysis["language_detected"],
        })

    return {
        "total":       len(results),
        "total_rows":  total_rows,
        "skipped":     skipped,
        "filename":    file.filename,
        "column_used": text_col,
        "results":     results
    }

@router.post("/analyze/csv/download")
async def analyze_csv_download(file: UploadFile = File(...), authorization: str = Header(None)):
    if not file.filename.endswith(".csv"):
        return {"error": "Only CSV files supported"}

    user_id, _ = get_current_user(authorization)

    content  = await file.read()
    decoded  = content.decode("utf-8")
    rows, text_col = parse_csv(decoded)

    if not rows:
        return {"error": "CSV is empty"}

    output_rows = []
    for row in rows[:MAX_ROWS]:
        text = row.get(text_col, "").strip()
        if not text:
            continue
        analysis = analyze_text(text, source_type="review")
        save_to_analysis_results(user_id, "review", text, analysis)
        output_row = {**row}
        output_row["sentiment"]         = analysis["sentiment"]
        output_row["category"]          = analysis["category"]
        output_row["summary"]           = analysis["summary"]
        output_row["objection"]         = analysis["objection"]
        output_row["action_item"]       = analysis["action_item"]
        output_row["risk_level"]        = analysis["risk_level"]
        output_row["language_detected"] = analysis["language_detected"]
        output_rows.append(output_row)

    output = io.StringIO()
    if output_rows:
        writer = csv.DictWriter(output, fieldnames=output_rows[0].keys())
        writer.writeheader()
        writer.writerows(output_rows)

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=analyzed_{file.filename}"}
    )