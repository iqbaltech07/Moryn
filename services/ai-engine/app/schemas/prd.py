from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class PRDGenerateRequest(BaseModel):
    projectId: Optional[str] = None
    appName: Optional[str] = None
    appIdea: str
    stacks: Optional[Dict[str, Optional[str]]] = None
    dynamicAnswers: Optional[Dict[str, Any]] = None
    designPreference: Optional[str] = None
    customPrompt: Optional[str] = None
    targetPlatform: Optional[str] = None
    structureContext: Optional[str] = Field(default=None, description="Generated feature structure mindmap context to align PRD")

class PRDGenerateResponse(BaseModel):
    markdown: str = Field(description="Complete 10-Section PRD Markdown content")
    appName: Optional[str] = None
    modelUsed: str = Field(description="The exact AI model name that synthesized the document")

class EditPrdRequest(BaseModel):
    currentPrd: str
    instruction: str
    appName: Optional[str] = None
    isEditIntent: Optional[bool] = False

class EditPrdResponse(BaseModel):
    reply: str
    isPrdUpdated: bool
    updatedMarkdown: Optional[str] = None
    modelUsed: str = "gemini"

