import chromadb
from chromadb.config import Settings



_client = None
_collection = None


def get_chroma_client():
    global _client
    if _client is None:
        _client = chromadb.PersistentClient(
            path="./chroma_data",
            settings=Settings(anonymized_telemetry=False),
        )
    return _client
    
    
    
def get_collection():
    global _collection
    if _collection is None:
        client = get_chroma_client()
        _collection = client.get_or_create_collection(
            name="nexus_bank_kb",
            metadata={"hnsw:space": "cosine"},
        )
    return _collection