export type TaskType = 'feature' | 'modification' | 'bug_fix' | 'refactor' | 'requirement_change';
export type TaskStatus = 'pending' | 'in_progress' | 'implemented' | 'failed';

export interface VerificationEvidence {
  syntax_verified: boolean;
  build_verified: boolean;
  lint_passed: boolean;
  sqlite_connected?: boolean;
  initial_rows_seeded?: number;
  verification_log: string;
}

export interface TesterContract {
  ready_for_testing: boolean;
  notes_for_phase3_tester: string;
  suggested_test_types: string[];
  affected_endpoints: string[];
  affected_components: string[];
  known_edge_cases: string[];
}

export interface OrchestratorContract {
  agent_id: string;
  phase: number;
  ready_for_review: boolean;
  orchestrator_handoff_state: string;
  blockers: string[];
  recommended_next_step: string;
}

export interface DeveloperArtifact {
  artifact_id: string;
  task_id: string;
  timestamp: string;
  author: string;
  phase: number;
  status: TaskStatus | 'IMPLEMENTED';
  task_details: {
    title: string;
    type: TaskType;
    requirements: string[];
  };
  files_created: string[];
  files_modified: string[];
  changeset_summary: string;
  verification: VerificationEvidence;
  tester_contract: TesterContract;
  orchestrator_contract: OrchestratorContract;
  human_supervision_notice: string;
}

export interface AgentSystemStatus {
  current_phase: number;
  phase_name: string;
  active_specialist: string;
  system_status: string;
  agents: {
    orchestrator: {
      status: string;
      phase: number;
      description: string;
    };
    developer: {
      status: string;
      phase: number;
      description: string;
    };
    tester: {
      status: string;
      phase: number;
      description: string;
    };
  };
  human_checkin_policy: {
    mode: string;
    git_managed_by: string;
    autonomous_push: boolean;
    next_step: string;
  };
}
