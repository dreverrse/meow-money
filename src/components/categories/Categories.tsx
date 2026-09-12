import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, ChevronDown, ChevronUp, Tag, DollarSign, Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { Badge, Avatar } from '../ui/Badge';
import { Modal, ConfirmDialog } from '../ui/Modal';
import { formatCurrency } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';
import { Category, DEFAULT_CATEGORIES } from '../../data/types';

const typeOptions = [
  { value: 'expense', label: 'Pengeluaran' },
  { value: 'income', label: 'Pemasukan' },
];

const iconOptions = ['🍔', '🚌', '🛍️', '🎮', '🏥', '📚', '📄', '✈️', '👤', '📦', '💰', '💻', '📈', '🎁', '💵', '🏠', '🚗', '📱', '🎓', '💊', '🐾', '🎨', '🎵', '📷', '⚽', '🎬', '🛒', '💳', '🏦', '💎', '🪙'];

const colorOptions = [
  '#D1931E', '#B34F3E', '#4F8250', '#DFA832', '#9A4032', '#70996B', '#A79C85', '#B37518', '#C56E5A', '#3D6841',
  '#E8BE5C', '#8F5F13', '#857A65', '#325535', '#7E352A', '#645B4A', '#CBC1AC', '#6E4914', '#2A442C', '#38332A',
];

