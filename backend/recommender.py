"""
THADAM Recommendation Engine
Loads trained encoder + scaler + dataset and scores destinations.
"""
from __future__ import annotations

import os
import warnings

os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")
os.environ.setdefault("TF_ENABLE_ONEDNN_OPTS", "0")
warnings.filterwarnings("ignore", category=UserWarning)

from pathlib import Path
from typing import Any

import joblib
import keras
import numpy as np
import pandas as pd

# ──────────────────────────────────────────────
# Paths (relative to this file)
# ──────────────────────────────────────────────
_BASE = Path(__file__).parent
MODEL_PATH = _BASE / "model" / "THADAM_destination_encoder.keras"
SCALER_PATH = _BASE / "model" / "THADAM_scaler.pkl"
DATA_PATH = _BASE / "data" / "THADAM_Destination_Training_Data_114_COMPLETE.csv"

# ──────────────────────────────────────────────
# Exact 62 feature order (must not change)
# ──────────────────────────────────────────────
FEATURES: list[str] = [
    "entry_cost_inr",
    "average_visit_duration_hours",
    "capacity_model_estimate",
    "safety_score_1_5",
    "heritage_score_1_5",
    "nature_score_1_5",
    "food_score_1_5",
    "culture_score_1_5",
    "family_friendly_score_1_5",
    "average_visitor_rating_5",
    "average_crowd_level_1_5",
    "distance_from_Erode_city_km",
    "interest_historical",
    "interest_traditional",
    "interest_cultural",
    "interest_food",
    "interest_nature",
    "interest_beach",
    "interest_rural",
    "interest_spiritual",
    "interest_adventure",
    "interest_photography",
    "interest_shopping",
    "interest_art_craft",
    "famous_score_0_1",
    "moderate_score_0_1",
    "hidden_score_0_1",
    "crowd_level_1_3",
    "crowd_low_suitable",
    "crowd_moderate_suitable",
    "crowd_any_suitable",
    "transport_walking",
    "transport_bicycle",
    "transport_two_wheeler",
    "transport_car",
    "transport_bus",
    "transport_train",
    "transport_cab",
    "accommodation_budget",
    "accommodation_standard",
    "accommodation_premium",
    "accommodation_homestay",
    "accommodation_resort",
    "accommodation_no_stay",
    "food_vegetarian",
    "food_nonvegetarian",
    "food_vegan",
    "food_traditional",
    "food_local",
    "food_street",
    "food_premium",
    "food_budget",
    "facility_hospital_nearby",
    "facility_pharmacy_nearby",
    "facility_hotel_nearby",
    "facility_fuel_nearby",
    "facility_public_transport",
    "facility_avoid_isolated",
    "facility_family_friendly",
    "facility_senior_friendly",
    "facility_accessible",
    "recommended_max_continuous_travel_hours",
]

# ──────────────────────────────────────────────
# Hybrid scoring weights (must not change)
# ──────────────────────────────────────────────
WEIGHTS = {
    "core_interest": 0.55,
    "destination_preference": 0.12,
    "crowd": 0.10,
    "transport": 0.05,
    "accommodation": 0.04,
    "food": 0.05,
    "facilities": 0.06,
    "ai_similarity": 0.03,
}

# ──────────────────────────────────────────────
# Interest → column mapping
# ──────────────────────────────────────────────
INTEREST_COL_MAP: dict[str, str] = {
    "historical": "interest_historical",
    "traditional": "interest_traditional",
    "cultural": "interest_cultural",
    "food": "interest_food",
    "nature": "interest_nature",
    "beach": "interest_beach",
    "rural": "interest_rural",
    "spiritual": "interest_spiritual",
    "adventure": "interest_adventure",
    "photography": "interest_photography",
    "shopping": "interest_shopping",
    "art & craft": "interest_art_craft",
    "art craft": "interest_art_craft",
}

# ──────────────────────────────────────────────
# Destination-score columns in the dataset
# ──────────────────────────────────────────────
DEST_INTEREST_COLS: list[str] = [
    "interest_historical", "interest_traditional", "interest_cultural",
    "interest_food", "interest_nature", "interest_beach", "interest_rural",
    "interest_spiritual", "interest_adventure", "interest_photography",
    "interest_shopping", "interest_art_craft",
]


