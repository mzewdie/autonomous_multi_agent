import React, { useState, useEffect } from 'react';
import { X, Cpu, CheckCircle2, AlertTriangle, GitBranch, ArrowRight, ShieldCheck, Terminal, FileCode2, Clock } from 'lucide-react';
import { AgentSystemStatus, DeveloperArtifact } from '../../agent_system/types';

interface AgentStatusDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const PHASES = [
  { id: 1, title: 'Phase 1: Developer Agent', desc: 'Application development, schema contracts, initial validation', status: 'ACTIVE' },
  { id: 2, title: 'Phase 2: Orchestrator Agent', desc: 'Workflow coordinator managing Developer dispatch', status: 'PREPARED' },
  { id: 3, title: 'Phase 3: Tester Agent', desc: 'Independent verification, automated test suites', status: 'PREPARED' },
  { id: 4, title: 'Phase 4: Human Check-in & Bugs', desc: 'Structured bug lifecycle and manual confirmation', status: 'PLANNED' },
  { id: 5, title: 'Phase 5: Dev ↔ Test Cycles', desc: 'Autonomous implementation and verification loops', status: 'PLANNED' },
  { id: 6, title: 'Phase 6: Limits & Checkpointing', desc: 'Quota recovery, cycle thresholds, state preservation', status: 'PLANNED' },
  { id: 7, title: 'Phase 7: Central Dashboard', desc: 'Project-wide analytics, bug matrices, telemetry', status: 'PLANNED' },
];

