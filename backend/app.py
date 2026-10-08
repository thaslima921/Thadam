"""
THADAM TN — FastAPI Backend
POST /api/recommend   → THADAM AI destination recommendations
GET  /api/health      → service health check
"""
from __future__ import annotations

import os
import contextlib
from typing import Any

os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")
os.environ.setdefault("TF_ENABLE_ONEDNN_OPTS", "0")

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from recommender import recommender, resolve_destination_preference


# ──────────────────────────────────────────────
# Startup / Shutdown lifecycle
# ──────────────────────────────────────────────
@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):  # type: ignore[type-arg]
    recommender.load()
    yield


app = FastAPI(
    title="THADAM TN AI Backend",
    description="Trained destination recommendation engine for Thadam TN.",
    version="1.0.0",
    lifespan=lifespan,
)

# ──────────────────────────────────────────────
# CORS — allow Expo web + local dev origins
# ──────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────────
# Request / Response models
# ──────────────────────────────────────────────
class DestinationMixModel(BaseModel):
    famous: float = 33.0
    moderate: float = 33.0
    hidden: float = 34.0


class RecommendRequest(BaseModel):
    # Trip details (preserved but not ML-modelled)
    start_location: str = ""
    destination: str = ""
    start_date: str = ""
    end_date: str = ""

    # Travelers
    adults: int = 2
    children: int = 0
    seniors: int = 0

    # Budget (preserved but not ML-modelled)
    total_budget: float = 10000.0

    # Core preferences
    interests: list[str] = Field(default_factory=list)

    # Either explicit OR derived from destinationMix
    destination_preference: str | None = None
    destination_mix: DestinationMixModel | None = None

    crowd: str = "Any"
    transport: list[str] = Field(default_factory=list)
    max_continuous_travel_hours: float = 3.0
    accommodation: list[str] = Field(default_factory=list)
    food: list[str] = Field(default_factory=list)
    facilities: list[str] = Field(default_factory=list)
    optional_text: str = ""


class RecommendationItem(BaseModel):
    rank: int
    destination_name: str
    district: str
    destination_category: str
    latitude: float
    longitude: float
    entry_cost_inr: int
    average_visit_duration_hours: float
    average_visitor_rating_5: float
    core_interest_score: float
    preference_score: float
    crowd_score: float
    transport_score: float
    accommodation_score: float
    food_score: float
    facility_score: float
    ai_similarity: float
    final_score: float
    matched_interests: list[str]
    match_reasons: list[str]


class RecommendResponse(BaseModel):
    success: bool
    recommendations: list[RecommendationItem]


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    dataset_rows: int
    feature_count: int


# ──────────────────────────────────────────────
# Endpoints
# ──────────────────────────────────────────────
@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
async def health() -> HealthResponse:
    try:
        model_loaded = hasattr(recommender, "encoder") and recommender.encoder is not None
        dataset_rows = len(recommender.df) if hasattr(recommender, "df") else 0
        feature_count = 62
    except Exception:
        model_loaded = False
        dataset_rows = 0
        feature_count = 0

    return HealthResponse(
        status="ok",
        model_loaded=model_loaded,
        dataset_rows=dataset_rows,
        feature_count=feature_count,
    )


@app.post("/api/recommend", response_model=RecommendResponse, tags=["AI"])
async def recommend(body: RecommendRequest) -> RecommendResponse:
    if not hasattr(recommender, "encoder"):
        raise HTTPException(status_code=503, detail="Model not loaded yet.")

    # Resolve destination preference from either field or mix sliders
    dest_pref = resolve_destination_preference(
        body.destination_preference,
        body.destination_mix.model_dump() if body.destination_mix else None,
    )

    req: dict[str, Any] = {
        "start_location": body.start_location,
        "destination": body.destination,
        "start_date": body.start_date,
        "end_date": body.end_date,
        "adults": body.adults,
        "children": body.children,
        "seniors": body.seniors,
        "total_budget": body.total_budget,
        "interests": body.interests,
        "destination_preference": dest_pref,
        "crowd": body.crowd,
        "transport": body.transport,
        "max_continuous_travel_hours": body.max_continuous_travel_hours,
        "accommodation": body.accommodation,
        "food": body.food,
        "facilities": body.facilities,
        "optional_text": body.optional_text,
    }

    try:
        recs = recommender.recommend(req, top_n=10)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return RecommendResponse(
        success=True,
        recommendations=[RecommendationItem(**r) for r in recs],
    )
