import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { ExpenseList } from './components/ExpenseList';
import { ExpenseModal } from './components/ExpenseModal';
import { AgentStatusDrawer } from './components/AgentStatusDrawer';
import { Expense, ExpenseFilters, ExpenseFormData, ExpenseSummary } from './types';
import { Currency, getSavedCurrency, saveCurrency } from './utils/currency';
import { CheckCircle, AlertCircle, Info, ArrowUpRight } from 'lucide-react';

export default function App() {
  const [currency, setCurrency] = useState<Currency>(() => getSavedCurrency());
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [categories, setCategories] = useState<string[]>([
    'Food & Dining',
    'Transportation',
    'Housing',
    'Utilities',
    'Entertainment',
    'Healthcare',
    'Shopping',
    'Education',
    'Personal',
    'Other'
  ]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [isAgentDrawerOpen, setIsAgentDrawerOpen] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [filters, setFilters] = useState<ExpenseFilters>({
    category: 'All',
    search: '',
    start_date: '',
    end_date: '',
    sort_by: 'date',
    sort_order: 'desc',
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch summary
  const loadSummary = useCallback(async () => {
    try {
      const res = await fetch('/api/expenses/summary');
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (err) {
      console.error('Error loading expense summary:', err);
    }
  }, []);

  // Fetch categories
  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/expenses/categories');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  }, []);

  // Fetch filtered expenses
  const loadExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category && filters.category !== 'All') {
        params.append('category', filters.category);
      }
      if (filters.search.trim()) {
        params.append('search', filters.search.trim());
      }
      if (filters.start_date) {
        params.append('start_date', filters.start_date);
      }
      if (filters.end_date) {
        params.append('end_date', filters.end_date);
      }
      params.append('sort_by', filters.sort_by);
      params.append('sort_order', filters.sort_order);

      const res = await fetch(`/api/expenses?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
      } else {
        showToast('error', 'Failed to fetch expenses from backend API.');
      }
    } catch (err: any) {
      console.error('Error fetching expenses:', err);
      showToast('error', 'Unable to reach backend SQLite/FastAPI service.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadCategories();
    loadSummary();
  }, [loadCategories, loadSummary]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  // Create or Update Expense
  const handleSaveExpense = async (formData: ExpenseFormData, id?: number) => {
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/expenses/${id}` : '/api/expenses';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to save expense');
    }

    showToast(
      'success',
      id ? 'Expense record updated successfully.' : 'New expense recorded in SQLite.'
    );
    loadExpenses();
    loadSummary();
  };

  // Delete Expense
  const handleDeleteExpense = async (id: number) => {
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('success', 'Expense removed from database.');
        loadExpenses();
        loadSummary();
      } else {
        showToast('error', 'Could not delete expense.');
      }
    } catch (err) {
      showToast('error', 'Failed to delete expense.');
    }
  };

  const handleEditClick = (expense: Expense) => {
    setExpenseToEdit(expense);
    setIsAddModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setExpenseToEdit(null);
    setIsAddModalOpen(true);
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    saveCurrency(newCurrency.code);
    showToast('success', `Display currency updated to ${newCurrency.name} (${newCurrency.symbol})`);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Primary Header */}
      <Navbar
        onOpenAddModal={handleOpenAddModal}
        onOpenAgentDrawer={() => setIsAgentDrawerOpen(true)}
        currentCurrency={currency}
        onCurrencyChange={handleCurrencyChange}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Toast Alert */}
        {toast && (
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-150 ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              {toast.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          </div>
        )}

        {/* Phase 1 Multi-Agent System Context Banner */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-slate-900">
                  Target Application: Personal Expense Tracker
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Phase 1 Output
                </span>
              </div>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed max-w-3xl">
                This application serves as the verification target for the autonomous multi-agent development system.
                The Developer Agent has completed full React frontend views, FastAPI backend routes, and SQLite schema persistence.
                Now extended with multi-currency support ($ USD, € EUR, and modular future currencies).
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAgentDrawerOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <span>Agent Architecture & Contracts</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dashboard Component (Summary cards, monthly totals, category distribution) */}
        <Dashboard summary={summary} loading={loading && !summary} currency={currency} />

        {/* Expense List Component (Search, filters, table/cards, actions) */}
        <ExpenseList
          expenses={expenses}
          loading={loading}
          filters={filters}
          categories={categories}
          currency={currency}
          onFilterChange={setFilters}
          onEdit={handleEditClick}
          onDelete={handleDeleteExpense}
        />
      </main>

      {/* Add / Edit Expense Modal */}
      <ExpenseModal
        isOpen={isAddModalOpen}
        expenseToEdit={expenseToEdit}
        categories={categories}
        currency={currency}
        onClose={() => {
          setIsAddModalOpen(false);
          setExpenseToEdit(null);
        }}
        onSubmit={handleSaveExpense}
      />

      {/* Agent System Inspector Drawer */}
      <AgentStatusDrawer
        isOpen={isAgentDrawerOpen}
        onClose={() => setIsAgentDrawerOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-700 gap-2">
          <div className="flex items-center space-x-2">
            <span>Autonomous Software Development System</span>
            <span>•</span>
            <span>Google AI Studio & ADK Architecture</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-700">
            <span>Phase 1: Developer Agent</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold">SQLite Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
