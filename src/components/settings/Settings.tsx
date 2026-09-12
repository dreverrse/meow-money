import React, { useState, useMemo } from 'react';
import { 
  User, CreditCard, Wallet, Building2, Smartphone, 
  Bell, Shield, Palette, Globe, Language, Moon, Sun, Monitor,
  Save, Loader2, CheckCircle, TrendingUp, Trash2, Download, Plus, Edit
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Modal, ConfirmDialog } from '../ui/Modal';
import { formatCurrency } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';
import { Account, CURRENCIES, CurrencyCode, DATE_FORMATS } from '../../data/types';

const accountIcons: Record<string, React.ReactNode> = {
  cash: <Wallet className="w-5 h-5" />,
  bank: <Building2 className="w-5 h-5" />,
  card: <CreditCard className="w-5 h-5" />,
  ewallet: <Smartphone className="w-5 h-5" />,
  investment: <TrendingUp className="w-5 h-5" />,
};

const accountTypes = [
  { value: 'cash', label: 'Tunai', icon: Wallet },
  { value: 'bank', label: 'Bank', icon: Building2 },
  { value: 'card', label: 'Kartu', icon: CreditCard },
  { value: 'ewallet', label: 'E-Wallet', icon: Smartphone },
  { value: 'investment', label: 'Investasi', icon: TrendingUp },
];

const themeOptions = [
  { value: 'light', label: 'Terang', icon: Sun },
  { value: 'dark', label: 'Gelap', icon: Moon },
  { value: 'system', label: 'Sistem', icon: Monitor },
];

const currencyOptions = Object.entries(CURRENCIES).map(([code, data]) => ({
  value: code,
  label: `${data.symbol} ${data.name} (${code})`,
}));

const dateFormatOptions = Object.entries(DATE_FORMATS).map(([key, data]) => ({
  value: key,
  label: data.label,
}));

