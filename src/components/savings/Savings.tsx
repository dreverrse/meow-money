import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, CheckCircle, Target, Calendar, ArrowUp, ArrowDown, Flag } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { Badge, Progress } from '../ui/Badge';
import { Modal, ConfirmDialog } from '../ui/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';
import { SavingsGoal } from '../../data/types';

const iconOptions = ['🏠', '🚗', '✈️', '💻', '📱', '🎓', '💍', '👶', '🏖️', '🎮', '📷', '🎸', '🐕', '🐈', '🏥', '💰', '💎', '🎁', '🏦', '📈', '🪙', '🏆', '🎨', '📚'];
const colorOptions = ['#D1931E', '#B34F3E', '#4F8250', '#DFA832', '#9A4032', '#70996B', '#A79C85', '#B37518', '#C56E5A', '#3D6841', '#E8BE5C', '#857A65'];

export function Savings() {
  const { state, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, updateSavingsProgress } = useApp();
  const { savingsGoals, preferences } = state;
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);
  const [addingToGoalId, setAddingToGoalId] = useState<string | null>(null);
  const [addAmount, setAddAmount] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: 0,
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    icon: '🎯',
    color: '#D1931E',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const activeGoals = savingsGoals.filter(g => g.currentAmount < g.targetAmount);
  const completedGoals = savingsGoals.filter(g => g.currentAmount >= g.targetAmount);
  
  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const resetForm = () => {
    setFormData({
      name: '',
      targetAmount: '',
      currentAmount: 0,
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      icon: '🎯',
      color: '#D1931E',
    });
    setFormErrors({});
    setEditingGoal(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = 'Nama target harus diisi';
    }
    if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
      errors.targetAmount = 'Target jumlah harus lebih dari 0';
    }
    if (!formData.targetDate) {
      errors.targetDate = 'Tanggal target harus diisi';
    }
    if (new Date(formData.targetDate) < new Date().setHours(0,0,0,0)) {
      errors.targetDate = 'Tanggal target tidak boleh di masa lalu';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    const goalData = {
      name: formData.name.trim(),
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: formData.currentAmount,
      targetDate: formData.targetDate,
      icon: formData.icon,
      color: formData.color,
    };
    
    if (editingGoal) {
      updateSavingsGoal({ ...editingGoal, ...goalData });
    } else {
      addSavingsGoal(goalData);
    }
    
    resetForm();
    setIsAddModalOpen(false);
  };

  const handleEdit = (goal: SavingsGoal) => {
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount,
      targetDate: goal.targetDate.split('T')[0],
      icon: goal.icon,
      color: goal.color,
    });
    setEditingGoal(goal);
    setIsAddModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingGoalId(id);
  };

  const confirmDelete = () => {
    if (deletingGoalId) {
      deleteSavingsGoal(deletingGoalId);
      setDeletingGoalId(null);
    }
  };

  const handleAddProgress = (goalId: string) => {
    setAddingToGoalId(goalId);
    setAddAmount('');
  };

  const confirmAddProgress = () => {
    if (addingToGoalId && addAmount) {
      const amount = parseFloat(addAmount);
      if (amount > 0) {
        const goal = savingsGoals.find(g => g.id === addingToGoalId);
        if (goal) {
          updateSavingsProgress(addingToGoalId, goal.currentAmount + amount);
        }
      }
      setAddingToGoalId(null);
      setAddAmount('');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Tabungan & Target</h1>
          <p className="page-subtitle">Tetapkan target finansial dan lacak kemajuan Anda</p>
        </div>
        <Button onClick={() => { resetForm(); setIsAddModalOpen(true); }}>
          <Plus className="w-4 h-4" />
          Target Baru
        </Button>
      </div>

      {/* Overall Progress */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-400 flex items-center justify-center">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-sm text-dark-500">Total Progres Tabungan</p>
                <p className="font-display text-3xl font-bold text-dark-900">
                  {formatCurrency(totalSaved, preferences.currency)} / {formatCurrency(totalTarget, preferences.currency)}
                </p>
              </div>
            </div>
            <div className="w-full sm:w-64">
              <Progress value={totalSaved} max={totalTarget} variant="savings" size="lg" showLabel label="Progres Keseluruhan" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="stat-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary-100 flex items-center justify-center">
              <Flag className="w-6 h-6 text-secondary-500" />
            </div>
            <div>
              <p className="text-sm text-dark-500">Target Aktif</p>
              <p className="font-display text-2xl font-bold text-dark-900">{activeGoals.length}</p>
            </div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-dark-500">Target Tercapai</p>
              <p className="font-display text-2xl font-bold text-dark-900">{completedGoals.length}</p>
            </div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <p className="text-sm text-dark-500">Total Target</p>
              <p className="font-display text-2xl font-bold text-dark-900">{formatCurrency(totalTarget, preferences.currency)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Goals */}
      <div className="space-y-4 mb-6">
        <h2 className="font-display text-lg font-semibold text-dark-900 flex items-center gap-2">
          <Flag className="w-5 h-5 text-accent-500" />
          Target Aktif ({activeGoals.length})
        </h2>
        
        {activeGoals.length === 0 ? (
          <Card padding="lg" className="text-center">
            <div className="empty-state mx-auto max-w-md">
              <Flag className="empty-state-icon text-dark-300" size={32} />
              <p className="empty-state-title">Belum ada target aktif</p>
              <p className="empty-state-description">Mulai menabung untuk mencapai tujuan finansial Anda</p>
              <Button onClick={() => setIsAddModalOpen(true)} className="mt-4">
                <Plus className="w-4 h-4" />
                Buat Target Baru
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeGoals.map((goal) => (
              <SavingsGoalCard 
                key={goal.id} 
                goal={goal} 
                onEdit={handleEdit} 
                onDelete={handleDelete}
                onAddProgress={handleAddProgress}
              />
            ))}
          </div>
        )}
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-display text-lg font-semibold text-dark-900 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Target Tercapai ({completedGoals.length})
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedGoals.map((goal) => (
              <SavingsGoalCard 
                key={goal.id} 
                goal={goal} 
                onEdit={handleEdit} 
                onDelete={handleDelete}
                isCompleted
              />
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={resetForm}
        title={editingGoal ? 'Edit Target Tabungan' : 'Buat Target Tabungan'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Target"
            placeholder="Contoh: Liburan Bali, DP Motor, Dana Darurat"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            error={formErrors.name}
            leftIcon={<Flag className="w-5 h-5 text-dark-400" />}
          />

          <Input
            label="Jumlah Target"
            type="number"
            step="100000"
            min="1000"
            placeholder="0"
            value={formData.targetAmount}
            onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
            error={formErrors.targetAmount}
            leftIcon={<span className="text-dark-400">{preferences.currency === 'IDR' ? 'Rp' : '$'}</span>}
          />

          <Input
            label="Jumlah Tersimpan Saat Ini (Opsional)"
            type="number"
            step="10000"
            min="0"
            placeholder="0"
            value={formData.currentAmount}
            onChange={(e) => setFormData(prev => ({ ...prev, currentAmount: parseFloat(e.target.value) || 0 }))}
            leftIcon={<span className="text-dark-400">{preferences.currency === 'IDR' ? 'Rp' : '$'}</span>}
          />

          <Input
            label="Tanggal Target"
            type="date"
            value={formData.targetDate}
            onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
            error={formErrors.targetDate}
            min={new Date().toISOString().split('T')[0]}
          />

          <div>
            <label className="label">Ikon</label>
            <div className="grid grid-cols-10 gap-2 max-h-40 overflow-y-auto p-2 bg-ink-100 rounded-2xl">
              {iconOptions.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                    formData.icon === icon
? 'ring-2 ring-primary-500 bg-white shadow-soft'
                      : 'hover:bg-ink-100'
                    }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Warna</label>
            <div className="grid grid-cols-12 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-10 h-10 rounded-full transition-all ${formData.color === color ? 'ring-2 ring-primary-500 ring-offset-2 scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: color }}
                  aria-label={`Warna ${color}`}
                />
              ))}
            </div>
          </div>

<div className="flex justify-end gap-3 pt-4 border-t border-ink-200">
            <Button type="button" variant="secondary" onClick={resetForm}>
              Batal
            </Button>
            <Button type="submit">
              {editingGoal ? 'Simpan Perubahan' : 'Buat Target'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Progress Modal */}
      {addingToGoalId && (
        <Modal
          isOpen={true}
          onClose={() => { setAddingToGoalId(null); setAddAmount(''); }}
          title="Tambah Progres Tabungan"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-dark-600">Masukkan jumlah yang ingin ditambahkan ke tabungan ini.</p>
            <Input
              label="Jumlah"
              type="number"
              step="10000"
              min="1"
              placeholder="0"
              value={addAmount}
              onChange={(e) => setAddAmount(e.target.value)}
              leftIcon={<span className="text-dark-400">{preferences.currency === 'IDR' ? 'Rp' : '$'}</span>}
              autoFocus
            />
          <div className="flex justify-end gap-3 pt-4 border-t border-ink-200">
              <Button variant="secondary" onClick={() => { setAddingToGoalId(null); setAddAmount(''); }}>
                Batal
              </Button>
              <Button onClick={confirmAddProgress} disabled={!addAmount || parseFloat(addAmount) <= 0}>
                Tambah
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingGoalId}
        onClose={() => setDeletingGoalId(null)}
        onConfirm={confirmDelete}
        title="Hapus Target Tabungan"
        message="Apakah Anda yakin ingin menghapus target tabungan ini?"
        confirmText="Hapus"
        variant="danger"
      />
    </div>
  );
}

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  onEdit: (goal: SavingsGoal) => void;
  onDelete: (id: string) => void;
  onAddProgress?: (id: string) => void;
  isCompleted?: boolean;
}

