import React, { useState, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus, Filter, ChevronDown, ChevronUp, Search, MoreVertical,
  Edit, Trash2, Calendar, CreditCard, Wallet, Smartphone, Building2, TrendingUp
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { Badge, Avatar } from '../ui/Badge';
import { Modal, ConfirmDialog } from '../ui/Modal';
import { formatCurrency, formatDate, sortTransactionsByDate, filterTransactionsByDateRange, groupTransactionsByDate, DEFAULT_CATEGORIES } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';
import { Transaction, Category } from '../../data/types';

const typeOptions = [
  { value: 'all', label: 'Semua' },
  { value: 'income', label: 'Pemasukan' },
  { value: 'expense', label: 'Pengeluaran' },
];

const sortOptions = [
  { value: 'date-desc', label: 'Terbaru' },
  { value: 'date-asc', label: 'Terlama' },
  { value: 'amount-desc', label: 'Jumlah Terbesar' },
  { value: 'amount-asc', label: 'Jumlah Terkecil' },
];

const accountIcons: Record<string, React.ReactNode> = {
  cash: <Wallet className="w-5 h-5" />,
  bank: <Building2 className="w-5 h-5" />,
  card: <CreditCard className="w-5 h-5" />,
  ewallet: <Smartphone className="w-5 h-5" />,
  investment: <TrendingUp className="w-5 h-5" />,
};

export function Transactions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { state, addTransaction, updateTransaction, deleteTransaction } = useApp();
  const { preferences, categories, accounts } = state;
  
  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'all');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all');
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = searchParams.get('dateTo') || '';
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'date-desc');
  const [showFilters, setShowFilters] = useState(false);
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    categoryId: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    accountId: accounts[0]?.id || '',
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Update URL params when filters change
  const updateFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (typeFilter !== 'all') params.set('type', typeFilter);
    if (categoryFilter !== 'all') params.set('category', categoryFilter);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    if (sortBy !== 'date-desc') params.set('sort', sortBy);
    setSearchParams(params);
  }, [searchQuery, typeFilter, categoryFilter, dateFrom, dateTo, sortBy, setSearchParams]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let result = [...state.transactions];
    
    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.description.toLowerCase().includes(query) ||
        t.categoryName.toLowerCase().includes(query)
      );
    }
    
    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter(t => t.type === typeFilter);
    }
    
    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(t => t.categoryId === categoryFilter);
    }
    
    // Date range
    if (dateFrom || dateTo) {
      result = filterTransactionsByDateRange(result, dateFrom || '1900-01-01', dateTo || '2100-12-31');
    }
    
    // Sort
    result = sortTransactionsByDate(result, sortBy === 'date-asc' || sortBy === 'amount-asc');
    if (sortBy.startsWith('amount')) {
      result.sort((a, b) => sortBy === 'amount-desc' ? b.amount - a.amount : a.amount - b.amount);
    }
    
    return result;
  }, [state.transactions, searchQuery, typeFilter, categoryFilter, dateFrom, dateTo, sortBy]);

  // Group by date
  const groupedTransactions = useMemo(() => {
    return groupTransactionsByDate(filteredTransactions);
  }, [filteredTransactions]);

  // Statistics
  const stats = useMemo(() => {
    const income = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, balance: income - expense, count: filteredTransactions.length };
  }, [filteredTransactions]);

  // Get categories by type
  const getCategoriesByType = (type: 'income' | 'expense') => {
    return categories.filter(c => c.type === type);
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: Record<string, string> = {};
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Jumlah harus lebih dari 0';
    }
    if (!formData.categoryId) {
      errors.categoryId = 'Kategori harus dipilih';
    }
    if (!formData.date) {
      errors.date = 'Tanggal harus diisi';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    const category = categories.find(c => c.id === formData.categoryId);
    const transactionData = {
      type: formData.type,
      amount: parseFloat(formData.amount),
      categoryId: formData.categoryId,
      categoryName: category?.name || '',
      categoryIcon: category?.icon || '',
      categoryColor: category?.color || '',
      description: formData.description,
      date: new Date(formData.date).toISOString(),
    };
    
    if (editingTransaction) {
      updateTransaction({ ...editingTransaction, ...transactionData });
    } else {
      addTransaction(transactionData);
    }
    
    resetForm();
    setIsAddModalOpen(false);
  };

  const resetForm = () => {
    setFormData({
      type: 'expense',
      amount: '',
      categoryId: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      accountId: accounts[0]?.id || '',
    });
    setFormErrors({});
    setEditingTransaction(null);
  };

  const handleEdit = (transaction: Transaction) => {
    const category = categories.find(c => c.id === transaction.categoryId);
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      categoryId: transaction.categoryId,
      description: transaction.description,
      date: transaction.date.split('T')[0],
      accountId: transaction.accountId || accounts[0]?.id || '',
    });
    setEditingTransaction(transaction);
    setIsAddModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingTransactionId(id);
  };

  const confirmDelete = () => {
    if (deletingTransactionId) {
      deleteTransaction(deletingTransactionId);
      setDeletingTransactionId(null);
    }
  };

  // Open modal with type from URL
  React.useEffect(() => {
    if (searchParams.get('type') === 'income' || searchParams.get('type') === 'expense') {
      setFormData(prev => ({ ...prev, type: searchParams.get('type') as 'income' | 'expense' }));
      setIsAddModalOpen(true);
      // Clear the type param after opening
      const params = new URLSearchParams(searchParams);
      params.delete('type');
      setSearchParams(params, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const expenseCategories = getCategoriesByType('expense');
  const incomeCategories = getCategoriesByType('income');
  const currentCategories = formData.type === 'income' ? incomeCategories : expenseCategories;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Transaksi</h1>
          <p className="page-subtitle">Kelola dan lacak semua transaksi keuangan Anda</p>
        </div>
        <Button onClick={() => { resetForm(); setIsAddModalOpen(true); }} className="whitespace-nowrap">
          <Plus className="w-4 h-4" />
          Transaksi Baru
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="stat-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.303-1.106 3.182 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-dark-500">Total Pemasukan</p>
              <p className="font-display text-2xl font-bold text-secondary-600">{formatCurrency(stats.income, preferences.currency)}</p>
            </div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v2a2 2 0 01-2 2m-8 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-dark-500">Total Pengeluaran</p>
              <p className="font-display text-2xl font-bold text-red-600">{formatCurrency(stats.expense, preferences.currency)}</p>
            </div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-dark-500">Saldo</p>
              <p className="font-display text-2xl font-bold text-dark-900">{formatCurrency(stats.balance, preferences.currency)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4 pb-0">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type="text"
                  placeholder="Cari transaksi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10 py-2"
                />
              </div>
              
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                options={typeOptions}
                className="w-full sm:w-40"
              />
              
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'Semua Kategori' },
                  ...categories.map(c => ({ value: c.id, label: c.name })),
                ]}
                className="w-full sm:w-48"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Filter</span>
              </Button>
              
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={sortOptions}
                className="w-40 hidden sm:block"
              />
            </div>
          </div>
          
          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-dark-100 grid grid-cols-1 sm:grid-cols-4 gap-4 animate-slide-down">
              <Input
                label="Dari Tanggal"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <Input
                label="Sampai Tanggal"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
              <div className="sm:col-span-2 flex items-end">
                <Button variant="secondary" size="sm" onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('all');
                  setCategoryFilter('all');
                  setDateFrom('');
                  setDateTo('');
                  setSortBy('date-desc');
                }}>
                  Reset Filter
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card padding="none">
        {filteredTransactions.length === 0 ? (
          <CardContent className="py-12">
            <div className="empty-state">
              <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <p className="empty-state-title">{searchQuery || typeFilter !== 'all' || categoryFilter !== 'all' ? 'Tidak ada transaksi ditemukan' : 'Belum ada transaksi'}</p>
              <p className="empty-state-description">
                {searchQuery || typeFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Coba ubah filter atau kata kunci pencarian'
                  : 'Mulai catat transaksi pertama Anda'}
              </p>
              {!searchQuery && typeFilter === 'all' && categoryFilter === 'all' && (
                <Button onClick={() => { resetForm(); setIsAddModalOpen(true); }} className="mt-4">
                  <Plus className="w-4 h-4" />
                  Tambah Transaksi
                </Button>
              )}
            </div>
          </CardContent>
        ) : (
          <>
            <div className="divide-y divide-dark-100">
              {Object.entries(groupedTransactions).map(([date, transactions]) => (
                <div key={date}>
                  <div className="px-6 py-3 bg-dark-50 border-b border-dark-100">
                    <p className="text-sm font-medium text-dark-500">
                      {formatDate(date, preferences.dateFormat)}
                      <span className="ml-2 px-2 py-0.5 text-xs bg-dark-200 text-dark-600 rounded-md">
                        {transactions.length} transaksi
                      </span>
                    </p>
                  </div>
                  {transactions.map((transaction, index) => (
                    <div
                      key={transaction.id}
                      className={`flex items-center gap-4 p-4 hover:bg-dark-50 transition-colors ${index === transactions.length - 1 ? 'border-b' : 'border-b'} border-dark-100`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${transaction.type === 'income' ? 'bg-secondary-100' : 'bg-red-100'}`}>
                        <span>{transaction.categoryIcon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-dark-900 truncate">{transaction.description || transaction.categoryName}</p>
                        <div className="flex items-center gap-3 mt-1 text-sm text-dark-500">
                          <span>{transaction.categoryName}</span>
                          <span className="flex items-center gap-1">
                            {accountIcons[transaction.accountId] || <Wallet className="w-4 h-4" />}
                            {accounts.find(a => a.id === transaction.accountId)?.name}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${transaction.type === 'income' ? 'text-secondary-600' : 'text-red-600'}`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, preferences.currency)}
                        </p>
                        <Badge variant={transaction.type === 'income' ? 'income' : 'expense'} size="sm">
                          {transaction.type === 'income' ? 'Masuk' : 'Keluar'}
                        </Badge>
                      </div>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Show dropdown menu
                          }}
                          className="btn-icon text-dark-400 hover:text-dark-600"
                          aria-label="Opsi lainnya"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {/* Dropdown would go here */}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            
            {/* Pagination would go here */}
          </>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => { resetForm(); setIsAddModalOpen(false); }}
        title={editingTransaction ? 'Edit Transaksi' : 'Tambah Transaksi'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="expense"
                checked={formData.type === 'expense'}
                onChange={() => setFormData(prev => ({ ...prev, type: 'expense', categoryId: '' }))}
                className="sr-only peer"
              />
              <div className={`p-3 rounded-xl border-2 flex items-center gap-2 transition-all ${formData.type === 'expense' ? 'border-red-500 bg-red-50' : 'border-dark-200 hover:border-dark-300'}`}>
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v2a2 2 0 01-2 2" />
                  </svg>
                </div>
                <span className="font-medium text-dark-900">Pengeluaran</span>
              </div>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="income"
                checked={formData.type === 'income'}
                onChange={() => setFormData(prev => ({ ...prev, type: 'income', categoryId: '' }))}
                className="sr-only peer"
              />
              <div className={`p-3 rounded-xl border-2 flex items-center gap-2 transition-all ${formData.type === 'income' ? 'border-secondary-500 bg-secondary-50' : 'border-dark-200 hover:border-dark-300'}`}>
                <div className="w-8 h-8 rounded-lg bg-secondary-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.303-1.106 3.182 0z" />
                  </svg>
                </div>
                <span className="font-medium text-dark-900">Pemasukan</span>
              </div>
            </label>
          </div>

          <Input
            label="Jumlah"
            type="number"
            step="1000"
            min="1"
            placeholder="0"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            error={formErrors.amount}
            leftIcon={<span className="text-dark-400">{preferences.currency === 'IDR' ? 'Rp' : '$'}</span>}
          />

          <Select
            label="Kategori"
            value={formData.categoryId}
            onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
            options={currentCategories.map(c => ({ value: c.id, label: `${c.icon} ${c.name}` }))}
            placeholder="Pilih kategori"
            error={formErrors.categoryId}
          />

          <Input
            label="Deskripsi (Opsional)"
            placeholder="Contoh: Belanja bulanan, gaji, dll"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />

          <Input
            label="Tanggal"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            error={formErrors.date}
            max={new Date().toISOString().split('T')[0]}
          />

          <Select
            label="Akun"
            value={formData.accountId}
            onChange={(e) => setFormData(prev => ({ ...prev, accountId: e.target.value }))}
            options={accounts.map(a => ({ value: a.id, label: `${accountIcons[a.type]} ${a.name}` }))}
            placeholder="Pilih akun"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-dark-100">
            <Button type="button" variant="secondary" onClick={() => { resetForm(); setIsAddModalOpen(false); }}>
              Batal
            </Button>
            <Button type="submit" className={formData.type === 'income' ? 'bg-secondary-500 hover:bg-secondary-600' : ''}>
              {editingTransaction ? 'Simpan Perubahan' : 'Tambah Transaksi'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingTransactionId}
        onClose={() => setDeletingTransactionId(null)}
        onConfirm={confirmDelete}
        title="Hapus Transaksi"
        message="Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus"
        variant="danger"
      />
    </div>
  );
}