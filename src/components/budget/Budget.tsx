import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { Badge, Progress } from '../ui/Badge';
import { Modal, ConfirmDialog } from '../ui/Modal';
import { formatCurrency, formatDate, getMonthRange } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';
import { Budget, Category } from '../../data/types';

const periodOptions = [
  { value: 'monthly', label: 'Bulanan' },
  { value: 'weekly', label: 'Mingguan' },
  { value: 'yearly', label: 'Tahunan' },
];

export function Budget() {
  const { state, addBudget, updateBudget, deleteBudget, getCategorySpending } = useApp();
  const { budgets, categories, preferences } = state;
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingBudgetId, setDeletingBudgetId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    period: 'monthly' as 'monthly' | 'weekly' | 'yearly',
    alertThreshold: 80,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const expenseCategories = categories.filter(c => c.type === 'expense');

  const budgetsWithProgress = useMemo(() => {
    return budgets.map(budget => {
      const spent = getCategorySpending(budget.categoryId, 'month');
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      const category = categories.find(c => c.id === budget.categoryId);
      return {
        ...budget,
        spent,
        percentage: Math.min(100, percentage),
        isOver: spent > budget.amount,
        isNearLimit: percentage >= (budget.alertThreshold || 80) && !budget.isOver,
        category,
      };
    });
  }, [budgets, categories, getCategorySpending]);

  const activeBudgets = budgetsWithProgress.filter(b => b.percentage < 100 && !b.isOver);
  const nearLimitBudgets = budgetsWithProgress.filter(b => b.isNearLimit);
  const overBudgets = budgetsWithProgress.filter(b => b.isOver);

  const resetForm = () => {
    setFormData({
      categoryId: '',
      amount: '',
      period: 'monthly',
      alertThreshold: 80,
    });
    setFormErrors({});
    setEditingBudget(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: Record<string, string> = {};
    if (!formData.categoryId) {
      errors.categoryId = 'Kategori harus dipilih';
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Jumlah anggaran harus lebih dari 0';
    }
    
    // Check if category already has a budget for this period
    const existingBudget = budgets.find(b => 
      b.categoryId === formData.categoryId && 
      b.period === formData.period &&
      b.id !== (editingBudget?.id || '')
    );
    if (existingBudget) {
      errors.categoryId = 'Kategori ini sudah memiliki anggaran untuk periode ini';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    const budgetData = {
      categoryId: formData.categoryId,
      amount: parseFloat(formData.amount),
      period: formData.period,
      alertThreshold: formData.alertThreshold,
      startDate: new Date().toISOString().split('T')[0],
    };
    
    if (editingBudget) {
      updateBudget({ ...editingBudget, ...budgetData });
    } else {
      addBudget(budgetData);
    }
    
    resetForm();
    setIsAddModalOpen(false);
  };

  const handleEdit = (budget: Budget) => {
    setFormData({
      categoryId: budget.categoryId,
      amount: budget.amount.toString(),
      period: budget.period,
      alertThreshold: budget.alertThreshold || 80,
    });
    setEditingBudget(budget);
    setIsAddModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingBudgetId(id);
  };

  const confirmDelete = () => {
    if (deletingBudgetId) {
      deleteBudget(deletingBudgetId);
      setDeletingBudgetId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Anggaran</h1>
          <p className="page-subtitle">Tetapkan batas pengeluaran dan pantau progres bulanan</p>
        </div>
        <Button onClick={() => { resetForm(); setIsAddModalOpen(true); }}>
          <Plus className="w-4 h-4" />
          Anggaran Baru
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="stat-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <p className="text-sm text-dark-500">Dalam Batas</p>
              <p className="font-display text-2xl font-bold text-dark-900">{activeBudgets.length}</p>
            </div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-dark-500">Mendekati Batas</p>
              <p className="font-display text-2xl font-bold text-amber-600">{nearLimitBudgets.length}</p>
            </div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-dark-500">Melebihi Batas</p>
              <p className="font-display text-2xl font-bold text-red-600">{overBudgets.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Budget List */}
      {budgets.length === 0 ? (
        <Card padding="lg" className="text-center">
          <div className="empty-state mx-auto max-w-md">
            <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="empty-state-title">Belum ada anggaran</p>
            <p className="empty-state-description">Buat anggaran pertama Anda untuk mulai mengontrol pengeluaran</p>
            <Button onClick={() => setIsAddModalOpen(true)} className="mt-4">
              <Plus className="w-4 h-4" />
              Buat Anggaran
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Over Budget */}
          {overBudgets.length > 0 && (
            <Card padding="none">
              <CardHeader className="p-6 pb-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                  <CardTitle>Melebihi Batas</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-dark-100">
                  {overBudgets.map((budget) => (
                    <BudgetCard key={budget.id} budget={budget} onEdit={handleEdit} onDelete={handleDelete} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Near Limit */}
          {nearLimitBudgets.length > 0 && (
            <Card padding="none">
              <CardHeader className="p-6 pb-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  </div>
                  <CardTitle>Mendekati Batas</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-dark-100">
                  {nearLimitBudgets.map((budget) => (
                    <BudgetCard key={budget.id} budget={budget} onEdit={handleEdit} onDelete={handleDelete} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* On Track */}
          {activeBudgets.length > 0 && (
            <Card padding="none">
              <CardHeader className="p-6 pb-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-secondary-100 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-secondary-500" />
                  </div>
                  <CardTitle>Dalam Batas</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-dark-100">
                  {activeBudgets.map((budget) => (
                    <BudgetCard key={budget.id} budget={budget} onEdit={handleEdit} onDelete={handleDelete} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={resetForm}
        title={editingBudget ? 'Edit Anggaran' : 'Tambah Anggaran'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Kategori"
            value={formData.categoryId}
            onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
            options={expenseCategories.map(c => ({ value: c.id, label: `${c.icon} ${c.name}` }))}
            placeholder="Pilih kategori pengeluaran"
            error={formErrors.categoryId}
          />

          <Input
            label="Jumlah Anggaran"
            type="number"
            step="10000"
            min="1000"
            placeholder="0"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            error={formErrors.amount}
            leftIcon={<span className="text-dark-400">{preferences.currency === 'IDR' ? 'Rp' : '$'}</span>}
            helperText={`Periode: ${formData.period === 'monthly' ? 'Bulanan' : formData.period === 'weekly' ? 'Mingguan' : 'Tahunan'}`}
          />

          <Select
            label="Periode"
            value={formData.period}
            onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value as 'monthly' | 'weekly' | 'yearly' }))}
            options={periodOptions}
          />

          <Input
            label="Ambang Peringatan (%)"
            type="number"
            min="10"
            max="100"
            step="5"
            value={formData.alertThreshold}
            onChange={(e) => setFormData(prev => ({ ...prev, alertThreshold: parseInt(e.target.value) || 80 }))}
            helperText="Dapatkan notifikasi ketika pengeluaran mencapai persentase ini dari anggaran"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-dark-100">
            <Button type="button" variant="secondary" onClick={resetForm}>
              Batal
            </Button>
            <Button type="submit">
              {editingBudget ? 'Simpan Perubahan' : 'Buat Anggaran'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingBudgetId}
        onClose={() => setDeletingBudgetId(null)}
        onConfirm={confirmDelete}
        title="Hapus Anggaran"
        message="Apakah Anda yakin ingin menghapus anggaran ini?"
        confirmText="Hapus"
        variant="danger"
      />
    </div>
  );
}

interface BudgetCardProps {
  budget: Budget & { spent: number; percentage: number; isOver: boolean; isNearLimit: boolean; category?: Category };
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const { state, formatCurrency, preferences } = useApp();
  
  return (
    <div className="p-4 hover:bg-dark-50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0`} style={{ backgroundColor: `${budget.category?.color}20` }}>
            <span>{budget.category?.icon}</span>
          </div>
          <div className="min-w-0">
            <p className="font-medium text-dark-900 truncate">{budget.category?.name || budget.categoryId}</p>
            <div className="flex items-center gap-3 mt-1 text-sm text-dark-500">
              <Badge variant="expense" size="sm" dot>{budget.period === 'monthly' ? 'Bulanan' : budget.period === 'weekly' ? 'Mingguan' : 'Tahunan'}</Badge>
              <span>Anggaran: {formatCurrency(budget.amount, preferences.currency)}</span>
            </div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className={`font-semibold ${budget.isOver ? 'text-red-600' : 'text-dark-900'}`}>
            {formatCurrency(budget.spent, preferences.currency)} / {formatCurrency(budget.amount, preferences.currency)}
          </p>
          <p className={`text-sm ${budget.isOver ? 'text-red-500' : budget.isNearLimit ? 'text-amber-500' : 'text-dark-500'}`}>
            {budget.percentage.toFixed(0)}% terpakai
            {budget.isOver && ' • Melebihi!'}
            {budget.isNearLimit && !budget.isOver && ' • Hampir penuh'}
          </p>
        </div>
      </div>
      <Progress
        value={budget.spent}
        max={budget.amount}
        variant={budget.isOver ? 'warning' : budget.isNearLimit ? 'warning' : 'expense'}
        size="md"
        className="mt-3"
      />
      <div className="flex items-center justify-end gap-2 mt-3">
        <Button variant="ghost" size="sm" onClick={() => onEdit(budget)}>
          <Edit className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(budget.id)}>
          <Trash2 className="w-4 h-4 text-red-500" />
        </Button>
      </div>
    </div>
  );
}