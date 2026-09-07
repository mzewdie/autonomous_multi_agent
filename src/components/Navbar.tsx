import React from 'react';
import { Wallet, Plus, Cpu, Layers } from 'lucide-react';

interface NavbarProps {
  onOpenAddModal: () => void;
  onOpenAgentDrawer: () => void;
  agentStatusText?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddModal,
  onOpenAgentDrawer,
  agentStatusText = 'Phase 1: Developer Agent'
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Context */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Expense Tracker
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  SQLite + FastAPI
                </span>
              </div>
              <p className="text-xs text-slate-700 hidden sm:block">
                Target Validation Application • Personal Expense Tracker
              </p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Agent System Protocol Badge & Trigger */}
            <button
              id="btn-agent-system"
              onClick={onOpenAgentDrawer}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
              title="Inspect autonomous multi-agent system state, Developer Agent logs, and prepared interfaces"
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
              <span className="font-semibold text-slate-900">{agentStatusText}</span>
              <Layers className="w-3 h-3 text-slate-600 hidden md:inline" />
            </button>

            {/* Add Expense Button */}
            <button
              id="btn-add-expense"
              onClick={onOpenAddModal}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
