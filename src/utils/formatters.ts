// Utility functions for formatting

import { CURRENCIES, CurrencyCode, DATE_FORMATS } from '../data/types';

/**
 * Format currency amount
 */
export function formatCurrency(
  amount: number,
  currencyCode: CurrencyCode = 'IDR',
  options: { showSymbol?: boolean; showDecimals?: boolean; compact?: boolean } = {}
): string {
  const { showSymbol = true, showDecimals = false, compact = false } = options;
  const currency = CURRENCIES[currencyCode];
  
  if (compact) {
    return formatCompactCurrency(amount, currencyCode, showSymbol);
  }
  
  const formatter = new Intl.NumberFormat(currency.locale, {
    style: showSymbol ? 'currency' : 'decimal',
    currency: currency.code,
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });
  
  return formatter.format(amount);
}

/**
 * Format compact currency (e.g., 1.5M, 2.3K)
 */
function formatCompactCurrency(
  amount: number,
  currencyCode: CurrencyCode,
  showSymbol: boolean
): string {
  const currency = CURRENCIES[currencyCode];
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  
  let formatted: string;
  if (absAmount >= 1_000_000_000) {
    formatted = (absAmount / 1_000_000_000).toFixed(1) + 'B';
  } else if (absAmount >= 1_000_000) {
    formatted = (absAmount / 1_000_000).toFixed(1) + 'M';
  } else if (absAmount >= 1_000) {
    formatted = (absAmount / 1_000).toFixed(1) + 'K';
  } else {
    formatted = absAmount.toString();
  }
  
  return showSymbol ? `${sign}${currency.symbol}${formatted}` : `${sign}${formatted}`;
}

/**
 * Format date based on user preference
 */
export function formatDate(
  date: string | Date,
  format: keyof typeof DATE_FORMATS = 'DD/MM/YYYY'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  const { locale } = CURRENCIES.IDR; // Use Indonesian locale as default
  const options: Intl.DateTimeFormatOptions = getDateOptions(format);
  
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

function getDateOptions(format: keyof typeof DATE_FORMATS): Intl.DateTimeFormatOptions {
  switch (format) {
    case 'DD/MM/YYYY':
      return { day: '2-digit', month: '2-digit', year: 'numeric' };
    case 'MM/DD/YYYY':
      return { month: '2-digit', day: '2-digit', year: 'numeric' };
    case 'YYYY-MM-DD':
      return { year: 'numeric', month: '2-digit', day: '2-digit' };
    default:
      return { day: '2-digit', month: '2-digit', year: 'numeric' };
  }
}

/**
 * Format relative time (e.g., "2 hours ago", "Yesterday")
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} menit yang lalu`;
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  if (diffDays === 1) return 'Kemarin';
  if (diffDays < 7) return `${diffDays} hari yang lalu`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu yang lalu`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} bulan yang lalu`;
  return `${Math.floor(diffDays / 365)} tahun yang lalu`;
}

/**
 * Format number with thousand separators
 */
export function formatNumber(num: number, decimals = 0): string {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Get category color with opacity
 */
export function getCategoryColor(color: string, opacity = 1): string {
  // Convert hex to rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get month name
 */
export function getMonthName(month: number, locale = 'id-ID'): string {
  return new Date(2000, month, 1).toLocaleDateString(locale, { month: 'long' });
}

/**
 * Get day name
 */
export function getDayName(day: number, locale = 'id-ID'): string {
  return new Date(2000, 0, day).toLocaleDateString(locale, { weekday: 'long' });
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, Math.max(0, (value / total) * 100));
}

/**
 * Group transactions by date
 */
export function groupTransactionsByDate(transactions: Array<{ date: string }>): Record<string, typeof transactions> {
  return transactions.reduce((groups, transaction) => {
    const date = transaction.date.split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, typeof transactions>);
}

/**
 * Sort transactions by date (newest first)
 */
export function sortTransactionsByDate<T extends { date: string }>(
  transactions: T[],
  ascending = false
): T[] {
  return [...transactions].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
}

/**
 * Filter transactions by date range
 */
export function filterTransactionsByDateRange<T extends { date: string }>(
  transactions: T[],
  startDate: string,
  endDate: string
): T[] {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  
  return transactions.filter(t => {
    const date = new Date(t.date).getTime();
    return date >= start && date <= end;
  });
}

/**
 * Calculate totals by category
 */
export function calculateCategoryTotals<T extends { categoryId: string; amount: number }>(
  transactions: T[]
): Record<string, number> {
  return transactions.reduce((totals, t) => {
    totals[t.categoryId] = (totals[t.categoryId] || 0) + t.amount;
    return totals;
  }, {} as Record<string, number>);
}

/**
 * Get month start and end dates
 */
export function getMonthRange(date = new Date()): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

/**
 * Get week start and end dates
 */
export function getWeekRange(date = new Date(), firstDayOfWeek = 1): { start: Date; end: Date } {
  const day = date.getDay();
  const diff = (day < firstDayOfWeek ? 7 : 0) + day - firstDayOfWeek;
  const start = new Date(date);
  start.setDate(date.getDate() - diff);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if date is today
 */
export function isToday(date: string | Date): boolean {
  const today = new Date();
  const checkDate = typeof date === 'string' ? new Date(date) : date;
  return checkDate.toDateString() === today.toDateString();
}

/**
 * Check if date is this month
 */
export function isThisMonth(date: string | Date): boolean {
  const today = new Date();
  const checkDate = typeof date === 'string' ? new Date(date) : date;
  return (
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if date is this year
 */
export function isThisYear(date: string | Date): boolean {
  const today = new Date();
  const checkDate = typeof date === 'string' ? new Date(date) : date;
  return checkDate.getFullYear() === today.getFullYear();
}