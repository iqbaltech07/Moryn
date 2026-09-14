from typing import List, Optional, Literal
from pydantic import BaseModel, Field

class KanbanTask(BaseModel):
    id: str = Field(description="Unique task ID, e.g. T-1.1")
    title: str = Field(description="Imperative task title, e.g. Setup Prisma schema and connection")
    description: Optional[str] = Field(default=None, description="Detailed technical instructions")
    estimasi: Optional[str] = Field(default="15m", description="Estimated completion time")
    tags: List[str] = Field(default_factory=list, description="Categorization tags")
    isCheckpoint: bool = Field(default=False, description="Whether this task is a critical verification milestone")
    definitionOfDone: Optional[str] = Field(default=None, description="Criteria for task completion")

class PhaseGroup(BaseModel):
    id: str = Field(description="Phase ID e.g. phase-1")
    name: str = Field(description="Phase title e.g. Phase 1: Environment & Core Setup")
    description: Optional[str] = None
    tasks: List[KanbanTask]

class TasksData(BaseModel):
    phases: List[PhaseGroup]

class TasksGenerateRequest(BaseModel):
    appName: Optional[str] = None
    appIdea: str
    stacks: Optional[dict] = None
    coreFeatures: Optional[List[str]] = None
    integrations: Optional[str] = None
    strukturSummary: Optional[str] = None
    designSnippet: Optional[str] = None
    prdMarkdown: Optional[str] = None
    currentTaskData: Optional[dict] = None
    forceSync: Optional[bool] = False
    language: Optional[Literal["en", "id"]] = "en"

class TasksGenerateResponse(BaseModel):
    data: TasksData
