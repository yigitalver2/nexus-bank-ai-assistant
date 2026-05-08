from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from knowledge.ingest import seed_kb

from auth.router import router as auth_router
from config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[Startup] Seeding knowledge base...")
    seed_kb()
    print("[Startup] Done.")
    yield
    print("[Shutdown] Goodbye!")



app = FastAPI(
    title="Nexus Bank AI Assistant API",
    description="AI-powered banking customer support agent — chat + voice.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)


@app.get("/health", tags=["system"])
def health():
    return {"status": "ok", "env": settings.app_env}
