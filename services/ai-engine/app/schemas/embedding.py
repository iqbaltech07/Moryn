from typing import List, Optional
from pydantic import BaseModel, Field

class EmbeddingRequest(BaseModel):
    texts: List[str] = Field(description="List of text chunks to embed")
    model: Optional[str] = Field(default="gemini-embedding-001", description="Gemini embedding model")

class EmbeddingResponse(BaseModel):
    embeddings: List[List[float]] = Field(description="List of 768-dim float vectors")
    modelUsed: str = "gemini-embedding-001"
    count: int
