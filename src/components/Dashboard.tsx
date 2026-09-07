import React from 'react';
import { TrendingUp, Calendar, PieChart } from 'lucide-react';
import { ExpenseSummary } from '../types';
import { Currency, formatCurrency } from '../utils/currency';

interface DashboardProps {
  summary: ExpenseSummary | null;
  loading: boolean;
  currency: Currency;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': 'bg-amber-500',
  'Transportation': 'bg-blue-500',
  'Housing': 'bg-purple-500',
  'Utilities': 'bg-cyan-500',
  'Entertainment': 'bg-pink-500',
  'Healthcare': 'bg-rose-500',
  'Shopping': 'bg-indigo-500',
  'Education': 'bg-emerald-500',
  'Personal': 'bg-teal-500',
  'Other': 'bg-slate-400',
};

export const Dashboard: React.FC<DashboardProps> = ({ summary, loading, currency }) => {
  if (loading || !summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-3"></div>
            <div className="h-7 bg-slate-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const averageExpense =
    summary.total_count > 0 ? summary.total_amount / summary.total_count : 0;

  // Find max monthly total to scale monthly bars
  const maxMonthTotal = Math.max(
    ...summary.monthly_breakdown.map((m) => m.total),
    1
  );

  return (
    <div className="space-y-6 mb-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spending */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Total Recorded
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-sm">
              {currency.symbol}
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">
              {formatCurrency(summary.total_amount, currency)}
            </span>
            <span className="text-xs text-slate-700">
              {summary.total_count} transactions
            </span>
          </div>
        </div>

        {/* Current Month Spending */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              This Month
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">
              {formatCurrency(summary.current_month_total, currency)}
            </span>
            <span className="text-xs text-blue-700 font-medium">
              Current Cycle
            </span>
          </div>
        </div>

        {/* Average Transaction */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Average Expense
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">
              {formatCurrency(averageExpense, currency)}
            </span>
            <span className="text-xs text-slate-700">
              Per entry
            </span>
          </div>
        </div>

        {/* Top Category */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Top Category
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-lg font-bold text-slate-900 block truncate">
              {summary.category_breakdown[0]?.category || 'None'}
            </span>
            <span className="text-xs text-slate-700">
              {summary.category_breakdown[0]
                ? `${formatCurrency(summary.category_breakdown[0].total, currency)} (${summary.category_breakdown[0].percentage}%)`
                : 'No data'}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Breakdowns: Monthly Totals & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Spending Totals */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Monthly Spending Totals</h2>
              <p className="text-xs text-slate-700">Historical monthly expense aggregation from SQLite</p>
            </div>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              {summary.monthly_breakdown.length} Months Tracked
            </span>
          </div>

          {summary.monthly_breakdown.length === 0 ? (
            <div className="py-12 text-center text-slate-700 text-sm">
              No monthly expense data recorded yet.
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {summary.monthly_breakdown.map((item) => {
                const percentageOfMax = Math.round((item.total / maxMonthTotal) * 100);
                return (
                  <div key={item.month} className="group">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-800">{item.month}</span>
                      <div className="space-x-2">
                        <span className="text-slate-700">{item.count} items</span>
                        <span className="font-bold text-slate-900">
                          {formatCurrency(item.total, currency)}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${Math.max(percentageOfMax, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Category Distribution</h2>
              <p className="text-xs text-slate-700">Proportional spend by expense classification</p>
            </div>
          </div>

          {summary.category_breakdown.length === 0 ? (
            <div className="py-12 text-center text-slate-700 text-sm">
              No category breakdown available.
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {summary.category_breakdown.slice(0, 6).map((item) => {
                const barColor = CATEGORY_COLORS[item.category] || 'bg-slate-400';
                return (
                  <div key={item.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${barColor}`} />
                        <span className="font-medium text-slate-800">{item.category}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-700">{item.percentage}%</span>
                        <span className="font-bold text-slate-900">
                          {formatCurrency(item.total, currency)}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColor}`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
