import os
from pathlib import Path

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings

from knowledge.chroma_client import get_collection

DOCS_DIR = Path(__file__).parent / "docs"




def _parse_metadata(text: str) -> dict:
    metadata = {"title": "", "category": "", "doc_id": "", "language": "en"}
    for line in text.splitlines()[:5]:
        if line.startswith("Title:"):
            metadata["title"] = line.split(":", 1)[1].strip()
        elif line.startswith("Category:"):
            metadata["category"] = line.split(":", 1)[1].strip()
        elif line.startswith("Doc-ID:"):
            metadata["doc_id"] = line.split(":", 1)[1].strip()
    return metadata



def seed_kb() -> None:
    collection = get_collection()

    if collection.count() > 0:
        print(f"[KB] Already loaded ({collection.count()} chunks). Skipping.")
        return

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=2000,
        chunk_overlap=200,
    )
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

    docs, metadatas, ids = [], [], []

    for txt_file in sorted(DOCS_DIR.rglob("*.txt")):
        text = txt_file.read_text(encoding="utf-8")
        meta = _parse_metadata(text)
        chunks = splitter.split_text(text)

        for i, chunk in enumerate(chunks):
            docs.append(chunk)
            metadatas.append(meta)
            ids.append(f"{meta['doc_id']}-chunk-{i}")

    vectors = embeddings.embed_documents(docs)

    collection.add(
        documents=docs,
        embeddings=vectors,
        metadatas=metadatas,
        ids=ids,
    )

    print(f"[KB] Ingested {len(docs)} chunks from {DOCS_DIR}.")