class ThadamRecommender:
    """Singleton holder for model, scaler and dataset embeddings."""

    encoder: Any
    scaler: Any
    df: pd.DataFrame
    dest_embeddings: np.ndarray  # shape (114, 16)
    feature_means: pd.Series    # baseline means for 62 features

    def load(self) -> None:
        self.encoder = keras.saving.load_model(str(MODEL_PATH))
        self.scaler = joblib.load(str(SCALER_PATH))
        self.df = pd.read_csv(str(DATA_PATH))

        # Pre-compute all 114 destination embeddings
        dest_matrix = self.df[FEATURES].values.astype(float)
        scaled_dest = self.scaler.transform(dest_matrix)
        self.dest_embeddings = self.encoder.predict(scaled_dest, verbose=0)  # (114, 16)

        # Dataset means (used as baseline for user vector)
        self.feature_means = self.df[FEATURES].mean()

    # ──────────────────────────────────────────
    # Public interface
    # ──────────────────────────────────────────
    def recommend(self, req: dict[str, Any], top_n: int = 10) -> list[dict]:
        user_vector = self._build_user_vector(req)
        scaled_vec = self.scaler.transform(user_vector.reshape(1, -1))
        user_emb = self.encoder.predict(scaled_vec, verbose=0)  # (1, 16)

        ai_sims = _cosine_similarity_1_to_N(user_emb[0], self.dest_embeddings)

        results: list[dict] = []
        for i, row in self.df.iterrows():
            scores = self._score_row(row, req, float(ai_sims[i]))
            results.append({"_idx": i, **scores})

        results.sort(key=lambda x: x["final_score"], reverse=True)
        top = results[:top_n]

        recommendations = []
        for rank, r in enumerate(top, start=1):
            idx = r["_idx"]
            row = self.df.iloc[idx]
            matched = self._matched_interests(row, req.get("interests", []))
            reasons = self._build_reasons(row, req, r)
            recommendations.append({
                "rank": rank,
                "destination_name": str(row.get("destination_name", "")),
                "district": str(row.get("district", "")),
                "destination_category": str(row.get("destination_category", "")),
                "latitude": float(row.get("latitude", 0.0)),
                "longitude": float(row.get("longitude", 0.0)),
                "entry_cost_inr": int(row.get("entry_cost_inr", 0)),
                "average_visit_duration_hours": float(row.get("average_visit_duration_hours", 2.0)),
                "average_visitor_rating_5": float(row.get("average_visitor_rating_5", 3.5)),
                "core_interest_score": round(r["core_interest_score"], 4),
                "preference_score": round(r["preference_score"], 4),
                "crowd_score": round(r["crowd_score"], 4),
                "transport_score": round(r["transport_score"], 4),
                "accommodation_score": round(r["accommodation_score"], 4),
                "food_score": round(r["food_score"], 4),
                "facility_score": round(r["facility_score"], 4),
                "ai_similarity": round(r["ai_similarity"], 4),
                "final_score": round(r["final_score"], 4),
                "matched_interests": matched,
                "match_reasons": reasons,
            })
        return recommendations

    # ──────────────────────────────────────────
    # User feature vector construction
    # ──────────────────────────────────────────
    def _build_user_vector(self, req: dict[str, Any]) -> np.ndarray:
        vec = self.feature_means.copy()

        # Interests
        for interest in req.get("interests", []):
            col = INTEREST_COL_MAP.get(interest.lower().strip())
            if col and col in vec.index:
                vec[col] = 1.0

        # Destination preference
        pref = str(req.get("destination_preference", "")).lower()
        if pref == "famous":
            vec["famous_score_0_1"] = 1.0
            vec["moderate_score_0_1"] = 0.0
            vec["hidden_score_0_1"] = 0.0
        elif pref == "moderate":
            vec["famous_score_0_1"] = 0.0
            vec["moderate_score_0_1"] = 1.0
            vec["hidden_score_0_1"] = 0.0
        elif pref == "hidden":
            vec["famous_score_0_1"] = 0.0
            vec["moderate_score_0_1"] = 0.0
            vec["hidden_score_0_1"] = 1.0
        elif pref == "mixed":
            vec["famous_score_0_1"] = 0.33
            vec["moderate_score_0_1"] = 0.33
            vec["hidden_score_0_1"] = 0.34

        # Crowd
        crowd = str(req.get("crowd", "")).lower()
        if crowd == "low":
            vec["crowd_low_suitable"] = 1.0
            vec["crowd_moderate_suitable"] = 0.0
            vec["crowd_any_suitable"] = 0.0
        elif crowd == "moderate":
            vec["crowd_low_suitable"] = 0.0
            vec["crowd_moderate_suitable"] = 1.0
            vec["crowd_any_suitable"] = 0.0
        else:
            vec["crowd_low_suitable"] = 0.0
            vec["crowd_moderate_suitable"] = 0.0
            vec["crowd_any_suitable"] = 1.0

        # Transport (list of strings)
        transport_list = [t.lower().strip() for t in req.get("transport", [])]
        transport_col_map = {
            "walking": "transport_walking",
            "bicycle": "transport_bicycle",
            "two-wheeler": "transport_two_wheeler",
            "two wheeler": "transport_two_wheeler",
            "car": "transport_car",
            "bus": "transport_bus",
            "train": "transport_train",
            "cab": "transport_cab",
        }
        for t in transport_list:
            col = transport_col_map.get(t)
            if col:
                vec[col] = 1.0

        # Accommodation (list of strings)
        acc_list = [a.lower().strip() for a in req.get("accommodation", [])]
        acc_col_map = {
            "budget": "accommodation_budget",
            "standard": "accommodation_standard",
            "premium": "accommodation_premium",
            "homestay": "accommodation_homestay",
            "resort": "accommodation_resort",
            "no stay": "accommodation_no_stay",
            "no_stay": "accommodation_no_stay",
        }
        for a in acc_list:
            col = acc_col_map.get(a)
            if col:
                vec[col] = 1.0

        # Food (list of strings)
        food_list = [f.lower().strip() for f in req.get("food", [])]
        food_col_map = {
            "vegetarian": "food_vegetarian",
            "non-vegetarian": "food_nonvegetarian",
            "nonvegetarian": "food_nonvegetarian",
            "vegan": "food_vegan",
            "traditional": "food_traditional",
            "local": "food_local",
            "street food": "food_street",
            "street": "food_street",
            "premium": "food_premium",
            "budget": "food_budget",
        }
        for f in food_list:
            col = food_col_map.get(f)
            if col:
                vec[col] = 1.0

        # Facilities (list of strings)
        fac_list = [f.lower().strip() for f in req.get("facilities", [])]
        fac_col_map = {
            "hospital nearby": "facility_hospital_nearby",
            "pharmacy nearby": "facility_pharmacy_nearby",
            "hotel nearby": "facility_hotel_nearby",
            "fuel nearby": "facility_fuel_nearby",
            "public transport": "facility_public_transport",
            "avoid isolated": "facility_avoid_isolated",
            "avoid isolated places": "facility_avoid_isolated",
            "family friendly": "facility_family_friendly",
            "senior friendly": "facility_senior_friendly",
            "wheelchair accessible": "facility_accessible",
            "accessible": "facility_accessible",
        }
        for f in fac_list:
            col = fac_col_map.get(f)
            if col:
                vec[col] = 1.0

        # Max continuous travel hours
        max_hours = req.get("max_continuous_travel_hours")
        if max_hours is not None:
            vec["recommended_max_continuous_travel_hours"] = float(max_hours)

        return vec[FEATURES].values.astype(float)

    # ──────────────────────────────────────────
    # Per-row hybrid scoring
    # ──────────────────────────────────────────
    def _score_row(self, row: pd.Series, req: dict, ai_sim: float) -> dict:
        interests = [i.lower().strip() for i in req.get("interests", [])]

        # 1. Core interest score
        matched_cols = [
            INTEREST_COL_MAP[i] for i in interests if i in INTEREST_COL_MAP
        ]
        if matched_cols:
            core_interest = float(
                np.mean([float(row.get(c, 0)) for c in matched_cols])
            )
        else:
            core_interest = 0.5

        # 2. Destination preference
        pref = str(req.get("destination_preference", "")).lower()
        if pref == "famous":
            pref_score = float(row.get("famous_score_0_1", 0))
        elif pref == "moderate":
            pref_score = float(row.get("moderate_score_0_1", 0))
        elif pref == "hidden":
            pref_score = float(row.get("hidden_score_0_1", 0))
        else:
            pref_score = (
                float(row.get("famous_score_0_1", 0)) * 0.33
                + float(row.get("moderate_score_0_1", 0)) * 0.33
                + float(row.get("hidden_score_0_1", 0)) * 0.34
            )

        # 3. Crowd score
        crowd = str(req.get("crowd", "")).lower()
        if crowd == "low":
            crowd_score = float(row.get("crowd_low_suitable", 0))
        elif crowd == "moderate":
            crowd_score = float(row.get("crowd_moderate_suitable", 0))
        else:
            crowd_score = float(row.get("crowd_any_suitable", 0))

        # 4. Transport score
        transport_list = [t.lower().strip() for t in req.get("transport", [])]
        transport_col_map = {
            "walking": "transport_walking",
            "bicycle": "transport_bicycle",
            "two-wheeler": "transport_two_wheeler",
            "two wheeler": "transport_two_wheeler",
            "car": "transport_car",
            "bus": "transport_bus",
            "train": "transport_train",
            "cab": "transport_cab",
        }
        t_cols = [
            transport_col_map[t]
            for t in transport_list
            if t in transport_col_map
        ]
        transport_score = (
            float(np.mean([float(row.get(c, 0)) for c in t_cols])) if t_cols else 0.5
        )

        # 5. Accommodation score
        acc_list = [a.lower().strip() for a in req.get("accommodation", [])]
        acc_col_map = {
            "budget": "accommodation_budget",
            "standard": "accommodation_standard",
            "premium": "accommodation_premium",
            "homestay": "accommodation_homestay",
            "resort": "accommodation_resort",
            "no stay": "accommodation_no_stay",
        }
        a_cols = [acc_col_map[a] for a in acc_list if a in acc_col_map]
        accommodation_score = (
            float(np.mean([float(row.get(c, 0)) for c in a_cols])) if a_cols else 0.5
        )

        # 6. Food score
        food_list = [f.lower().strip() for f in req.get("food", [])]
        food_col_map = {
            "vegetarian": "food_vegetarian",
            "non-vegetarian": "food_nonvegetarian",
            "nonvegetarian": "food_nonvegetarian",
            "vegan": "food_vegan",
            "traditional": "food_traditional",
            "local": "food_local",
            "street food": "food_street",
            "street": "food_street",
            "premium": "food_premium",
            "budget": "food_budget",
        }
        f_cols = [food_col_map[f] for f in food_list if f in food_col_map]
        food_score = (
            float(np.mean([float(row.get(c, 0)) for c in f_cols])) if f_cols else 0.5
        )

        # 7. Facility score
        fac_list = [f.lower().strip() for f in req.get("facilities", [])]
        fac_col_map = {
            "hospital nearby": "facility_hospital_nearby",
            "pharmacy nearby": "facility_pharmacy_nearby",
            "hotel nearby": "facility_hotel_nearby",
            "fuel nearby": "facility_fuel_nearby",
            "public transport": "facility_public_transport",
            "avoid isolated": "facility_avoid_isolated",
            "avoid isolated places": "facility_avoid_isolated",
            "family friendly": "facility_family_friendly",
            "senior friendly": "facility_senior_friendly",
            "wheelchair accessible": "facility_accessible",
            "accessible": "facility_accessible",
        }
        fc_cols = [fac_col_map[f] for f in fac_list if f in fac_col_map]
        facility_score = (
            float(np.mean([float(row.get(c, 0)) for c in fc_cols])) if fc_cols else 0.5
        )

        # Final hybrid score
        final_score = (
            core_interest * WEIGHTS["core_interest"]
            + pref_score * WEIGHTS["destination_preference"]
            + crowd_score * WEIGHTS["crowd"]
            + transport_score * WEIGHTS["transport"]
            + accommodation_score * WEIGHTS["accommodation"]
            + food_score * WEIGHTS["food"]
            + facility_score * WEIGHTS["facilities"]
            + ai_sim * WEIGHTS["ai_similarity"]
        )

        # Travel time penalty
        max_hours = req.get("max_continuous_travel_hours")
        dest_max = float(row.get("recommended_max_continuous_travel_hours", 8))
        if max_hours is not None and dest_max > float(max_hours):
            final_score *= 0.75

        return {
            "core_interest_score": core_interest,
            "preference_score": pref_score,
            "crowd_score": crowd_score,
            "transport_score": transport_score,
            "accommodation_score": accommodation_score,
            "food_score": food_score,
            "facility_score": facility_score,
            "ai_similarity": ai_sim,
            "final_score": final_score,
        }

    # ──────────────────────────────────────────
    # Helpers
    # ──────────────────────────────────────────
    def _matched_interests(self, row: pd.Series, interests: list[str]) -> list[str]:
        matched = []
        for interest in interests:
            col = INTEREST_COL_MAP.get(interest.lower().strip())
            if col and float(row.get(col, 0)) >= 0.5:
                matched.append(interest)
        return matched

    def _build_reasons(self, row: pd.Series, req: dict, scores: dict) -> list[str]:
        reasons: list[str] = []
        if scores["core_interest_score"] >= 0.7:
            reasons.append("Strong match for selected interests")
        elif scores["core_interest_score"] >= 0.4:
            reasons.append("Partial match for selected interests")

        pref = str(req.get("destination_preference", "")).lower()
        if pref and scores["preference_score"] >= 0.6:
            reasons.append(f"Matches preferred destination type ({pref})")

        crowd = str(req.get("crowd", "")).lower()
        if crowd and scores["crowd_score"] >= 0.6:
            reasons.append(f"Suitable for {crowd} crowd preference")

        if scores["transport_score"] >= 0.7:
            reasons.append("Good access via selected transport mode")

        if scores["facility_score"] >= 0.7:
            reasons.append("Required facilities are available nearby")

        rating = float(row.get("average_visitor_rating_5", 0))
        if rating >= 4.0:
            reasons.append(f"Highly rated by visitors ({rating:.1f}/5)")

        if not reasons:
            reasons.append("Recommended by THADAM AI")
        return reasons[:4]


