import React, { useState, useMemo } from 'react';
import { Calendar, Download, BarChart3, PieChart as PieChartIcon, TrendingUp, Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { formatCurrency, formatDate, getMonthRange, getWeekRange } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';

const periodOptions = [
  { value: 'week', label: 'Minggu Ini' },
  { value: 'month', label: 'Bulan Ini' },
  { value: 'quarter', label: 'Kuartal Ini' },
  { value: 'year', label: 'Tahun Ini' },
  { value: 'custom', label: 'Kustom' },
];

const chartTypeOptions = [
  { value: 'bar', label: 'Batang', icon: BarChart3 },
  { value: 'line', label: 'Garis', icon: TrendingUp },
  { value: 'pie', label: 'Pie', icon: PieChartIcon },
];

// Simple SVG Chart Components
function BarChart({ data, maxValue, height = 200, color = '#0071e3' }: { data: Array<{ label: string; value: number }>; maxValue: number; height?: number; color?: string }) {
  const barWidth = 100 / data.length;
  return (
    <div className="w-full h-64 flex items-end justify-around px-2" role="img" aria-label="Bar chart">
      {data.map((item, index) => {
        const barHeight = maxValue > 0 ? (item.value / maxValue) * (height - 40) : 0;
        return (
          <div key={index} className="flex flex-col items-center gap-2 w-full" style={{ maxWidth: `${barWidth}%` }}>
            <div
              className="w-full rounded-t transition-all duration-500 hover:opacity-80"
              style={{
                height: `${Math.max(barHeight, 0)}px`,
                backgroundColor: color,
                minHeight: barHeight > 0 ? '4px' : '0',
              }}
              title={`${item.label}: ${item.value}`}
            />
            <span className="text-xs text-dark-500 text-center px-1 truncate w-full">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function PieChartComponent({ data, colors = ['#0071e3', '#22c55e', '#a855f7', '#f97316', '#ec4899', '#06b6d4', '#84cc16', '#64748b'] }: { data: Array<{ label: string; value: number; color?: string }> }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return <div className="w-full h-64 flex items-center justify-center text-dark-400">Tidak ada data</div>;
  
  let cumulative = 0;
  const segments = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = cumulative;
    const endAngle = cumulative + angle;
    cumulative = endAngle;
    
    const startRadians = (startAngle - 90) * (Math.PI / 180);
    const endRadians = (endAngle - 90) * (Math.PI / 180);
    const largeArc = angle > 180 ? 1 : 0;
    
    const x1 = 80 + 70 * Math.cos(startRadians);
    const y1 = 80 + 70 * Math.sin(startRadians);
    const x2 = 80 + 70 * Math.cos(endRadians);
    const y2 = 80 + 70 * Math.sin(endRadians);
    
    const color = item.color || colors[index % colors.length];
    
    return (
      <path
        key={index}
        d={`M 80 80 L ${x1} ${y1} A 70 70 0 ${largeArc} 1 ${x2} ${y2} Z`}
        fill={color}
        className="transition-all duration-300 hover:opacity-80 cursor-pointer"
      />
    );
  });
  
  return (
    <div className="relative w-full h-64 flex items-center justify-center">
      <svg viewBox="0 0 160 160" className="w-64 h-64">
        {segments}
        <circle cx="80" cy="80" r="40" fill="white" />
      </svg>
      <div className="absolute text-center pointer-events-none">
        <p className="font-display text-2xl font-bold text-dark-900">{total.toLocaleString('id-ID')}</p>
        <p className="text-xs text-dark-500">Total</p>
      </div>
    </div>
  );
}

function LineChart({ data, maxValue, height = 200, color = '#0071e3' }: { data: Array<{ label: string; value: number }>; maxValue: number; height?: number; color?: string }) {
  if (data.length === 0) return <div className="w-full h-64 flex items-center justify-center text-dark-400">Tidak ada data</div>;
  
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = maxValue > 0 ? 100 - (item.value / maxValue) * 100 : 50;
    return { x, y, value: item.value, label: item.label };
  });
  
  const pathData = points.map((p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cpX = (prev.x + p.x) / 2;
    return `C ${cpX} ${prev.y} ${cpX} ${p.y} ${p.x} ${p.y}`;
  }).join(' ');
  
  return (
    <div className="relative w-full h-64" role="img" aria-label="Line chart">
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Area */}
        <path
          d={`${pathData} L 100 100 L 0 100 Z`}
          fill="url(#lineGradient)"
        />
        {/* Line */}
        <path
          d={pathData}
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300"
        />
        {/* Points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3"
            fill={color}
            className="transition-all duration-200 hover:r-4 hover:shadow-lg"
          />
        ))}
      </svg>
      {/* Tooltips would go here */}
    </div>
  );
}

export function Reports() {
  const { state, getTotalIncome, getTotalExpense, getTransactionsByCategory } = useApp();
  const { preferences, categories } = state;
  
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year' | 'custom'>('month');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const { start: monthStart, end: monthEnd } = getMonthRange();
  const { start: weekStart, end: weekEnd } = getWeekRange();
  
  const periodStart = useMemo(() => {
    switch (period) {
      case 'week': return weekStart;
      case 'month': return monthStart;
      case 'quarter': return new Date(monthStart.getFullYear(), Math.floor(monthStart.getMonth() / 3) * 3, 1);
      case 'year': return new Date(monthStart.getFullYear(), 0, 1);
      case 'custom': return dateFrom ? new Date(dateFrom) : monthStart;
      default: return monthStart;
    }
  }, [period, dateFrom, monthStart, weekStart]);
  
  const periodEnd = useMemo(() => {
    switch (period) {
      case 'week': return weekEnd;
      case 'month': return monthEnd;
      case 'quarter': return new Date(monthStart.getFullYear(), Math.floor(monthStart.getMonth() / 3) * 3 + 3, 0, 23, 59, 59);
      case 'year': return new Date(monthStart.getFullYear(), 11, 31, 23, 59, 59);
      case 'custom': return dateTo ? new Date(dateTo) : monthEnd;
      default: return monthEnd;
    }
  }, [period, dateTo, monthStart, monthEnd, weekEnd]);

  const filteredTransactions = useMemo(() => {
    return state.transactions.filter(t => {
      const date = new Date(t.date);
      return date >= periodStart && date <= periodEnd;
    });
  }, [state.transactions, periodStart, periodEnd]);

  const incomeByCategory = getTransactionsByCategory('income', period === 'year' ? 'year' : 'month');
  const expenseByCategory = getTransactionsByCategory('expense', period === 'year' ? 'year' : 'month');
  
  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Prepare chart data
  const expenseChartData = Object.entries(expenseByCategory)
    .map(([categoryId, value]) => {
      const category = categories.find(c => c.id === categoryId);
      return { label: category?.name || categoryId, value, color: category?.color };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const incomeChartData = Object.entries(incomeByCategory)
    .map(([categoryId, value]) => {
      const category = categories.find(c => c.id === categoryId);
      return { label: category?.name || categoryId, value, color: category?.color };
    })
    .sort((a, b) => b.value - a.value);

  // Daily data for line/bar chart
  const dailyData = useMemo(() => {
    const days: Record<string, { income: number; expense: number }> = {};
    const current = new Date(periodStart);
    while (current <= periodEnd) {
      const key = current.toISOString().split('T')[0];
      days[key] = { income: 0, expense: 0 };
      current.setDate(current.getDate() + 1);
    }
    
    filteredTransactions.forEach(t => {
      const key = t.date.split('T')[0];
      if (days[key]) {
        days[key][t.type] += t.amount;
      }
    });
    
    return Object.entries(days).map(([date, values]) => ({
      label: formatDate(date, 'DD/MM'),
      income: values.income,
      expense: values.expense,
    }));
  }, [filteredTransactions, periodStart, periodEnd]);

  const maxDailyValue = Math.max(...dailyData.map(d => Math.max(d.income, d.expense)), 1);
  const maxCategoryValue = Math.max(...expenseChartData.map(d => d.value), ...incomeChartData.map(d => d.value), 1);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Laporan</h1>
          <p className="page-subtitle">Analisis pola keuangan dan tren pengeluaran</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Download className="w-4 h-4 mr-1" />
            Ekspor
          </Button>
        </div>
      </div>

      {/* Period Selector & Controls */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-4 flex-wrap">
              <Select
                value={period}
                onChange={(e) => setPeriod(e.target.value as typeof period)}
                options={periodOptions}
                className="w-full sm:w-44"
              />
              
              {period === 'custom' && (
                <>
                  <Input
                    type="date"
                    label="Dari"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full sm:w-44"
                    max={new Date().toISOString().split('T')[0]}
                  />
                  <Input
                    type="date"
                    label="Sampai"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full sm:w-44"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-dark-500 hidden sm:block">Tipe Chart:</span>
              <div className="flex bg-black/[0.05] rounded-full p-1">
                {chartTypeOptions.map(({ value, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setChartType(value)}
                    className={`p-2 rounded-lg transition-all ${chartType === value ? 'bg-white shadow-card text-primary-500' : 'text-dark-500 hover:text-dark-700'}`}
                    aria-label={value}
                    aria-pressed={chartType === value}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="stat-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-secondary-500" />
            </div>
            <div>
              <p className="text-sm text-dark-500">Total Pemasukan</p>
              <p className="font-display text-2xl font-bold text-secondary-600">{formatCurrency(totalIncome, preferences.currency)}</p>
            </div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-dark-500">Total Pengeluaran</p>
              <p className="font-display text-2xl font-bold text-red-600">{formatCurrency(totalExpense, preferences.currency)}</p>
            </div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${balance >= 0 ? 'bg-secondary-100' : 'bg-red-100'}`}>
              <TrendingUp className={`w-6 h-6 ${balance >= 0 ? 'text-secondary-500' : 'text-red-500'}`} />
            </div>
            <div>
              <p className="text-sm text-dark-500">Saldo Bersih</p>
              <p className={`font-display text-2xl font-bold ${balance >= 0 ? 'text-secondary-600' : 'text-red-600'}`}>
                {balance >= 0 ? '+' : ''}{formatCurrency(balance, preferences.currency)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Expense Chart */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Pengeluaran per Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            {expenseChartData.length === 0 ? (
              <div className="empty-state h-64">
                <PieChartIcon className="empty-state-icon text-dark-300" size={32} />
                <p className="empty-state-title">Tidak ada data pengeluaran</p>
              </div>
            ) : (
              <div className="h-64">
                {chartType === 'bar' && <BarChart data={expenseChartData} maxValue={maxCategoryValue} color="#ef4444" />}
                {chartType === 'line' && <LineChart data={expenseChartData} maxValue={maxCategoryValue} color="#ef4444" />}
                {chartType === 'pie' && <PieChartComponent data={expenseChartData} />}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Income Chart */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Pemasukan per Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            {incomeChartData.length === 0 ? (
              <div className="empty-state h-64">
                <PieChartIcon className="empty-state-icon text-dark-300" size={32} />
                <p className="empty-state-title">Tidak ada data pemasukan</p>
              </div>
            ) : (
              <div className="h-64">
                {chartType === 'bar' && <BarChart data={incomeChartData} maxValue={maxCategoryValue} color="#22c55e" />}
                {chartType === 'line' && <LineChart data={incomeChartData} maxValue={maxCategoryValue} color="#22c55e" />}
                {chartType === 'pie' && <PieChartComponent data={incomeChartData} />}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daily Trend Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tren Harian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {chartType === 'bar' && (
              <BarChart data={dailyData.map(d => ({ label: d.label, value: d.expense }))} maxValue={maxDailyValue} color="#ef4444" />
            )}
            {chartType === 'line' && (
              <LineChart data={dailyData.map(d => ({ label: d.label, value: d.expense }))} maxValue={maxDailyValue} color="#ef4444" />
            )}
            {chartType === 'pie' && (
              <div className="text-center text-dark-500 py-8">Pie chart tidak tersedia untuk data harian</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Detail Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {expenseChartData.length === 0 ? (
              <div className="empty-state py-8">
                <p className="empty-state-title">Tidak ada data</p>
              </div>
            ) : (
              <div className="divide-y divide-black/5">
                {expenseChartData.map((item, index) => {
                  const percentage = totalExpense > 0 ? (item.value / totalExpense) * 100 : 0;
                  return (
                    <div key={index} className="flex items-center justify-between p-4 hover:bg-black/[0.03]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: `${item.color}20` }}>
                          <span style={{ color: item.color }}>●</span>
                        </div>
                        <span className="font-medium text-dark-900">{item.label}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-600">{formatCurrency(item.value, preferences.currency)}</p>
                        <p className="text-sm text-dark-500">{percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Income Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Detail Pemasukan</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {incomeChartData.length === 0 ? (
              <div className="empty-state py-8">
                <p className="empty-state-title">Tidak ada data</p>
              </div>
            ) : (
              <div className="divide-y divide-black/5">
                {incomeChartData.map((item, index) => {
                  const percentage = totalIncome > 0 ? (item.value / totalIncome) * 100 : 0;
                  return (
                    <div key={index} className="flex items-center justify-between p-4 hover:bg-black/[0.03]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: `${item.color}20` }}>
                          <span style={{ color: item.color }}>●</span>
                        </div>
                        <span className="font-medium text-dark-900">{item.label}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-secondary-600">{formatCurrency(item.value, preferences.currency)}</p>
                        <p className="text-sm text-dark-500">{percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}