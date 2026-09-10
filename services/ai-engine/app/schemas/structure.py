from typing import List, Optional
from pydantic import BaseModel, Field

class ChildNode(BaseModel):
    id: str
    label: str

class StructureNode(BaseModel):
    id: str
    label: str
    phase: int
    color: Optional[str] = None
    children: List[ChildNode] = Field(default_factory=list)

class StrukturData(BaseModel):
    title: str
    description: str
    nodes: List[StructureNode]

class StrukturGenerateRequest(BaseModel):
    appName: Optional[str] = None
    appIdea: str
    stacks: Optional[dict] = None
    prdMarkdown: Optional[str] = None
    dynamicAnswers: Optional[dict] = None

class StrukturGenerateResponse(BaseModel):
    data: StrukturData
