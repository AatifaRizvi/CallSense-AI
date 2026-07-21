from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.stats   import router as stats_router
from routes.calls   import router as calls_router
from routes.reviews import router as reviews_router
from routes.analyze import router as analyze_router
from routes.history import router as history_router

app = FastAPI(
    title="CallSense AI API",
    description="Sales Intelligence Platform — Analyze calls and reviews",
    version="1.0.0"
)

# CORS — for connecting React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://callsense-ai-pi.vercel.app",
        "http://localhost:3000",
    ],
    
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes registration
app.include_router(stats_router,   prefix="/api", tags=["Stats"])
app.include_router(calls_router,   prefix="/api", tags=["Calls"])
app.include_router(reviews_router, prefix="/api", tags=["Reviews"])
app.include_router(analyze_router, prefix="/api", tags=["Analyze"])
app.include_router(history_router, prefix="/api", tags=["History"])


@app.get("/")
def root():
    return {
        "project": "CallSense AI",
        "status":  "running",
        "docs":    "/docs"
    }


@app.get("/health")
def health():
    return {"status": "ok"}