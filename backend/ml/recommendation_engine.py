"""
Personalized Healthcare Recommendation System - Full Multi-Model Recommendation Engine
Includes:
1. Content-Based Recommendation (TF-IDF + Cosine Similarity)
2. Collaborative Recommendation (SVD - Singular Value Decomposition)
3. Hybrid Recommendation (Combination of Content-Based + SVD)
4. Deep Learning Recommendation (Neural Network with Embedding + Dense Layers)
5. NLP Sentiment & Review Analysis (Text Mining & Sentiment Scoring)
6. Graph-Based Recommendation (Healthcare Knowledge Graph)
7. Reinforcement Learning Recommendation (Epsilon-Greedy Multi-Armed Bandit)
8. Disease Prediction & Medicine Recommendation Models
"""

import json
import re
from pathlib import Path
import numpy as np
import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import TruncatedSVD
from sklearn.ensemble import RandomForestClassifier

import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Embedding, Dense, Flatten


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = PROJECT_ROOT / "data" / "raw_dataset"
MODEL_DIR = Path(__file__).resolve().parent


# ----------------------------------------------------------------------------
# 1. Content-Based Recommendation (ML: TF-IDF + Cosine Similarity)
# ----------------------------------------------------------------------------
class ContentBasedRecommender:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words="english")
        self.item_vectors = None
        self.cosine_sim = None
        self.items_df = None

    def fit(self, items_df: pd.DataFrame):
        self.items_df = items_df.reset_index(drop=True)
        text_corpus = (
            self.items_df["disease"].astype(str) + " " +
            self.items_df["description"].astype(str) + " " +
            self.items_df["medications"].astype(str)
        )
        self.item_vectors = self.vectorizer.fit_transform(text_corpus)
        self.cosine_sim = cosine_similarity(self.item_vectors)

    def recommend_items(self, item_id: int, num_recommendations: int = 3):
        if self.cosine_sim is None or item_id >= len(self.items_df):
            return []
        sim_scores = list(enumerate(self.cosine_sim[item_id]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        sim_scores = [s for s in sim_scores if s[0] != item_id][:num_recommendations]
        
        results = []
        for idx, score in sim_scores:
            row = self.items_df.iloc[idx]
            results.append({
                "item_id": int(idx),
                "disease": row["disease"],
                "similarity_score": round(float(score), 4),
                "medications": row.get("medications", []),
                "description": row.get("description", "")
            })
        return results


# ----------------------------------------------------------------------------
# 2. Collaborative Recommendation (ML: SVD - Singular Value Decomposition)
# ----------------------------------------------------------------------------
class CollaborativeSVDRecommender:
    def __init__(self, n_components: int = 5):
        self.n_components = n_components
        self.svd = None
        self.user_item_matrix = None
        self.predicted_matrix = None

    def fit(self, ratings_df: pd.DataFrame):
        if ratings_df.empty:
            return
        self.user_item_matrix = ratings_df.pivot_table(
            index="user_id", columns="item_id", values="rating", aggfunc="mean"
        ).fillna(0)

        n_comp = min(self.n_components, min(self.user_item_matrix.shape) - 1)
        if n_comp < 1:
            n_comp = 1

        self.svd = TruncatedSVD(n_components=n_comp, random_state=42)
        decomposed = self.svd.fit_transform(self.user_item_matrix.values)
        self.predicted_matrix = np.dot(decomposed, self.svd.components_)

    def predict_score(self, user_id: int, item_id: int) -> float:
        if self.user_item_matrix is None or user_id not in self.user_item_matrix.index:
            return 0.5
        user_idx = list(self.user_item_matrix.index).index(user_id)
        if item_id not in self.user_item_matrix.columns:
            return 0.5
        item_idx = list(self.user_item_matrix.columns).index(item_id)
        score = self.predicted_matrix[user_idx, item_idx]
        return float(np.clip(score / 5.0, 0.0, 1.0))


# ----------------------------------------------------------------------------
# 3. Hybrid Recommendation (ML: Combination of Content-Based + SVD)
# ----------------------------------------------------------------------------
class HybridRecommender:
    def __init__(self, content_model: ContentBasedRecommender, collab_model: CollaborativeSVDRecommender):
        self.content_model = content_model
        self.collab_model = collab_model

    def hybrid_recommendation(self, user_id: int, item_id: int, alpha: float = 0.5) -> dict:
        content_score = 0.5
        if self.content_model.cosine_sim is not None and item_id < len(self.content_model.items_df):
            content_score = float(np.mean(self.content_model.cosine_sim[item_id]))

        collab_score = self.collab_model.predict_score(user_id, item_id)
        final_score = alpha * content_score + (1.0 - alpha) * collab_score

        return {
            "user_id": user_id,
            "item_id": item_id,
            "content_score": round(content_score, 4),
            "svd_collab_score": round(collab_score, 4),
            "hybrid_score": round(final_score, 4),
            "method": "Content-Based (TF-IDF) + Collaborative (SVD)"
        }


# ----------------------------------------------------------------------------
# 4. Deep Learning Recommendation (Neural Network: Embedding + Dense Layers)
# ----------------------------------------------------------------------------
def build_deep_learning_model(input_dim: int = 1000, output_dim: int = 32):
    model = Sequential([
        Embedding(input_dim=input_dim, output_dim=output_dim),
        Flatten(),
        Dense(128, activation='relu'),
        Dense(64, activation='relu'),
        Dense(1, activation='sigmoid')
    ])
    model.compile(optimizer='adam', loss='mse', metrics=['mae'])
    return model


# ----------------------------------------------------------------------------
# 5. NLP Analysis (AI: Sentiment & Text Analysis on Patient Feedback)
# ----------------------------------------------------------------------------
class NLPReviewAnalyzer:
    """
    NLP sentiment analysis engine for patient feedback & clinical reviews.
    """
    def __init__(self):
        self.positive_words = {"effective", "helped", "good", "relieved", "great", "better", "cured", "excellent", "safe"}
        self.negative_words = {"side-effect", "worse", "bad", "allergic", "painful", "ineffective", "nausea", "headache"}

    def analyze_feedback(self, text: str) -> dict:
        tokens = re.findall(r"\b\w+\b", text.lower())
        pos_count = sum(1 for t in tokens if t in self.positive_words)
        neg_count = sum(1 for t in tokens if t in self.negative_words)
        
        total = pos_count + neg_count
        if total == 0:
            sentiment = "neutral"
            score = 0.5
        else:
            score = pos_count / total
            if score > 0.6:
                sentiment = "positive"
            elif score < 0.4:
                sentiment = "negative"
            else:
                sentiment = "neutral"

        return {
            "text": text,
            "sentiment": sentiment,
            "confidence_score": round(score, 2),
            "positive_matches": pos_count,
            "negative_matches": neg_count
        }


# ----------------------------------------------------------------------------
# 6. Graph-Based Recommendation (AI: Healthcare Knowledge Graph)
# ----------------------------------------------------------------------------
class HealthcareKnowledgeGraph:
    """
    Graph recommendation connecting Patients, Symptoms, Diseases, and Medications.
    """
    def __init__(self):
        self.nodes = {}
        self.edges = {}

    def build_graph_from_info(self, disease_info: dict):
        for disease, info in disease_info.items():
            d_node = f"disease:{disease}"
            self.nodes[d_node] = "disease"
            self.edges.setdefault(d_node, [])

            for med in info.get("medications", []):
                m_node = f"medication:{med}"
                self.nodes[m_node] = "medication"
                self.edges.setdefault(m_node, [])
                self.edges[d_node].append(m_node)
                self.edges[m_node].append(d_node)

    def recommend_by_graph(self, disease_name: str, max_depth: int = 2) -> dict:
        target_node = f"disease:{disease_name}"
        if target_node not in self.edges:
            return {"disease": disease_name, "associated_nodes": []}
        
        associated = list(set(self.edges[target_node]))
        return {
            "disease": disease_name,
            "knowledge_graph_connections": [
                {"node": n, "type": self.nodes.get(n, "unknown")} for n in associated
            ]
        }


# ----------------------------------------------------------------------------
# 7. Reinforcement Learning Recommendation (AI: Epsilon-Greedy Bandit)
# ----------------------------------------------------------------------------
class ReinforcementLearningRecommender:
    """
    Multi-Armed Bandit Reinforcement Learning recommender.
    Dynamically learns optimal treatment recommendations from user reward feedback.
    """
    def __init__(self, n_arms: int = 10, epsilon: float = 0.1):
        self.n_arms = n_arms
        self.epsilon = epsilon
        self.arm_counts = np.zeros(n_arms)
        self.arm_rewards = np.zeros(n_arms)

    def select_action(self) -> int:
        if np.random.rand() < self.epsilon:
            return int(np.random.randint(self.n_arms))
        return int(np.argmax(self.arm_rewards / (self.arm_counts + 1e-5)))

    def update_reward(self, arm: int, reward: float):
        if 0 <= arm < self.n_arms:
            self.arm_counts[arm] += 1
            # Incremental average reward update rule
            self.arm_rewards[arm] += (reward - self.arm_rewards[arm]) / self.arm_counts[arm]

    def get_status(self) -> dict:
        return {
            "n_arms": self.n_arms,
            "epsilon": self.epsilon,
            "estimated_arm_rewards": np.round(self.arm_rewards, 3).tolist(),
            "arm_pull_counts": self.arm_counts.astype(int).tolist()
        }


# ----------------------------------------------------------------------------
# 8. Disease Prediction & Medicine Recommendation Models
# ----------------------------------------------------------------------------
class DiseasePredictionModel:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)

    def fit(self, X: pd.DataFrame, y: pd.Series):
        self.model.fit(X, y)

    def predict(self, patient_vitals: dict) -> dict:
        df = pd.DataFrame([patient_vitals])
        pred = self.model.predict(df)[0]
        probs = self.model.predict_proba(df)[0]
        conf = float(np.max(probs) * 100)
        return {
            "diagnosis": pred,
            "confidence": round(conf, 2),
            "vitals_analyzed": patient_vitals
        }


class MedicineRecommendationModel:
    def __init__(self, disease_info_path: Path = None):
        if disease_info_path is None:
            disease_info_path = MODEL_DIR / "disease_info.json"
        
        self.disease_info = {}
        if disease_info_path.exists():
            with open(disease_info_path, "r", encoding="utf-8") as f:
                self.disease_info = json.load(f)

    def recommend_medicine(self, diagnosis: str, patient_profile: dict = None) -> dict:
        info = self.disease_info.get(diagnosis, {})
        if not info:
            diag_lower = diagnosis.lower()
            for key, val in self.disease_info.items():
                if key.lower() == diag_lower:
                    info = val
                    break

        medications = info.get("medications", ["Consult a healthcare provider for specific dosage."])
        precautions = info.get("precautions", ["Rest and drink plenty of fluids."])
        diet = info.get("diet", ["Maintain a balanced nutrition plan."])
        workout = info.get("workout", ["Light walking and adequate rest."])

        return {
            "diagnosis": diagnosis,
            "patient_profile": patient_profile or {},
            "recommended_medications": medications,
            "precautions": precautions,
            "diet_plan": diet,
            "workout_plan": workout
        }
