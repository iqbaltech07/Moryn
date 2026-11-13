from typing import List, Optional
from pydantic import BaseModel, Field


class DatabaseField(BaseModel):
    name: str
    type: str = "string"
    is_pk: bool = False
    is_fk: bool = False
    is_uk: bool = False
    comment: Optional[str] = None


class DatabaseEntity(BaseModel):
    name: str
    fields: List[DatabaseField] = Field(default_factory=list)
    relationships: List[str] = Field(default_factory=list)


class ApiEndpoint(BaseModel):
    method: str
    path: str
    request_payload: Optional[str] = None
    response_schema: Optional[str] = None
    description: Optional[str] = None


class TechStackItem(BaseModel):
    category: str
    details: str


class InvariantContract(BaseModel):
    version: str = "1.0.0"
    database_entities: List[DatabaseEntity] = Field(default_factory=list)
    api_endpoints: List[ApiEndpoint] = Field(default_factory=list)
    tech_stack: List[TechStackItem] = Field(default_factory=list)


class ContractCompliance(BaseModel):
    is_compliant: bool = True
    score: float = 1.0  # 0.0 to 1.0
    covered_endpoints: List[str] = Field(default_factory=list)
    missing_endpoints: List[str] = Field(default_factory=list)
    covered_entities: List[str] = Field(default_factory=list)
    missing_entities: List[str] = Field(default_factory=list)
    auto_reconciled_count: int = 0
    drift_notes: List[str] = Field(default_factory=list)

