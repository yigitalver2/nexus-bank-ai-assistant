from fastapi import APIRouter
from langchain_openai import OpenAIEmbeddings
from pydantic import BaseModel

from knowledge.chroma_client import get_collection
from knowledge.ingest import seed_kb

_embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

router = APIRouter(prefix="/api/knowledge", tags=["knowledge"])


# Bilgi tabanını manuel olarak yeniden yükler (geliştirme ve test için).
@router.post("/ingest")
def ingest():
    seed_kb()
    collection = get_collection()
    return {"status": "ok", "total_chunks": collection.count()}


class SearchRequest(BaseModel):
    query: str
    n_results: int = 4


# Chroma'da anlamsal arama yapar; agent'ın ne bulacağını test etmek için.
@router.get("/search")
def search(query: str, n_results: int = 4):
    collection = get_collection()
    query_vector = _embeddings.embed_query(query)
    results = collection.query(
        query_embeddings=[query_vector],
        n_results=n_results,
        include=["documents", "metadatas", "distances"],
    )
    output = []
    for doc, meta, dist in zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0],
    ):
        output.append({
            "title": meta.get("title"),
            "category": meta.get("category"),
            "score": round(1 - dist, 4),
            "content": doc[:300],
        })
    return {"results": output}
