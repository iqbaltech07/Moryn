from typing import List, Literal, Optional, Dict
from pydantic import BaseModel, Field

class QuestionItem(BaseModel):
    key: str = Field(description="Identifier for the question, e.g. primaryPersona")
    title: str = Field(description="The question title/prompt itself")
    subtitle: str = Field(description="Short explanatory context for the user")
    type: Literal["single", "multiple", "essay"] = Field(description="Question type")
    options: List[str] = Field(default_factory=list, description="List of possible answers for single/multiple choice")
    placeholder: Optional[str] = Field(default=None, description="Guidance placeholder for essay type")
    hasConditionalInput: Optional[bool] = Field(default=None, description="Whether question triggers dynamic input")
    conditionalTriggerValue: Optional[str] = Field(default=None, description="Trigger value, e.g. 'Yes'")
    conditionalInputLabel: Optional[str] = Field(default=None, description="Label for conditional input")
    conditionalInputPlaceholder: Optional[str] = Field(default=None, description="Placeholder for conditional input")
    conditionalInputType: Optional[Literal["text", "textarea"]] = Field(default=None, description="Input type for follow-up")

class QuestionsGenerateRequest(BaseModel):
    appName: Optional[str] = None
    appIdea: str
    stacks: Optional[Dict[str, Optional[str]]] = None
    language: Optional[Literal["en", "id"]] = "en"

class QuestionsGenerateResponse(BaseModel):
    questions: List[QuestionItem]
