// Types and interfaces for the finance app

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  description: string;
  date: string; // ISO date string
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
  budget?: number; // Monthly budget for expense categories
  isDefault?: boolean;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  startDate: string;
  endDate?: string;
  alertThreshold?: number; // Percentage (e.g., 80 for 80%)
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  icon: string;
  color: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'card' | 'ewallet' | 'investment';
  balance: number;
  currency: string;
  icon: string;
  color: string;
  isDefault: boolean;
}

export interface UserPreferences {
  currency: string;
  language: string;
  theme: 'light' | 'dark' | 'system';
  dateFormat: string;
  firstDayOfWeek: 0 | 1; // 0 = Sunday, 1 = Monday
  notifications: {
    budgetAlerts: boolean;
    transactionReminders: boolean;
    weeklyReports: boolean;
    monthlyReports: boolean;
  };
}

export interface AppState {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  accounts: Account[];
  preferences: UserPreferences;
}

// Default categories
export const DEFAULT_CATEGORIES: Category[] = [
  // Expense categories
  { id: 'food', name: 'Makanan & Minuman', icon: '🍔', color: '#ef4444', type: 'expense', isDefault: true },
  { id: 'transport', name: 'Transportasi', icon: '🚌', color: '#f97316', type: 'expense', isDefault: true },
  { id: 'shopping', name: 'Belanja', icon: '🛍️', color: '#ec4899', type: 'expense', isDefault: true },
  { id: 'entertainment', name: 'Hiburan', icon: '🎮', color: '#8b5cf6', type: 'expense', isDefault: true },
  { id: 'health', name: 'Kesehatan', icon: '🏥', color: '#06b6d4', type: 'expense', isDefault: true },
  { id: 'education', name: 'Pendidikan', icon: '📚', color: '#84cc16', type: 'expense', isDefault: true },
  { id: 'bills', name: 'Tagihan & Bayar', icon: '📄', color: '#64748b', type: 'expense', isDefault: true },
  { id: 'travel', name: 'Perjalanan', icon: '✈️', color: '#f59e0b', type: 'expense', isDefault: true },
  { id: 'personal', name: 'Pribadi', icon: '👤', color: '#14b8a6', type: 'expense', isDefault: true },
  { id: 'others-expense', name: 'Lainnya', icon: '📦', color: '#94a3b8', type: 'expense', isDefault: true },
  
  // Income categories
  { id: 'salary', name: 'Gaji', icon: '💰', color: '#22c55e', type: 'income', isDefault: true },
  { id: 'freelance', name: 'Freelance', icon: '💻', color: '#16a34a', type: 'income', isDefault: true },
  { id: 'investment', name: 'Investasi', icon: '📈', color: '#15803d', type: 'income', isDefault: true },
  { id: 'gift', name: 'Hadiah', icon: '🎁', color: '#166534', type: 'income', isDefault: true },
  { id: 'others-income', name: 'Lainnya', icon: '💵', color: '#14532d', type: 'income', isDefault: true },
];

// Default accounts
export const DEFAULT_ACCOUNTS: Account[] = [
  { id: 'cash', name: 'Tunai', type: 'cash', balance: 0, currency: 'IDR', icon: '💵', color: '#22c55e', isDefault: true },
  { id: 'bank', name: 'Bank Utama', type: 'bank', balance: 0, currency: 'IDR', icon: '🏦', color: '#3b82f6', isDefault: false },
  { id: 'ewallet', name: 'E-Wallet', type: 'ewallet', balance: 0, currency: 'IDR', icon: '📱', color: '#8b5cf6', isDefault: false },
];

// Currency formatting
export const CURRENCIES = {
  IDR: { code: 'IDR', symbol: 'Rp', locale: 'id-ID', name: 'Indonesian Rupiah' },
  USD: { code: 'USD', symbol: '$', locale: 'en-US', name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', locale: 'de-DE', name: 'Euro' },
  SGD: { code: 'SGD', symbol: 'S$', locale: 'en-SG', name: 'Singapore Dollar' },
  MYR: { code: 'MYR', symbol: 'RM', locale: 'ms-MY', name: 'Malaysian Ringgit' },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

// Date formats
export const DATE_FORMATS = {
  'DD/MM/YYYY': { format: 'dd/MM/yyyy', label: 'DD/MM/YYYY' },
  'MM/DD/YYYY': { format: 'MM/dd/yyyy', label: 'MM/DD/YYYY' },
  'YYYY-MM-DD': { format: 'yyyy-MM-dd', label: 'YYYY-MM-DD' },
} as const;