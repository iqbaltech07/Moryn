from typing import List, Literal, Optional, Dict
from pydantic import BaseModel, Field

class QuestionItem(BaseModel):
    key: str = Field(description="CamelCase identifier for the question, e.g. targetAudience")
    title: str = Field(description="The question title/prompt itself")
    subtitle: str = Field(description="Short explanatory context for the user")
    type: Literal["single", "multiple"] = Field(description="Choice type")
    options: List[str] = Field(description="List of 4-7 possible answers")

class QuestionsGenerateRequest(BaseModel):
    appName: Optional[str] = None
    appIdea: str
    stacks: Optional[Dict[str, Optional[str]]] = None

class QuestionsGenerateResponse(BaseModel):
    questions: List[QuestionItem]
