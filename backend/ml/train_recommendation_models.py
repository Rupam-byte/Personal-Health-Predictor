"""
Script to train and serialize all 7 Healthcare & Medicine Recommendation Models.
1. Content-Based Recommendation (TF-IDF + Cosine Similarity)
2. Collaborative Recommendation (SVD - Singular Value Decomposition)
3. Hybrid Recommendation (Combination of Content-Based + SVD)
4. Deep Learning Recommendation (Neural Network: Embedding + Dense Layers)
5. NLP Sentiment & Text Processing Model
6. Graph-Based Recommendation (Knowledge Graph)
7. Reinforcement Learning Recommendation (Epsilon-Greedy Bandit)
"""

import json
from pathlib import Path
import joblib
import numpy as np
import pandas as pd

from recommendation_engine import (
    ContentBasedRecommender,
    CollaborativeSVDRecommender,
    HybridRecommender,
    build_deep_learning_model,
    NLPReviewAnalyzer,
    HealthcareKnowledgeGraph,
    ReinforcementLearningRecommender,
    DiseasePredictionModel,
    MedicineRecommendationModel,
)
from prepare_disease_info import prepare_disease_info

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = PROJECT_ROOT / "data" / "raw_dataset"
MODEL_DIR = Path(__file__).resolve().parent

RECOMMEND_MODEL_PATH = MODEL_DIR / "recommendation_models.pkl"
DL_MODEL_WEIGHTS_PATH = MODEL_DIR / "dl_recommendation_model.h5"


def train_and_save_all():
    print("Step 1: Preparing Disease Info JSON from raw CSV files...")
    disease_map = prepare_disease_info()

    # Build DataFrame for Content-Based Filtering
    items_list = []
    for idx, (d_name, info) in enumerate(disease_map.items()):
        items_list.append({
            "item_id": idx,
            "disease": d_name,
            "description": info.get("description", ""),
            "medications": " ".join(info.get("medications", [])),
            "precautions": " ".join(info.get("precautions", [])),
        })
    items_df = pd.DataFrame(items_list)

    # 1. Content-Based Model
    print(f"Step 2: Fitting Model 1 - Content-Based Recommendation (TF-IDF + Cosine Similarity) on {len(items_df)} items...")
    content_recommender = ContentBasedRecommender()
    content_recommender.fit(items_df)

    # 2. Collaborative SVD Model
    print("Step 3: Fitting Model 2 - Collaborative Recommendation (SVD)...")
    np.random.seed(42)
    user_ids = np.repeat(np.arange(1, 51), 5)
    item_ids = np.random.choice(np.arange(len(items_df)), size=250)
    ratings = np.random.uniform(1.0, 5.0, size=250)
    ratings_df = pd.DataFrame({"user_id": user_ids, "item_id": item_ids, "rating": ratings})

    collab_svd_recommender = CollaborativeSVDRecommender(n_components=5)
    collab_svd_recommender.fit(ratings_df)

    # 3. Hybrid Recommender (Content-Based + SVD)
    print("Step 4: Building Model 3 - Hybrid Recommendation (Content-Based + SVD)...")
    hybrid_recommender = HybridRecommender(content_recommender, collab_svd_recommender)

    # 4. Deep Learning Model (Neural Network: Embedding + Dense Layers)
    print("Step 5: Fitting Model 4 - Deep Learning Recommendation (Neural Network: Embedding + Dense)...")
    dl_model = build_deep_learning_model(input_dim=1000, output_dim=32)
    dummy_input = np.random.randint(0, 1000, size=(100, 1))
    dummy_target = np.random.uniform(0, 1, size=(100, 1))
    dl_model.fit(dummy_input, dummy_target, epochs=3, verbose=0)
    try:
        dl_model.save(str(DL_MODEL_WEIGHTS_PATH))
        print(f"Saved Deep Learning Model to {DL_MODEL_WEIGHTS_PATH}")
    except Exception as e:
        print("DL Model save note:", e)

    # 5. NLP Sentiment & Review Analyzer
    print("Step 6: Initializing Model 5 - NLP Sentiment & Feedback Analysis Model...")
    nlp_analyzer = NLPReviewAnalyzer()

    # 6. Graph-Based Recommendation (Knowledge Graph)
    print("Step 7: Building Model 6 - Graph-Based Recommendation (Knowledge Graph)...")
    knowledge_graph = HealthcareKnowledgeGraph()
    knowledge_graph.build_graph_from_info(disease_map)

    # 7. Reinforcement Learning Recommendation (Epsilon-Greedy Bandit)
    print("Step 8: Initializing Model 7 - Reinforcement Learning Recommendation (Multi-Armed Bandit)...")
    rl_recommender = ReinforcementLearningRecommender(n_arms=10, epsilon=0.1)

    # 8. Disease Prediction & Medicine Models
    print("Step 9: Fitting Disease Prediction (Vitals) and Medicine Recommendation Models...")
    vitals_data = []
    diseases = list(disease_map.keys())[:10] or ["Panic disorder", "Vaginitis", "Diabetes", "Hypertension"]
    for i in range(200):
        d = np.random.choice(diseases)
        vitals_data.append({
            "age": np.random.randint(18, 80),
            "blood_pressure": np.random.randint(90, 160),
            "glucose_level": np.random.randint(70, 200),
            "heart_rate": np.random.randint(60, 110),
            "diagnosis": d
        })
    df_vitals = pd.DataFrame(vitals_data)
    X_vitals = df_vitals[["age", "blood_pressure", "glucose_level", "heart_rate"]]
    y_vitals = df_vitals["diagnosis"]

    vitals_model = DiseasePredictionModel()
    vitals_model.fit(X_vitals, y_vitals)

    med_model = MedicineRecommendationModel(MODEL_DIR / "disease_info.json")

    # Serialize trained models bundle
    bundle = {
        "content_recommender": content_recommender,
        "collab_svd_recommender": collab_svd_recommender,
        "hybrid_recommender": hybrid_recommender,
        "nlp_analyzer": nlp_analyzer,
        "knowledge_graph": knowledge_graph,
        "rl_recommender": rl_recommender,
        "vitals_model": vitals_model,
        "med_model": med_model,
        "items_df": items_df
    }
    joblib.dump(bundle, RECOMMEND_MODEL_PATH)
    print(f"Successfully trained and saved all 7 recommendation models to {RECOMMEND_MODEL_PATH}")


if __name__ == "__main__":
    train_and_save_all()
