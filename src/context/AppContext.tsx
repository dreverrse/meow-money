import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { AppState, Transaction, Category, Budget, SavingsGoal, Account, UserPreferences, DEFAULT_CATEGORIES, DEFAULT_ACCOUNTS } from '../data/types';
import { generateId, formatCurrency } from '../utils/formatters';

// Storage key
const STORAGE_KEY = 'meow-money-data';

// Initial state
const initialState: AppState = {
  transactions: [],
  categories: DEFAULT_CATEGORIES,
  budgets: [],
  savingsGoals: [],
  accounts: DEFAULT_ACCOUNTS,
  preferences: {
    currency: 'IDR',
    language: 'id',
    theme: 'system',
    dateFormat: 'DD/MM/YYYY',
    firstDayOfWeek: 1,
    notifications: {
      budgetAlerts: true,
      transactionReminders: true,
      weeklyReports: true,
      monthlyReports: true,
    },
  },
};

// Action types
type Action =
  | { type: 'LOAD_STATE'; payload: Partial<AppState> }
  // Transactions
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  // Categories
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  // Budgets
  | { type: 'ADD_BUDGET'; payload: Budget }
  | { type: 'UPDATE_BUDGET'; payload: Budget }
  | { type: 'DELETE_BUDGET'; payload: string }
  // Savings Goals
  | { type: 'ADD_SAVINGS_GOAL'; payload: SavingsGoal }
  | { type: 'UPDATE_SAVINGS_GOAL'; payload: SavingsGoal }
  | { type: 'DELETE_SAVINGS_GOAL'; payload: string }
  | { type: 'UPDATE_SAVINGS_PROGRESS'; payload: { id: string; amount: number } }
  // Accounts
  | { type: 'ADD_ACCOUNT'; payload: Account }
  | { type: 'UPDATE_ACCOUNT'; payload: Account }
  | { type: 'DELETE_ACCOUNT'; payload: string }
  | { type: 'UPDATE_ACCOUNT_BALANCE'; payload: { id: string; balance: number } }
  // Preferences
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<UserPreferences> }
  // Bulk
  | { type: 'RESET_STATE' };