function SavingsGoalCard({ goal, onEdit, onDelete, onAddProgress, isCompleted = false }: SavingsGoalCardProps) {
  const { state } = useApp();
  
  const percentage = goal.targetAmount > 0 ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100) : 0;
  const remaining = goal.targetAmount - goal.currentAmount;
  const daysLeft = Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const dailyTarget = daysLeft > 0 && remaining > 0 ? remaining / daysLeft : 0;

  if (isCompleted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <span className="text-2xl">{goal.icon}</span>
              </div>
              <div>
                <p className="font-semibold text-dark-900">{goal.name}</p>
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Tercapai pada {formatDate(goal.targetDate, 'DD/MM/YYYY')}
                </p>
              </div>
            </div>
            <Badge variant="success" dot>Selesai</Badge>
          </div>
          <div className="mt-4 pt-4 border-t border-green-200 flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-500">Total Tersimpan</p>
              <p className="font-bold text-green-600">{formatCurrency(goal.currentAmount, state.preferences.currency)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => onEdit(goal)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(goal.id)}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-interactive">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${goal.color}20` }}>
              {goal.icon}
            </div>
            <div>
              <p className="font-semibold text-dark-900">{goal.name}</p>
              <p className="text-sm text-dark-500">Target: {formatDate(goal.targetDate, 'DD/MM/YYYY')}</p>
            </div>
          </div>
          <Badge variant="savings" size="sm" dot>Berlangsung</Badge>
        </div>

        <Progress value={goal.currentAmount} max={goal.targetAmount} variant="savings" size="md" showLabel label={`${percentage.toFixed(0)}% Tercapai`} className="mb-4" />

        <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-ink-100 rounded-2xl">
          <div className="text-center">
            <p className="text-xs text-dark-500">Tersimpan</p>
            <p className="font-bold text-dark-900">{formatCurrency(goal.currentAmount, state.preferences.currency)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-dark-500">Sisa</p>
            <p className="font-bold text-red-600">{formatCurrency(Math.max(0, remaining), state.preferences.currency)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-dark-500">Hari Tersisa</p>
            <p className="font-bold text-dark-900">{Math.max(0, daysLeft)} hari</p>
          </div>
        </div>

        {dailyTarget > 0 && (
          <div className="mb-4 p-3 bg-primary-50 rounded-xl border border-primary-100">
            <p className="text-sm text-primary-700 flex items-center gap-1">
              <Target className="w-4 h-4" />
              Target harian: <strong>{formatCurrency(dailyTarget, state.preferences.currency)}/hari</strong> untuk mencapai tepat waktu
            </p>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          {onAddProgress && (
            <Button variant="secondary" size="sm" className="flex-1" onClick={() => onAddProgress!(goal.id)}>
              <ArrowUp className="w-4 h-4" />
              Tambah
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => onEdit(goal)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(goal.id)}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}