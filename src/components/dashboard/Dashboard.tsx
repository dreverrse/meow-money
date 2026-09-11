import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus, ArrowRight, Plus, MoreHorizontal } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge, Progress } from '../ui/Badge';
import { formatCurrency, formatDate, getMonthRange } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  iconColor: string;
  bgColor: string;
  trend?: 'up' | 'down' | 'neutral';
}

function StatCard({ title, value, change, changeLabel, icon, iconColor, bgColor, trend }: StatCardProps) {
  return (
    <Card className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-dark-500">{title}</p>
          <p className="mt-1 font-display text-3xl font-bold text-dark-900">{value}</p>
          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
              {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
              {trend === 'neutral' && <Minus className="w-4 h-4 text-dark-400" />}
              <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-dark-500'}`}>
                {change >= 0 ? '+' : ''}{change.toFixed(1)}%
              </span>
              {changeLabel && <span className="text-sm text-dark-400">{changeLabel}</span>}
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgColor}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

export function DashboardStats() {
  const { state, getTotalIncome, getTotalExpense, getBalance } = useApp();
  const { preferences } = state;

  const monthlyIncome = getTotalIncome('month');
  const monthlyExpense = getTotalExpense('month');
  const monthlyBalance = getBalance('month');
  const yearlyIncome = getTotalIncome('year');
  const yearlyExpense = getTotalExpense('year');
  const yearlyBalance = getBalance('year');

  // Calculate previous month for comparison
  const now = new Date();
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  
  const prevMonthIncome = state.transactions
    .filter(t => t.type === 'income')
    .filter(t => {
      const date = new Date(t.date);
      return date >= prevMonth && date <= prevMonthEnd;
    })
    .reduce((sum, t) => sum + t.amount, 0);
    
  const prevMonthExpense = state.transactions
    .filter(t => t.type === 'expense')
    .filter(t => {
      const date = new Date(t.date);
      return date >= prevMonth && date <= prevMonthEnd;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const incomeChange = prevMonthIncome > 0 ? ((monthlyIncome - prevMonthIncome) / prevMonthIncome) * 100 : 0;
  const expenseChange = prevMonthExpense > 0 ? ((monthlyExpense - prevMonthExpense) / prevMonthExpense) * 100 : 0;
  const balanceChange = prevMonthIncome - prevMonthExpense > 0 ? ((monthlyBalance - (prevMonthIncome - prevMonthExpense)) / (prevMonthIncome - prevMonthExpense)) * 100 : 0;

  const stats = [
    {
      title: 'Total Balance',
      value: formatCurrency(monthlyBalance, preferences.currency),
      change: balanceChange,
      changeLabel: 'dari bulan lalu',
      icon: (
        <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconColor: 'text-primary-500',
      bgColor: 'bg-primary-100',
      trend: monthlyBalance >= 0 ? 'up' : 'down' as 'up' | 'down' | 'neutral',
    },
    {
      title: 'Pemasukan Bulan Ini',
      value: formatCurrency(monthlyIncome, preferences.currency),
      change: incomeChange,
      changeLabel: 'dari bulan lalu',
      icon: (
        <svg className="w-6 h-6 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.303-1.106 3.182 0z" />
        </svg>
      ),
      iconColor: 'text-secondary-500',
      bgColor: 'bg-secondary-100',
      trend: incomeChange >= 0 ? 'up' : 'down' as 'up' | 'down' | 'neutral',
    },
    {
      title: 'Pengeluaran Bulan Ini',
      value: formatCurrency(monthlyExpense, preferences.currency),
      change: expenseChange,
      changeLabel: 'dari bulan lalu',
      icon: (
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v2a2 2 0 01-2 2m-8 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      iconColor: 'text-red-500',
      bgColor: 'bg-red-100',
      trend: expenseChange >= 0 ? 'down' : 'up' as 'up' | 'down' | 'neutral',
    },
    {
      title: 'Tabungan Aktif',
      value: state.savingsGoals.length.toString(),
      change: state.savingsGoals.filter(g => g.currentAmount >= g.targetAmount).length,
      changeLabel: 'tercapai',
      icon: (
        <svg className="w-6 h-6 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconColor: 'text-accent-500',
      bgColor: 'bg-accent-100',
      trend: 'neutral' as 'up' | 'down' | 'neutral',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
      {stats.map((stat, index) => (
        <StatCard key={stat.title} {...stat} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }} />
      ))}
    </div>
  );
}

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  color: string;
  bgColor: string;
}

function QuickAction({ icon, label, href, color, bgColor }: QuickActionProps) {
  return (
    <Link
      to={href}
      className={`card-interactive p-4 flex flex-col items-center gap-3 text-center ${bgColor} group`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <span className="text-sm font-medium text-dark-700">{label}</span>
    </Link>
  );
}

export function QuickActions() {
  const actions = [
    {
      label: 'Pengeluaran',
      href: '/transactions?type=expense',
      icon: (
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      color: 'text-red-500',
      bgColor: 'bg-red-50',
    },
    {
      label: 'Pemasukan',
      href: '/transactions?type=income',
      icon: (
        <svg className="w-6 h-6 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      color: 'text-secondary-500',
      bgColor: 'bg-secondary-50',
    },
    {
      label: 'Anggaran',
      href: '/budget',
      icon: (
        <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      color: 'text-primary-500',
      bgColor: 'bg-primary-50',
    },
    {
      label: 'Tabungan',
      href: '/savings',
      icon: (
        <svg className="w-6 h-6 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-accent-500',
      bgColor: 'bg-accent-50',
    },
  ];

  return (
    <Card padding="lg" className="mb-6 md:mb-8">
      <CardHeader>
        <CardTitle>Aksi Cepat</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {actions.map((action, index) => (
            <QuickAction key={action.label} {...action} className="animate-slide-up" style={{ animationDelay: `${(index + 4) * 100}ms` }} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface RecentTransactionsProps {
  limit?: number;
}

export function RecentTransactions({ limit = 5 }: RecentTransactionsProps) {
  const { state, deleteTransaction, formatCurrency, preferences } = useApp();

  const recentTransactions = useMemo(() => {
    return state.transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }, [state.transactions, limit]);

  if (recentTransactions.length === 0) {
    return (
      <Card padding="lg" className="mb-6 md:mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transaksi Terbaru</CardTitle>
            <Link to="/transactions" className="text-sm text-primary-500 hover:text-primary-600 font-medium">
              Lihat semua <ArrowRight className="w-4 h-4 inline ml-1" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="empty-state">
            <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p className="empty-state-title">Belum ada transaksi</p>
            <p className="empty-state-description">Mulai catat pengeluaran atau pemasukan pertama Anda</p>
            <Button onClick={() => alert('Add transaction modal')} className="mt-4">
              <Plus className="w-4 h-4" />
              Tambah Transaksi
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card padding="none" className="mb-6 md:mb-8 overflow-hidden">
      <CardHeader className="p-6 pb-0">
        <div className="flex items-center justify-between">
          <CardTitle>Transaksi Terbaru</CardTitle>
          <Link to="/transactions" className="text-sm text-primary-500 hover:text-primary-600 font-medium">
            Lihat semua <ArrowRight className="w-4 h-4 inline ml-1" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-dark-100">
          {recentTransactions.map((transaction, index) => (
            <div
              key={transaction.id}
              className={`flex items-center gap-4 p-4 hover:bg-dark-50 transition-colors animate-slide-up ${index === recentTransactions.length - 1 ? 'border-b-0' : ''}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${transaction.type === 'income' ? 'bg-secondary-100' : 'bg-red-100'}`}>
                <span>{transaction.categoryIcon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-dark-900 truncate">{transaction.description || transaction.categoryName}</p>
                <p className="text-sm text-dark-500">{transaction.categoryName} &#8226; {formatDate(transaction.date, preferences.dateFormat)}</p>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${transaction.type === 'income' ? 'text-secondary-600' : 'text-red-600'}`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, preferences.currency)}
                </p>
                <Badge variant={transaction.type === 'income' ? 'income' : 'expense'} size="sm">
                  {transaction.type === 'income' ? 'Masuk' : 'Keluar'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface BudgetOverviewProps {
  limit?: number;
}

export function BudgetOverview({ limit = 3 }: BudgetOverviewProps) {
  const { state, getBudgetProgress } = useApp();

  const activeBudgets = useMemo(() => {
    return state.budgets
      .filter(b => {
        const progress = getBudgetProgress(b.id);
        return progress && progress.percentage < 100;
      })
      .slice(0, limit);
  }, [state.budgets, getBudgetProgress]);

  if (activeBudgets.length === 0) {
    return (
      <Card padding="lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Anggaran Bulanan</CardTitle>
            <Link to="/budget" className="text-sm text-primary-500 hover:text-primary-600 font-medium">
              Kelola <ArrowRight className="w-4 h-4 inline ml-1" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="empty-state">
            <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="empty-state-title">Belum ada anggaran</p>
            <p className="empty-state-description">Buat anggaran untuk mengontrol pengeluaran bulanan</p>
            <Button asChild className="mt-4">
              <Link to="/budget">
                <Plus className="w-4 h-4" />
                Buat Anggaran
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Anggaran Bulanan</CardTitle>
          <Link to="/budget" className="text-sm text-primary-500 hover:text-primary-600 font-medium">
            Lihat semua <ArrowRight className="w-4 h-4 inline ml-1" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeBudgets.map((budget, index) => {
          const progress = getBudgetProgress(budget.id);
          if (!progress) return null;
          
          const category = state.categories.find(c => c.id === budget.categoryId);
          
          return (
            <div key={budget.id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center`} style={{ backgroundColor: `${category?.color}20` }}>
                    <span className="text-lg">{category?.icon}</span>
                  </div>
                  <div>
                    <p className="font-medium text-dark-900">{category?.name || budget.categoryId}</p>
                    <p className="text-sm text-dark-500">Anggaran: {formatCurrency(budget.amount, state.preferences.currency)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${progress.isOver ? 'text-red-600' : 'text-dark-900'}`}>
                    {formatCurrency(progress.spent, state.preferences.currency)} / {formatCurrency(progress.budget, state.preferences.currency)}
                  </p>
                  <p className={`text-sm ${progress.isOver ? 'text-red-500' : 'text-dark-500'}`}>
                    {progress.percentage.toFixed(0)}% terpakai
                  </p>
                </div>
              </div>
              <Progress value={progress.spent} max={progress.budget} variant={progress.isOver ? 'warning' : 'expense'} size="sm" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

interface SavingsOverviewProps {
  limit?: number;
}

export function SavingsOverview({ limit = 3 }: SavingsOverviewProps) {
  const { state } = useApp();

  const activeGoals = useMemo(() => {
    return state.savingsGoals
      .filter(g => g.currentAmount < g.targetAmount)
      .slice(0, limit);
  }, [state.savingsGoals]);

  if (activeGoals.length === 0) {
    return (
      <Card padding="lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Target Tabungan</CardTitle>
            <Link to="/savings" className="text-sm text-primary-500 hover:text-primary-600 font-medium">
              Kelola <ArrowRight className="w-4 h-4 inline ml-1" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="empty-state">
            <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="empty-state-title">Belum ada target tabungan</p>
            <p className="empty-state-description">Tetapkan target untuk mencapai tujuan finansial Anda</p>
            <Button asChild className="mt-4">
              <Link to="/savings">
                <Plus className="w-4 h-4" />
                Buat Target
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Target Tabungan</CardTitle>
          <Link to="/savings" className="text-sm text-primary-500 hover:text-primary-600 font-medium">
            Lihat semua <ArrowRight className="w-4 h-4 inline ml-1" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeGoals.map((goal, index) => {
          const percentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
          
          return (
            <div key={goal.id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center`} style={{ backgroundColor: `${goal.color}20` }}>
                    <span className="text-lg">{goal.icon}</span>
                  </div>
                  <div>
                    <p className="font-medium text-dark-900">{goal.name}</p>
                    <p className="text-sm text-dark-500">Target: {formatDate(goal.targetDate, 'DD/MM/YYYY')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-dark-900">
                    {formatCurrency(goal.currentAmount, state.preferences.currency)} / {formatCurrency(goal.targetAmount, state.preferences.currency)}
                  </p>
                  <p className="text-sm text-dark-500">{percentage.toFixed(0)}% tercapai</p>
                </div>
              </div>
              <Progress value={goal.currentAmount} max={goal.targetAmount} variant="savings" size="sm" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Ringkasan keuangan Anda untuk bulan ini</p>
      </div>

      {/* Stats Cards */}
      <DashboardStats />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Recent Transactions */}
        <div className="lg:col-span-2 space-y-6">
          <RecentTransactions limit={5} />
          
          {/* Quick Actions */}
          <QuickActions />
        </div>

        {/* Right Column - Budgets & Savings */}
        <div className="space-y-6">
          <BudgetOverview limit={3} />
          <SavingsOverview limit={3} />
        </div>
      </div>
    </div>
  );
}