export type { Currency } from './utils/currency';

export interface Expense {
  id: number;
  amount: number;
  currency?: string;
  category: string;
  date: string;
  description: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseFormData {
  amount: string | number;
  currency?: string;
  category: string;
  date: string;
  description: string;
  notes?: string;
}

export interface ExpenseFilters {
  category: string;
  search: string;
  start_date: string;
  end_date: string;
  sort_by: 'date' | 'amount' | 'category';
  sort_order: 'asc' | 'desc';
}

export interface MonthlyBreakdownItem {
  month: string;
  total: number;
  count: number;
}

export interface CategoryBreakdownItem {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

export interface ExpenseSummary {
  total_amount: number;
  total_count: number;
  current_month_total: number;
  monthly_breakdown: MonthlyBreakdownItem[];
  category_breakdown: CategoryBreakdownItem[];
}
