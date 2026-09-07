import React, { useState } from 'react';
import { Search, Filter, Trash2, Edit3, ArrowUpDown, Calendar, X } from 'lucide-react';
import { Expense, ExpenseFilters } from '../types';

interface ExpenseListProps {
  expenses: Expense[];
  loading: boolean;
  filters: ExpenseFilters;
  categories: string[];
  onFilterChange: (filters: ExpenseFilters) => void;
  onEdit: (expense: Expense) => void;
  onDelete: (id: number) => void;
}

const CATEGORY_BADGES: Record<string, string> = {
  'Food & Dining': 'bg-amber-50 text-amber-800 border-amber-200',
  'Transportation': 'bg-blue-50 text-blue-800 border-blue-200',
  'Housing': 'bg-purple-50 text-purple-800 border-purple-200',
  'Utilities': 'bg-cyan-50 text-cyan-800 border-cyan-200',
  'Entertainment': 'bg-pink-50 text-pink-800 border-pink-200',
  'Healthcare': 'bg-rose-50 text-rose-800 border-rose-200',
  'Shopping': 'bg-indigo-50 text-indigo-800 border-indigo-200',
  'Education': 'bg-emerald-50 text-emerald-800 border-emerald-200',
  'Personal': 'bg-teal-50 text-teal-800 border-teal-200',
  'Other': 'bg-slate-100 text-slate-800 border-slate-200',
};

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  loading,
  filters,
  categories,
  onFilterChange,
  onEdit,
  onDelete,
}) => {
  const [deleteCandidateId, setDeleteCandidateId] = useState<number | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, category: e.target.value });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, start_date: e.target.value });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, end_date: e.target.value });
  };

  const toggleSortOrder = () => {
    onFilterChange({
      ...filters,
      sort_order: filters.sort_order === 'desc' ? 'asc' : 'desc',
    });
  };

  const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      sort_by: e.target.value as 'date' | 'amount' | 'category',
    });
  };

  const resetFilters = () => {
    onFilterChange({
      category: 'All',
      search: '',
      start_date: '',
      end_date: '',
      sort_by: 'date',
      sort_order: 'desc',
    });
  };

  const hasActiveFilters =
    filters.category !== 'All' ||
    filters.search !== '' ||
    filters.start_date !== '' ||
    filters.end_date !== '';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Filters & Search Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Expenses Log</h2>
            <p className="text-xs text-slate-700">
              Filtered records: {expenses.length} total
            </p>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center space-x-1 text-xs text-slate-700 hover:text-slate-900 font-medium self-start sm:self-auto cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              id="input-search-expenses"
              type="text"
              placeholder="Search description..."
              value={filters.search}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <select
              id="select-category-filter"
              value={filters.category}
              onChange={handleCategoryChange}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              id="input-start-date"
              type="date"
              value={filters.start_date}
              onChange={handleStartDateChange}
              title="From date"
              className="w-full pl-8 pr-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* End Date */}
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              id="input-end-date"
              type="date"
              value={filters.end_date}
              onChange={handleEndDateChange}
              title="To date"
              className="w-full pl-8 pr-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Sort Control */}
          <div className="flex items-center space-x-1">
            <select
              id="select-sort-by"
              value={filters.sort_by}
              onChange={handleSortByChange}
              className="flex-1 px-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="category">Sort by Category</option>
            </select>
            <button
              id="btn-toggle-sort-order"
              type="button"
              onClick={toggleSortOrder}
              title={`Order: ${filters.sort_order.toUpperCase()}`}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Expense Items List */}
      {loading ? (
        <div className="p-8 text-center text-slate-700 text-sm">
          Loading expenses from SQLite...
        </div>
      ) : expenses.length === 0 ? (
        <div className="py-16 text-center px-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-3">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No expenses found</h3>
          <p className="text-xs text-slate-700 mt-1 max-w-sm mx-auto">
            {hasActiveFilters
              ? 'Try adjusting your filters or search terms to find matching entries.'
              : 'Add your first expense record to begin tracking your personal spending.'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="mt-3 inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {expenses.map((expense) => {
            const badgeClass =
              CATEGORY_BADGES[expense.category] ||
              'bg-slate-100 text-slate-800 border-slate-200';

            return (
              <div
                key={expense.id}
                id={`expense-row-${expense.id}`}
                className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/75 transition-colors"
              >
                {/* Left details */}
                <div className="flex items-start space-x-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-700 font-mono">
                      {expense.date}
                    </span>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${badgeClass} w-fit`}
                    >
                      {expense.category}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">
                      {expense.description}
                    </h4>
                    {expense.notes && (
                      <p className="text-xs text-slate-700 mt-0.5 max-w-md line-clamp-1">
                        {expense.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right actions and amount */}
                <div className="flex items-center justify-between sm:justify-end space-x-4">
                  <span className="text-base font-bold text-slate-900">
                    ${expense.amount.toFixed(2)}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      id={`btn-edit-${expense.id}`}
                      onClick={() => onEdit(expense)}
                      className="p-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                      title="Edit expense"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      id={`btn-delete-${expense.id}`}
                      onClick={() => setDeleteCandidateId(expense.id)}
                      className="p-1.5 rounded text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidateId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Delete Expense
            </h3>
            <p className="text-sm text-slate-700 mt-2">
              Are you sure you want to permanently delete this expense from the SQLite database? This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setDeleteCandidateId(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete(deleteCandidateId);
                  setDeleteCandidateId(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