// Reducer
function appReducer(state: AppState, action: Action): AppState {
  let newState: AppState;
  
  switch (action.type) {
    case 'LOAD_STATE':
      newState = { ...state, ...action.payload };
      break;
      
    // Transactions
    case 'ADD_TRANSACTION':
      newState = {
        ...state,
        transactions: [action.payload, ...state.transactions],
      };
      break;
      
    case 'UPDATE_TRANSACTION':
      newState = {
        ...state,
        transactions: state.transactions.map(t =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
      break;
      
    case 'DELETE_TRANSACTION':
      newState = {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload),
      };
      break;
      
    // Categories
    case 'ADD_CATEGORY':
      newState = {
        ...state,
        categories: [...state.categories, action.payload],
      };
      break;
      
    case 'UPDATE_CATEGORY':
      newState = {
        ...state,
        categories: state.categories.map(c =>
          c.id === action.payload.id ? action.payload : c
        ),
      };
      break;
      
    case 'DELETE_CATEGORY':
      newState = {
        ...state,
        categories: state.categories.filter(c => c.id !== action.payload),
        transactions: state.transactions.map(t =>
          t.categoryId === action.payload
            ? { ...t, categoryId: 'others-expense', categoryName: 'Lainnya', categoryIcon: '📦', categoryColor: '#94a3b8' }
            : t
        ),
      };
      break;
      
    // Budgets
    case 'ADD_BUDGET':
      newState = {
        ...state,
        budgets: [...state.budgets, action.payload],
      };
      break;
      
    case 'UPDATE_BUDGET':
      newState = {
        ...state,
        budgets: state.budgets.map(b =>
          b.id === action.payload.id ? action.payload : b
        ),
      };
      break;
      
    case 'DELETE_BUDGET':
      newState = {
        ...state,
        budgets: state.budgets.filter(b => b.id !== action.payload),
      };
      break;
      
    // Savings Goals
    case 'ADD_SAVINGS_GOAL':
      newState = {
        ...state,
        savingsGoals: [...state.savingsGoals, action.payload],
      };
      break;
      
    case 'UPDATE_SAVINGS_GOAL':
      newState = {
        ...state,
        savingsGoals: state.savingsGoals.map(g =>
          g.id === action.payload.id ? action.payload : g
        ),
      };
      break;
      
    case 'DELETE_SAVINGS_GOAL':
      newState = {
        ...state,
        savingsGoals: state.savingsGoals.filter(g => g.id !== action.payload),
      };
      break;
      
    case 'UPDATE_SAVINGS_PROGRESS':
      newState = {
        ...state,
        savingsGoals: state.savingsGoals.map(g =>
          g.id === action.payload.id
            ? { ...g, currentAmount: action.payload.amount }
            : g
        ),
      };
      break;
      
    // Accounts
    case 'ADD_ACCOUNT':
      newState = {
        ...state,
        accounts: [...state.accounts, action.payload],
      };
      break;
      
    case 'UPDATE_ACCOUNT':
      newState = {
        ...state,
        accounts: state.accounts.map(a =>
          a.id === action.payload.id ? action.payload : a
        ),
      };
      break;
      
    case 'DELETE_ACCOUNT':
      newState = {
        ...state,
        accounts: state.accounts.filter(a => a.id !== action.payload),
      };
      break;
      
    case 'UPDATE_ACCOUNT_BALANCE':
      newState = {
        ...state,
        accounts: state.accounts.map(a =>
          a.id === action.payload.id ? { ...a, balance: action.payload.balance } : a
        ),
      };
      break;
      
    // Preferences
    case 'UPDATE_PREFERENCES':
      newState = {
        ...state,
        preferences: { ...state.preferences, ...action.payload },
      };
      break;
      
    case 'RESET_STATE':
      newState = initialState;
      break;
      
    default:
      return state;
  }
  
  // Persist to localStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  } catch (error) {
    console.error('Failed to save state:', error);
  }
  
  return newState;
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  // Transaction actions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  // Category actions
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  // Budget actions
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;
  // Savings Goal actions
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateSavingsGoal: (goal: SavingsGoal) => void;
  deleteSavingsGoal: (id: string) => void;
  updateSavingsProgress: (id: string, amount: number) => void;
  // Account actions
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (account: Account) => void;
  deleteAccount: (id: string) => void;
  updateAccountBalance: (id: string, balance: number) => void;
  // Preference actions
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  // Computed values
  getTotalIncome: (period?: 'month' | 'year' | 'all') => number;
  getTotalExpense: (period?: 'month' | 'year' | 'all') => number;
  getBalance: (period?: 'month' | 'year' | 'all') => number;
  getTransactionsByCategory: (type: 'income' | 'expense', period?: 'month' | 'year' | 'all') => Record<string, number>;
  getCategorySpending: (categoryId: string, period?: 'month' | 'year' | 'all') => number;
  getBudgetProgress: (budgetId: string) => { spent: number; budget: number; percentage: number; isOver: boolean } | null;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState, (saved) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...initialState, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load state:', error);
    }
    return initialState;
  });

  // Transaction actions
  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newTransaction: Transaction = {
      ...transaction,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
  }, []);

  const updateTransaction = useCallback((transaction: Transaction) => {
    dispatch({
      type: 'UPDATE_TRANSACTION',
      payload: { ...transaction, updatedAt: new Date().toISOString() },
    });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
  }, []);

  // Category actions
  const addCategory = useCallback((category: Omit<Category, 'id'>) => {
    dispatch({ type: 'ADD_CATEGORY', payload: { ...category, id: generateId() } });
  }, []);

  const updateCategory = useCallback((category: Category) => {
    dispatch({ type: 'UPDATE_CATEGORY', payload: category });
  }, []);

  const deleteCategory = useCallback((id: string) => {
    dispatch({ type: 'DELETE_CATEGORY', payload: id });
  }, []);

  // Budget actions
  const addBudget = useCallback((budget: Omit<Budget, 'id'>) => {
    dispatch({ type: 'ADD_BUDGET', payload: { ...budget, id: generateId() } });
  }, []);

  const updateBudget = useCallback((budget: Budget) => {
    dispatch({ type: 'UPDATE_BUDGET', payload: budget });
  }, []);

  const deleteBudget = useCallback((id: string) => {
    dispatch({ type: 'DELETE_BUDGET', payload: id });
  }, []);

  // Savings Goal actions
  const addSavingsGoal = useCallback((goal: Omit<SavingsGoal, 'id'>) => {
    dispatch({ type: 'ADD_SAVINGS_GOAL', payload: { ...goal, id: generateId() } });
  }, []);

  const updateSavingsGoal = useCallback((goal: SavingsGoal) => {
    dispatch({ type: 'UPDATE_SAVINGS_GOAL', payload: goal });
  }, []);

  const deleteSavingsGoal = useCallback((id: string) => {
    dispatch({ type: 'DELETE_SAVINGS_GOAL', payload: id });
  }, []);

  const updateSavingsProgress = useCallback((id: string, amount: number) => {
    dispatch({ type: 'UPDATE_SAVINGS_PROGRESS', payload: { id, amount } });
  }, []);

  // Account actions
  const addAccount = useCallback((account: Omit<Account, 'id'>) => {
    dispatch({ type: 'ADD_ACCOUNT', payload: { ...account, id: generateId() } });
  }, []);

  const updateAccount = useCallback((account: Account) => {
    dispatch({ type: 'UPDATE_ACCOUNT', payload: account });
  }, []);

  const deleteAccount = useCallback((id: string) => {
    dispatch({ type: 'DELETE_ACCOUNT', payload: id });
  }, []);

  const updateAccountBalance = useCallback((id: string, balance: number) => {
    dispatch({ type: 'UPDATE_ACCOUNT_BALANCE', payload: { id, balance } });
  }, []);

  // Preference actions
  const updatePreferences = useCallback((preferences: Partial<UserPreferences>) => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
  }, []);

  // Computed values
  const getTotalIncome = useCallback((period: 'month' | 'year' | 'all' = 'month') => {
    const now = new Date();
    return state.transactions
      .filter(t => {
        if (t.type !== 'income') return false;
        const date = new Date(t.date);
        if (period === 'month') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        if (period === 'year') return date.getFullYear() === now.getFullYear();
        return true;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [state.transactions]);

  const getTotalExpense = useCallback((period: 'month' | 'year' | 'all' = 'month') => {
    const now = new Date();
    return state.transactions
      .filter(t => {
        if (t.type !== 'expense') return false;
        const date = new Date(t.date);
        if (period === 'month') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        if (period === 'year') return date.getFullYear() === now.getFullYear();
        return true;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [state.transactions]);

  const getBalance = useCallback((period: 'month' | 'year' | 'all' = 'month') => {
    return getTotalIncome(period) - getTotalExpense(period);
  }, [getTotalIncome, getTotalExpense]);

  const getTransactionsByCategory = useCallback((type: 'income' | 'expense', period: 'month' | 'year' | 'all' = 'month') => {
    const now = new Date();
    return state.transactions
      .filter(t => {
        if (t.type !== type) return false;
        const date = new Date(t.date);
        if (period === 'month') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        if (period === 'year') return date.getFullYear() === now.getFullYear();
        return true;
      })
      .reduce((acc, t) => {
        acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);
  }, [state.transactions]);

  const getCategorySpending = useCallback((categoryId: string, period: 'month' | 'year' | 'all' = 'month') => {
    const now = new Date();
    return state.transactions
      .filter(t => {
        if (t.categoryId !== categoryId) return false;
        const date = new Date(t.date);
        if (period === 'month') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        if (period === 'year') return date.getFullYear() === now.getFullYear();
        return true;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [state.transactions]);

  const getBudgetProgress = useCallback((budgetId: string) => {
    const budget = state.budgets.find(b => b.id === budgetId);
    if (!budget) return null;
    
    const spent = getCategorySpending(budget.categoryId, 'month');
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    
    return {
      spent,
      budget: budget.amount,
      percentage: Math.min(100, percentage),
      isOver: spent > budget.amount,
    };
  }, [state.budgets, getCategorySpending]);

  // Memoized context value
  const value = useMemo<AppContextType>(
    () => ({
      state,
      dispatch,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addCategory,
      updateCategory,
      deleteCategory,
      addBudget,
      updateBudget,
      deleteBudget,
      addSavingsGoal,
      updateSavingsGoal,
      deleteSavingsGoal,
      updateSavingsProgress,
      addAccount,
      updateAccount,
      deleteAccount,
      updateAccountBalance,
      updatePreferences,
      getTotalIncome,
      getTotalExpense,
      getBalance,
      getTransactionsByCategory,
      getCategorySpending,
      getBudgetProgress,
    }),
    [
      state,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addCategory,
      updateCategory,
      deleteCategory,
      addBudget,
      updateBudget,
      deleteBudget,
      addSavingsGoal,
      updateSavingsGoal,
      deleteSavingsGoal,
      updateSavingsProgress,
      addAccount,
      updateAccount,
      deleteAccount,
      updateAccountBalance,
      updatePreferences,
      getTotalIncome,
      getTotalExpense,
      getBalance,
      getTransactionsByCategory,
      getCategorySpending,
      getBudgetProgress,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}