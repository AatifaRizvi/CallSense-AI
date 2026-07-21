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
origins = [
    "https://callsense-ai-pi.vercel.app",
    "https://callsense-ai-git-main-aatifa-rizvis-projects.vercel.app",
    "https://callsense-8ujupwa9t-aatifa-rizvis-projects.vercel.app",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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