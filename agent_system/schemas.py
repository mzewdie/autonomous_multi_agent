from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class TaskType(str, Enum):
    FEATURE = "feature"
    MODIFICATION = "modification"
    BUG_FIX = "bug_fix"
    REFACTOR = "refactor"
    REQUIREMENT_CHANGE = "requirement_change"

class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    IMPLEMENTED = "implemented"
    FAILED = "failed"

class DeveloperTask(BaseModel):
    task_id: str
    title: str
    description: str
    task_type: TaskType
    status: TaskStatus = TaskStatus.PENDING
    requirements: List[str]
    target_components: List[str]
    context: Optional[Dict[str, Any]] = None

class VerificationEvidence(BaseModel):
    syntax_verified: bool = True
    build_verified: bool = True
    lint_passed: bool = True
    unit_checks: List[str] = Field(default_factory=list)
    verification_log: str

# Deliberately prepared interface for Phase 3 Tester Agent
class TesterContract(BaseModel):
    ready_for_testing: bool = True
    suggested_test_types: List[str] = Field(
        default_factory=lambda: ["api_contract", "data_integrity", "ui_interaction", "edge_case"]
    )
    affected_endpoints: List[str] = Field(default_factory=list)
    affected_components: List[str] = Field(default_factory=list)
    assertions_to_verify: List[str] = Field(default_factory=list)
    known_edge_cases: List[str] = Field(default_factory=list)

# Deliberately prepared interface for Phase 2 Orchestrator Agent
class OrchestratorContract(BaseModel):
    agent_id: str = "DEVELOPER_AGENT"
    phase: int = 1
    ready_for_review: bool = True
    blockers: List[str] = Field(default_factory=list)
    recommended_next_step: str = "Awaiting human review / Phase 2 Orchestrator dispatch"

class DeveloperArtifact(BaseModel):
    artifact_id: str
    task_id: str
    timestamp: str
    author: str = "DEVELOPER_AGENT"
    status: TaskStatus
    modified_files: List[str]
    created_files: List[str]
    changeset_summary: str
    verification: VerificationEvidence
    tester_contract: TesterContract
    orchestrator_contract: OrchestratorContract
    human_supervision_notice: str
