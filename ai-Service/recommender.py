import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from collections import defaultdict

class CollaborativeFilter:
    """User-based collaborative filtering."""
    def __init__(self):
        self.user_product_matrix = None
        self.similarity_matrix = None
        self.user_ids = []
        self.product_ids = []

    def fit(self, orders: list):
        """orders: [{"user_id": "...", "product_id": "..."}]"""
        df = pd.DataFrame(orders)
        if df.empty:
            return
        self.user_product_matrix = pd.crosstab(df['user_id'], df['product_id'])
        self.user_ids = list(self.user_product_matrix.index)
        self.product_ids = list(self.user_product_matrix.columns)
        sim = cosine_similarity(self.user_product_matrix.values)
        self.similarity_matrix = pd.DataFrame(sim, index=self.user_ids, columns=self.user_ids)

    def predict(self, user_id: str, n: int = 4) -> list:
        if self.similarity_matrix is None or user_id not in self.user_ids:
            return []
        sim_scores = self.similarity_matrix[user_id].drop(user_id).sort_values(ascending=False)
        top_users = sim_scores.head(5).index
        # Products bought by similar users but not by this user
        bought = set(self.user_product_matrix.loc[user_id][
            self.user_product_matrix.loc[user_id] > 0].index)
        scores = defaultdict(float)
        for u in top_users:
            weight = sim_scores[u]
            for p in self.user_product_matrix.columns:
                if p not in bought and self.user_product_matrix.loc[u, p] > 0:
                    scores[p] += weight
        sorted_recs = sorted(scores, key=scores.get, reverse=True)
        return sorted_recs[:n]


class ContentBasedFilter:
    """TF-IDF content-based filtering on product tags + description."""
    def __init__(self):
        self.tfidf = TfidfVectorizer(stop_words='english')
        self.product_matrix = None
        self.product_ids = []

    def fit(self, products: list):
        """products: [{"_id": "...", "name": "...", "description": "...", "tags": [...]}]"""
        if not products:
            return
        corpus = [
            f"{p.get('name', '')} {p.get('description', '')} {' '.join(p.get('tags', []))}"
            for p in products
        ]
        self.product_ids = [str(p['_id']) for p in products]
        self.product_matrix = self.tfidf.fit_transform(corpus)

    def predict(self, purchase_history: list, n: int = 4) -> list:
        if self.product_matrix is None or not purchase_history:
            return []
        known = [i for i, pid in enumerate(self.product_ids) if pid in purchase_history]
        if not known:
            return []
        user_vec = self.product_matrix[known].mean(axis=0)
        sims = cosine_similarity(np.asarray(user_vec), self.product_matrix)[0]
        # Exclude already purchased
        for i in known:
            sims[i] = -1
        top_indices = sims.argsort()[-n:][::-1]
        return [self.product_ids[i] for i in top_indices if sims[i] > 0]