# ──────────────────────────────────────────────────────────
# Cosine similarity: one vector vs matrix of row vectors
# ──────────────────────────────────────────────────────────
def _cosine_similarity_1_to_N(vec: np.ndarray, matrix: np.ndarray) -> np.ndarray:
    vec_norm = np.linalg.norm(vec)
    mat_norms = np.linalg.norm(matrix, axis=1)
    denom = vec_norm * mat_norms
    denom = np.where(denom == 0, 1e-9, denom)
    return np.dot(matrix, vec) / denom


# ──────────────────────────────────────────────────────────
# Destination-preference helper used by the API layer
# ──────────────────────────────────────────────────────────
def resolve_destination_preference(
    destination_preference: str | None,
    destination_mix: dict | None,
) -> str:
    """
    If caller passes explicit destination_preference use it directly.
    Otherwise map destinationMix (famous/moderate/hidden %) → Famous/Moderate/Hidden/Mixed.
    """
    if destination_preference:
        return destination_preference.strip().capitalize()

    if not destination_mix:
        return "Mixed"

    famous = destination_mix.get("famous", 33)
    moderate = destination_mix.get("moderate", 33)
    hidden = destination_mix.get("hidden", 34)
    total = famous + moderate + hidden or 100
    famous /= total / 100
    moderate /= total / 100
    hidden /= total / 100

    mx = max(famous, moderate, hidden)
    if mx < 45:
        return "Mixed"
    if famous == mx:
        return "Famous"
    if moderate == mx:
        return "Moderate"
    return "Hidden"


# Module-level singleton
recommender = ThadamRecommender()