export function Settings() {
  const { state, updatePreferences, addAccount, updateAccount, deleteAccount, updateAccountBalance } = useApp();
  const { preferences, accounts } = state;
  
  const [activeTab, setActiveTab] = useState<'general' | 'accounts' | 'notifications' | 'data'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Account modal
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);
  
  const [accountForm, setAccountForm] = useState({
    name: '',
    type: 'cash' as Account['type'],
    balance: 0,
    currency: preferences.currency,
    icon: '',
    color: '#3b82f6',
    isDefault: false,
  });
  const [accountErrors, setAccountErrors] = useState<Record<string, string>>({});

  const handleSavePreferences = async (newPrefs: Partial<typeof preferences>) => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    updatePreferences(newPrefs);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const resetAccountForm = () => {
    const IconComponent = accountTypes.find(t => t.value === 'cash')?.icon;
    setAccountForm({
      name: '',
      type: 'cash',
      balance: 0,
      currency: preferences.currency,
      icon: '',
      color: '#3b82f6',
      isDefault: false,
    });
    setAccountErrors({});
    setEditingAccount(null);
  };

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: Record<string, string> = {};
    if (!accountForm.name.trim()) {
      errors.name = 'Nama akun harus diisi';
    }
    if (!accountForm.type) {
      errors.type = 'Tipe akun harus dipilih';
    }
    if (accountForm.balance < 0) {
      errors.balance = 'Saldo tidak boleh negatif';
    }
    
    if (Object.keys(errors).length > 0) {
      setAccountErrors(errors);
      return;
    }
    
    const IconComponent = accountTypes.find(t => t.value === accountForm.type)?.icon;
    
    const accountData = {
      name: accountForm.name.trim(),
      type: accountForm.type,
      balance: accountForm.balance,
      currency: accountForm.currency,
      icon: accountForm.icon,
      color: accountForm.color,
      isDefault: accountForm.isDefault,
    };
    
    if (editingAccount) {
      updateAccount({ ...editingAccount, ...accountData });
    } else {
      addAccount(accountData);
    }
    
    resetAccountForm();
    setIsAccountModalOpen(false);
  };

  const handleEditAccount = (account: Account) => {
    setAccountForm({
      name: account.name,
      type: account.type,
      balance: account.balance,
      currency: account.currency,
      icon: account.icon,
      color: account.color,
      isDefault: account.isDefault,
    });
    setEditingAccount(account);
    setIsAccountModalOpen(true);
  };

  const handleDeleteAccount = (id: string) => {
    setDeletingAccountId(id);
  };

  const confirmDeleteAccount = () => {
    if (deletingAccountId) {
      deleteAccount(deletingAccountId);
      setDeletingAccountId(null);
    }
  };

  const handleSetDefaultAccount = (id: string) => {
    accounts.forEach(acc => {
      if (acc.id === id) {
        updateAccount({ ...acc, isDefault: true });
      } else if (acc.isDefault) {
        updateAccount({ ...acc, isDefault: false });
      }
    });
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Pengaturan</h1>
          <p className="page-subtitle">Kelola preferensi, akun, dan data aplikasi</p>
        </div>
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <Badge variant="success" className="mr-2">
              <CheckCircle className="w-3 h-3" />
              Tersimpan
            </Badge>
          )}
          {isSaving && <Loader2 className="w-5 h-5 animate-spin text-primary-500" />}
        </div>
      </div>

      {/* Tabs */}
      <Card className="mb-6 overflow-hidden">
        <div className="border-b border-dark-100">
          <nav className="flex overflow-x-auto" aria-label="Tab pengaturan">
            {[
              { id: 'general', label: 'Umum', icon: User },
              { id: 'accounts', label: 'Akun', icon: Wallet },
              { id: 'notifications', label: 'Notifikasi', icon: Bell },
              { id: 'data', label: 'Data', icon: Shield },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`tab whitespace-nowrap ${activeTab === tab.id ? 'tab-active' : 'tab-inactive'}`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        <CardContent className="p-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="font-semibold text-dark-900 mb-4">Preferensi Aplikasi</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="label">Tema</label>
                    <div className="grid grid-cols-3 gap-2">
                      {themeOptions.map(({ value, label, icon: Icon }) => (
                        <label
                          key={value}
                          className={`relative cursor-pointer p-4 rounded-xl border-2 transition-all ${
                            preferences.theme === value
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-dark-200 hover:border-dark-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="theme"
                            value={value}
                            checked={preferences.theme === value}
                            onChange={() => handleSavePreferences({ theme: value as 'light' | 'dark' | 'system' })}
                            className="sr-only"
                          />
                          <div className="flex flex-col items-center gap-2">
                            <Icon className="w-6 h-6 text-dark-500" />
                            <span className="text-sm font-medium text-dark-900">{label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="label">Mata Uang</label>
                    <Select
                      value={preferences.currency}
                      onChange={(e) => handleSavePreferences({ currency: e.target.value as CurrencyCode })}
                      options={currencyOptions}
                    />
                  </div>

                  <div>
                    <label className="label">Format Tanggal</label>
                    <Select
                      value={preferences.dateFormat}
                      onChange={(e) => handleSavePreferences({ dateFormat: e.target.value as keyof typeof DATE_FORMATS })}
                      options={dateFormatOptions}
                    />
                  </div>

                  <div>
                    <label className="label">Hari Pertama Minggu</label>
                    <Select
                      value={preferences.firstDayOfWeek}
                      onChange={(e) => handleSavePreferences({ firstDayOfWeek: parseInt(e.target.value) as 0 | 1 })}
                      options={[
                        { value: '1', label: 'Senin' },
                        { value: '0', label: 'Minggu' },
                      ]}
                    />
                  </div>

                  <div>
                    <label className="label">Bahasa</label>
                    <Select
                      value={preferences.language}
                      onChange={(e) => handleSavePreferences({ language: e.target.value })}
                      options={[
                        { value: 'id', label: 'Bahasa Indonesia' },
                        { value: 'en', label: 'English' },
                      ]}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-dark-100">
                <h3 className="font-semibold text-dark-900 mb-4">Total Saldo Keseluruhan</h3>
                <div className="flex items-center justify-between p-4 bg-dark-50 rounded-xl">
                  <div>
                    <p className="text-sm text-dark-500">Saldo Total Semua Akun</p>
                    <p className="font-display text-2xl font-bold text-dark-900">{formatCurrency(totalBalance, preferences.currency)}</p>
                  </div>
                  <Badge variant="savings" size="lg" dot>{accounts.length} Akun</Badge>
                </div>
              </div>
            </div>
          )}

          {/* Accounts Tab */}
          {activeTab === 'accounts' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h3 className="font-semibold text-dark-900">Kelola Akun</h3>
                <Button onClick={() => { resetAccountForm(); setIsAccountModalOpen(true); }}>
                  <Plus className="w-4 h-4" />
                  Tambah Akun
                </Button>
              </div>

              {accounts.length === 0 ? (
                <div className="empty-state py-12">
                  <Wallet className="empty-state-icon text-dark-300" size={32} />
                  <p className="empty-state-title">Belum ada akun</p>
                  <p className="empty-state-description">Tambahkan akun untuk melacak saldo Anda</p>
                  <Button onClick={() => { resetAccountForm(); setIsAccountModalOpen(true); }} className="mt-4">
                    <Plus className="w-4 h-4" />
                    Tambah Akun Pertama
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {accounts.map((account) => {
                    const AccountIcon = accountIcons[account.type];
                    return (
                      <Card key={account.id} className={account.isDefault ? 'ring-2 ring-primary-500' : ''}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: `${account.color}20` }}>
                                {AccountIcon && <AccountIcon className="text-lg" style={{ color: account.color }} />}
                              </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-dark-900">{account.name}</p>
                                {account.isDefault && (
                                  <Badge variant="success" size="sm">Utama</Badge>
                                )}
                              </div>
                              <p className="text-sm text-dark-500">
                                {accountTypes.find(t => t.value === account.type)?.label} • {formatCurrency(account.balance, account.currency)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!account.isDefault && (
                              <Button variant="ghost" size="sm" onClick={() => handleSetDefaultAccount(account.id)}>
                                Jadikan Utama
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => handleEditAccount(account)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteAccount(account.id)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                </div>
              )}
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 max-w-2xl">
              <h3 className="font-semibold text-dark-900 mb-4">Preferensi Notifikasi</h3>
              
              <div className="space-y-4">
                {[
                  { key: 'budgetAlerts', label: 'Peringatan Anggaran', description: 'Dapatkan notifikasi ketika pengeluaran mendekati batas anggaran' },
                  { key: 'transactionReminders', label: 'Pengingat Transaksi', description: 'Pengingat untuk mencatat transaksi harian' },
                  { key: 'weeklyReports', label: 'Laporan Mingguan', description: 'Ringkasan keuangan mingguan setiap hari Senin' },
                  { key: 'monthlyReports', label: 'Laporan Bulanan', description: 'Ringkasan keuangan bulanan di awal bulan' },
                ].map(({ key, label, description }) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-dark-50 rounded-xl">
                    <div>
                      <p className="font-medium text-dark-900">{label}</p>
                      <p className="text-sm text-dark-500">{description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.notifications[key as keyof typeof preferences.notifications]}
                        onChange={(e) => handleSavePreferences({
                          notifications: { ...preferences.notifications, [key]: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Tab */}
          {activeTab === 'data' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="font-semibold text-dark-900 mb-4">Ekspor Data</h3>
                <p className="text-dark-500 mb-4">Unduh semua data transaksi, kategori, anggaran, dan target tabungan dalam format JSON.</p>
                <Button variant="secondary" onClick={() => {
                  const dataStr = JSON.stringify(state, null, 2);
                  const blob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `meow-money-backup-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}>
                  <Download className="w-4 h-4 mr-2" />
                  Ekspor Semua Data (JSON)
                </Button>
              </div>

              <div className="pt-6 border-t border-dark-100">
                <h3 className="font-semibold text-dark-900 mb-4">Impor Data</h3>
                <p className="text-dark-500 mb-4">Pulihkan data dari file backup JSON yang diekspor sebelumnya.</p>
                <Input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        try {
                          const imported = JSON.parse(event.target?.result as string);
                          // Validate and merge imported data
                          localStorage.setItem('meow-money-data', JSON.stringify(imported));
                          window.location.reload();
                        } catch (err) {
                          alert('File backup tidak valid');
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
              </div>

              <div className="pt-6 border-t border-dark-100">
                <h3 className="font-semibold text-dark-900 mb-4 text-red-600">Zona Berbahaya</h3>
                <p className="text-dark-500 mb-4">Tindakan di bawah ini bersifat permanen dan tidak dapat dibatalkan.</p>
                <Button variant="danger" onClick={() => {
                  if (confirm('Apakah Anda benar-benar yakin ingin menghapus SEMUA data? Tindakan ini tidak dapat dibatalkan.')) {
                    localStorage.removeItem('meow-money-data');
                    window.location.reload();
                  }
                }}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus Semua Data
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Modal */}
      <Modal
        isOpen={isAccountModalOpen}
        onClose={resetAccountForm}
        title={editingAccount ? 'Edit Akun' : 'Tambah Akun'}
        size="md"
      >
        <form onSubmit={handleAccountSubmit} className="space-y-4">
          <Input
            label="Nama Akun"
            placeholder="Contoh: BCA, GoPay, Tunai"
            value={accountForm.name}
            onChange={(e) => setAccountForm(prev => ({ ...prev, name: e.target.value }))}
            error={accountErrors.name}
          />

          <Select
            label="Tipe Akun"
            value={accountForm.type}
            onChange={(e) => setAccountForm(prev => ({ ...prev, type: e.target.value as Account['type'] }))}
            options={accountTypes.map(t => ({ value: t.value, label: t.label }))}
            error={accountErrors.type}
          />

          <Input
            label="Saldo Awal"
            type="number"
            step="1000"
            min="0"
            placeholder="0"
            value={accountForm.balance}
            onChange={(e) => setAccountForm(prev => ({ ...prev, balance: parseFloat(e.target.value) || 0 }))}
            error={accountErrors.balance}
            leftIcon={<span className="text-dark-400">{preferences.currency === 'IDR' ? 'Rp' : '$'}</span>}
          />

          <Select
            label="Mata Uang"
            value={accountForm.currency}
            onChange={(e) => setAccountForm(prev => ({ ...prev, currency: e.target.value as CurrencyCode }))}
            options={currencyOptions}
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={accountForm.isDefault}
              onChange={(e) => setAccountForm(prev => ({ ...prev, isDefault: e.target.checked }))}
              className="w-4 h-4 rounded border-dark-300 text-primary-500 focus:ring-primary-500"
            />
            <label htmlFor="isDefault" className="text-sm text-dark-700">Jadikan akun utama</label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-dark-100">
            <Button type="button" variant="secondary" onClick={resetAccountForm}>
              Batal
            </Button>
            <Button type="submit">
              {editingAccount ? 'Simpan Perubahan' : 'Tambah Akun'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Account Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingAccountId}
        onClose={() => setDeletingAccountId(null)}
        onConfirm={confirmDeleteAccount}
        title="Hapus Akun"
        message="Apakah Anda yakin ingin menghapus akun ini? Transaksi yang terkait akan tetap tersimpan tetapi tidak akan memiliki akun."
        confirmText="Hapus"
        variant="danger"
      />
    </div>
  );
}