export function Categories() {
  const { state, addCategory, updateCategory, deleteCategory } = useApp();
  const { categories, preferences } = state;
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    icon: '📦',
    color: '#A79C85',
    type: 'expense' as 'income' | 'expense',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filteredCategories = useMemo(() => {
    return categories
      .filter(c => typeFilter === 'all' || c.type === typeFilter)
      .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.icon.includes(searchQuery));
  }, [categories, typeFilter, searchQuery]);

  const expenseCategories = filteredCategories.filter(c => c.type === 'expense');
  const incomeCategories = filteredCategories.filter(c => c.type === 'income');

  const resetForm = () => {
    setFormData({
      name: '',
      icon: '📦',
      color: '#A79C85',
      type: 'expense',
    });
    setFormErrors({});
    setEditingCategory(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = 'Nama kategori harus diisi';
    }
    if (!formData.icon) {
      errors.icon = 'Ikon harus dipilih';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    const categoryData = {
      name: formData.name.trim(),
      icon: formData.icon,
      color: formData.color,
      type: formData.type,
    };
    
    if (editingCategory) {
      updateCategory({ ...editingCategory, ...categoryData });
    } else {
      addCategory(categoryData);
    }
    
    resetForm();
    setIsAddModalOpen(false);
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      icon: category.icon,
      color: category.color,
      type: category.type,
    });
    setEditingCategory(category);
    setIsAddModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingCategoryId(id);
  };

  const confirmDelete = () => {
    if (deletingCategoryId) {
      deleteCategory(deletingCategoryId);
      setDeletingCategoryId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Kategori</h1>
          <p className="page-subtitle">Kelola kategori pemasukan dan pengeluaran</p>
        </div>
        <Button onClick={() => { resetForm(); setFormData(prev => ({ ...prev, type: 'expense' })); setIsAddModalOpen(true); }}>
          <Plus className="w-4 h-4" />
          Kategori Baru
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                placeholder="Cari kategori..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10 py-2"
              />
            </div>
            
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | 'income' | 'expense')}
              options={[
                { value: 'all', label: 'Semua' },
                { value: 'expense', label: 'Pengeluaran' },
                { value: 'income', label: 'Pemasukan' },
              ]}
              className="w-full sm:w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories List */}
      <div className="space-y-6">
        {/* Expense Categories */}
        <Card padding="none">
          <CardHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <Tag className="w-5 h-5 text-red-500" />
                </div>
                <CardTitle>Kategori Pengeluaran</CardTitle>
              </div>
              <Badge variant="expense" size="sm">{expenseCategories.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {expenseCategories.length === 0 ? (
              <div className="empty-state py-8">
                <Tag className="empty-state-icon text-dark-300" size={32} />
                <p className="empty-state-title">Belum ada kategori pengeluaran</p>
                <p className="empty-state-description">Tambah kategori untuk mengorganisir pengeluaran Anda</p>
                <Button onClick={() => { resetForm(); setFormData(prev => ({ ...prev, type: 'expense' })); setIsAddModalOpen(true); }} className="mt-4">
                  <Plus className="w-4 h-4" />
                  Tambah Kategori
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-dark-100">
                {expenseCategories.map((category) => (
                  <div key={category.id} className="flex items-center gap-4 p-4 hover:bg-dark-50 transition-colors">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: `${category.color}20` }}>
                      <span>{category.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-dark-900">{category.name}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-dark-500">
                        <Badge variant="expense" size="sm" dot>Pengeluaran</Badge>
                        <span style={{ color: category.color }}>●</span> {category.color}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(category)} aria-label="Edit kategori">
                        <Edit className="w-4 h-4" />
                      </Button>
                      {!category.isDefault && (
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(category.id)} aria-label="Hapus kategori">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Income Categories */}
        <Card padding="none">
          <CardHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-secondary-100 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-secondary-500" />
                </div>
                <CardTitle>Kategori Pemasukan</CardTitle>
              </div>
              <Badge variant="income" size="sm">{incomeCategories.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {incomeCategories.length === 0 ? (
              <div className="empty-state py-8">
                <DollarSign className="empty-state-icon text-dark-300" size={32} />
                <p className="empty-state-title">Belum ada kategori pemasukan</p>
                <p className="empty-state-description">Tambah kategori untuk mengorganisir pemasukan Anda</p>
                <Button onClick={() => { resetForm(); setFormData(prev => ({ ...prev, type: 'income' })); setIsAddModalOpen(true); }} className="mt-4">
                  <Plus className="w-4 h-4" />
                  Tambah Kategori
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-dark-100">
                {incomeCategories.map((category) => (
                  <div key={category.id} className="flex items-center gap-4 p-4 hover:bg-dark-50 transition-colors">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: `${category.color}20` }}>
                      <span>{category.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-dark-900">{category.name}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-dark-500">
                        <Badge variant="income" size="sm" dot>Pemasukan</Badge>
                        <span style={{ color: category.color }}>●</span> {category.color}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(category)} aria-label="Edit kategori">
                        <Edit className="w-4 h-4" />
                      </Button>
                      {!category.isDefault && (
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(category.id)} aria-label="Hapus kategori">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={resetForm}
        title={editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Kategori"
            placeholder="Contoh: Makanan, Transport, Gaji"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            error={formErrors.name}
            leftIcon={<Tag className="w-5 h-5 text-dark-400" />}
          />

          <div>
            <label className="label">Ikon</label>
            <div className="grid grid-cols-10 gap-2 max-h-48 overflow-y-auto p-2 bg-dark-50 rounded-xl">
              {iconOptions.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                    formData.icon === icon
                      ? 'ring-2 ring-primary-500 bg-white shadow-soft'
                      : 'hover:bg-dark-100'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
            {formErrors.icon && <p className="mt-1 text-sm text-red-600">{formErrors.icon}</p>}
          </div>

          <div>
            <label className="label">Warna</label>
            <div className="grid grid-cols-10 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-10 h-10 rounded-lg transition-all ${formData.color === color ? 'ring-2 ring-primary-500 ring-offset-2 scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: color }}
                  aria-label={`Warna ${color}`}
                />
              ))}
            </div>
          </div>

          <Select
            label="Tipe"
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'income' | 'expense', icon: '📦' }))}
            options={typeOptions}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-dark-100">
            <Button type="button" variant="secondary" onClick={resetForm}>
              Batal
            </Button>
            <Button type="submit">
              {editingCategory ? 'Simpan Perubahan' : 'Tambah Kategori'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingCategoryId}
        onClose={() => setDeletingCategoryId(null)}
        onConfirm={confirmDelete}
        title="Hapus Kategori"
        message="Apakah Anda yakin ingin menghapus kategori ini? Transaksi yang menggunakan kategori ini akan dipindahkan ke kategori 'Lainnya'."
        confirmText="Hapus"
        variant="danger"
      />
    </div>
  );
}