export const AgentStatusDrawer: React.FC<AgentStatusDrawerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'artifacts' | 'contracts'>('architecture');
  const [statusData, setStatusData] = useState<AgentSystemStatus | null>(null);
  const [artifacts, setArtifacts] = useState<DeveloperArtifact[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      Promise.all([
        fetch('/api/agent/status').then((res) => (res.ok ? res.json() : null)),
        fetch('/api/agent/artifacts').then((res) => (res.ok ? res.json() : null)),
      ])
        .then(([status, artData]) => {
          if (status) setStatusData(status);
          if (artData && artData.artifacts) setArtifacts(artData.artifacts);
        })
        .catch((err) => console.error('Error fetching agent state:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold tracking-tight">Autonomous Multi-Agent System</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  PHASE 1 ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Google AI Studio • Specialist Agent Architecture Layer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-3 text-xs font-semibold border-b-2 mr-6 transition-colors cursor-pointer ${
              activeTab === 'architecture'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            System Architecture & Phases
          </button>
          <button
            onClick={() => setActiveTab('artifacts')}
            className={`py-3 text-xs font-semibold border-b-2 mr-6 transition-colors cursor-pointer ${
              activeTab === 'artifacts'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Developer Agent Artifacts ({artifacts.length})
          </button>
          <button
            onClick={() => setActiveTab('contracts')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'contracts'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Prepared Interfaces (Phases 2 & 3)
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-20 text-center text-slate-500 text-sm">
              Querying agent state and artifacts...
            </div>
          ) : activeTab === 'architecture' ? (
            <div className="space-y-6">
              {/* Concept Diagram */}
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3 font-mono text-xs">
                <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  Conceptual Communication Flow
                </div>
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex items-center space-x-2">
                    <span className="text-emerald-400 font-bold">HUMAN</span>
                    <span className="text-slate-500">→</span>
                    <span className="text-blue-400 font-bold">AI STUDIO MASTER DEVELOPMENT AGENT</span>
                  </div>
                  <div className="pl-6 text-slate-500">↓ (Translates intent into structured dev actions)</div>
                  <div className="pl-6 flex items-center space-x-2">
                    <span className="text-purple-400 font-bold">MULTI-AGENT SYSTEM</span>
                  </div>
                  <div className="pl-12 text-slate-500">↓</div>
                  <div className="pl-12 flex items-center space-x-2">
                    <span className="text-amber-400 font-bold">ORCHESTRATOR AGENT</span>
                    <span className="text-slate-500 text-[10px]">(Phase 2 interface prepared)</span>
                  </div>
                  <div className="pl-18 text-slate-500">├── DEVELOPER AGENT (Active in Phase 1)</div>
                  <div className="pl-18 text-slate-500">└── TESTER AGENT (Phase 3 interface prepared)</div>
                </div>
              </div>

              {/* Incremental Phase Matrix */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Incremental Development Progression
                </h3>
                <div className="space-y-2">
                  {PHASES.map((phase) => (
                    <div
                      key={phase.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between ${
                        phase.status === 'ACTIVE'
                          ? 'bg-emerald-50/50 border-emerald-300 shadow-xs'
                          : phase.status === 'PREPARED'
                          ? 'bg-indigo-50/30 border-indigo-200'
                          : 'bg-slate-50 border-slate-200 opacity-70'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-900">{phase.title}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              phase.status === 'ACTIVE'
                                ? 'bg-emerald-600 text-white'
                                : phase.status === 'PREPARED'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {phase.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{phase.desc}</p>
                      </div>
                      {phase.status === 'ACTIVE' && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Human Role Notice */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Phase 1 Human Operational Responsibility
                  </span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Per the development philosophy, the human deliberately retains manual GitHub check-in, requirement clarification, and pause/resume authority. Agents do not execute autonomous GitHub pushes directly.
                </p>
              </div>
            </div>
          ) : activeTab === 'artifacts' ? (
            <div className="space-y-6">
              {artifacts.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No artifacts logged yet.
                </div>
              ) : (
                artifacts.map((art) => (
                  <div key={art.artifact_id} className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                            {art.artifact_id}
                          </span>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            {art.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">
                          {art.task_details?.title}
                        </h4>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(art.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="font-semibold text-slate-800 block mb-1">Changeset Summary:</span>
                      {art.changeset_summary}
                    </div>

                    {/* Verification Evidence */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Developer Self-Verification Evidence</span>
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded bg-emerald-50 text-emerald-800 flex items-center space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>SQLite DB Operational</span>
                        </div>
                        <div className="p-2 rounded bg-emerald-50 text-emerald-800 flex items-center space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>FastAPI Routes Verified</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono bg-slate-100 p-2 rounded">
                        {art.verification?.verification_log}
                      </p>
                    </div>

                    {/* Files Inventory */}
                    <div>
                      <span className="text-xs font-semibold text-slate-700 block mb-1">
                        Files Created & Managed ({art.files_created?.length || 0}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {art.files_created?.map((file) => (
                          <span
                            key={file}
                            className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {file}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Orchestrator Interface Contract */}
              <div className="p-5 rounded-xl border border-indigo-200 bg-indigo-50/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Phase 2: Orchestrator Agent Contract
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                    READY FOR DISPATCH
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Pre-configured interface for when Orchestrator is introduced in Phase 2 to manage Developer Agent tasks and cycle transitions.
                </p>
                <div className="bg-slate-900 text-slate-300 p-3 rounded-lg font-mono text-xs space-y-1">
                  <div>// agent_system/schemas.py → OrchestratorContract</div>
                  <div className="text-emerald-400">ready_for_review: true</div>
                  <div className="text-indigo-400">orchestrator_handoff_state: &quot;IMPLEMENTATION_READY_FOR_ORCHESTRATION&quot;</div>
                  <div>recommended_next_step: &quot;Phase 2: Introduce Orchestrator Agent&quot;</div>
                </div>
              </div>

              {/* Tester Interface Contract */}
              <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Phase 3: Tester Agent Contract
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    TEST HANDOFF DEFINED
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Defines the exact test requirements and endpoints exposed by the Developer Agent so Phase 3 Tester Agent can independently verify without human prompts.
                </p>
                <div className="bg-slate-900 text-slate-300 p-3 rounded-lg font-mono text-xs space-y-1">
                  <div>// agent_system/schemas.py → TesterContract</div>
                  <div className="text-emerald-400">ready_for_testing: true</div>
                  <div className="text-amber-400">suggested_test_types: [&quot;api_contract&quot;, &quot;sqlite_crud&quot;, &quot;date_boundary&quot;]</div>
                  <div>affected_endpoints: [&quot;GET/POST/PUT/DELETE /api/expenses&quot;, &quot;GET /api/expenses/summary&quot;]</div>
                  <div className="text-rose-400">known_edge_cases: [&quot;negative amounts&quot;, &quot;future dates&quot;, &quot;SQL sanitization&quot;]</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Target Application: Personal Expense Tracker</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
