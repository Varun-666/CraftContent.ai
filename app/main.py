from __future__ import annotations

from pathlib import Path
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from app.generator import generator

BASE_DIR = Path(__file__).resolve().parent
app = FastAPI(
    title="CraftCopy AI",
    description="A local-first listing assistant for independent handmade sellers, powered by open-weight AI.",
    version="0.1.0",
)
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")


class ListingRequest(BaseModel):
    product_name: str = Field(min_length=2, max_length=100)
    category: str = Field(default="", max_length=80)
    materials: str = Field(default="", max_length=160)
    dimensions: str = Field(default="", max_length=100)
    price: str = Field(default="", max_length=40)
    audience: str = Field(default="", max_length=120)
    features: str = Field(default="", max_length=300)
    platform: Literal["Instagram", "Etsy-style listing", "General product page"] = "General product page"
    tone: Literal["Warm and clear", "Minimal", "Playful", "Premium"] = "Warm and clear"
    language: Literal["English"] = "English"


@app.get("/")
def home() -> FileResponse:
    return FileResponse(BASE_DIR / "static" / "index.html")


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "app": "CraftCopy AI", "version": app.version}


@app.get("/api/model-status")
def model_status() -> dict:
    return generator.status()


@app.post("/api/generate")
def generate(request: ListingRequest) -> dict:
    try:
        return generator.generate(request.model_dump())
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Could not generate copy. Check the server logs and try again.") from exc
