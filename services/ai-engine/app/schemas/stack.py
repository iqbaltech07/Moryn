from typing import Optional, Dict
from pydantic import BaseModel, Field

class TechStackGroup(BaseModel):
    frontend: str = Field(description="Recommended frontend framework")
    backend: str = Field(description="Recommended backend framework")
    database: str = Field(description="Recommended database")
    deployment: str = Field(description="Recommended deployment target")

class RecommendStackRequest(BaseModel):
    appName: Optional[str] = None
    appIdea: str
    existingStacks: Optional[Dict[str, Optional[str]]] = None

class RecommendStackResponse(BaseModel):
    stacks: TechStackGroup
    paletteId: str = Field(description="amber-cyber, ocean-indigo, electric-emerald, neon-violet, or crimson-coral")
    badge: str = Field(description="Short categorization badge e.g. Fullstack Serverless")
    reasoning: str = Field(description="1-2 concise sentences in Indonesian explaining the recommendation")
