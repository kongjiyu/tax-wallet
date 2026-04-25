'use client';

import { useState } from 'react';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, Minus, CreditCard, Building2, Landmark } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description: string;
  date: string;
  category: string;
}

const mockTransactions: Transaction[] = [
  { id: '1', type: 'income', amount: 5000, description: 'Client Payment - ABC Corp', date: '2024-03-15', category: 'Income' },
  { id: '2', type: 'expense', amount: 150, description: 'Software Subscription', date: '2024-03-14', category: 'Software' },
  { id: '3', type: 'expense', amount: 89, description: 'Office Supplies', date: '2024-03-13', category: 'Office' },
  { id: '4', type: 'transfer', amount: 1000, description: 'Tax Reserve Transfer', date: '2024-03-12', category: 'Transfer' },
  { id: '5', type: 'income', amount: 2500, description: 'Consulting Fee', date: '2024-03-10', category: 'Income' },
];

const categories = ['Income', 'Software', 'Office', 'Marketing', 'Travel', 'Transfer'];

export default function WalletPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [balance, setBalance] = useState(8450.00);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'income' as Transaction['type'],
    amount: '',
    description: '',
    category: 'Income',
  });

  const handleAddTransaction = () => {
    if (!formData.amount || !formData.description) return;

    const amount = parseFloat(formData.amount);
    const newTx: Transaction = {
      id: Date.now().toString(),
      type: formData.type,
      amount: formData.type === 'expense' ? -amount : amount,
      description: formData.description,
      date: new Date().toISOString().split('T')[0],
      category: formData.category,
    };

    setTransactions(prev => [newTx, ...prev]);
    setBalance(prev => prev + newTx.amount);
    setShowForm(false);
    setFormData({ type: 'income', amount: '', description: '', category: 'Income' });
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Wallet</h1>
        <p className="text-zinc-400 mt-1">Track your income, expenses, and manage your balance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-cyan-600 to-teal-600 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Wallet className="text-white/80" size={24} />
            <span className="text-xs text-white/60">Available Balance</span>
          </div>
          <p className="text-3xl font-bold text-white">${balance.toLocaleString()}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <ArrowDownLeft className="text-emerald-400" size={24} />
            <span className="text-xs text-zinc-400">Total Income</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">${totalIncome.toLocaleString()}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <ArrowUpRight className="text-red-400" size={24} />
            <span className="text-xs text-zinc-400">Total Expenses</span>
          </div>
          <p className="text-2xl font-bold text-red-400">${totalExpenses.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <button
          onClick={() => { setFormData({ ...formData, type: 'income' }); setShowForm(true); }}
          className="bg-zinc-900 border border-zinc-800 hover:border-emerald-500/30 rounded-xl p-6 flex items-center gap-4 transition-colors"
        >
          <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
            <Plus className="text-emerald-400" size={24} />
          </div>
          <div className="text-left">
            <p className="text-white font-semibold">Add Income</p>
            <p className="text-sm text-zinc-400">Record incoming payment</p>
          </div>
        </button>

        <button
          onClick={() => { setFormData({ ...formData, type: 'expense' }); setShowForm(true); }}
          className="bg-zinc-900 border border-zinc-800 hover:border-red-500/30 rounded-xl p-6 flex items-center gap-4 transition-colors"
        >
          <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
            <Minus className="text-red-400" size={24} />
          </div>
          <div className="text-left">
            <p className="text-white font-semibold">Add Expense</p>
            <p className="text-sm text-zinc-400">Record outgoing payment</p>
          </div>
        </button>

        <button
          onClick={() => { setFormData({ ...formData, type: 'transfer' }); setShowForm(true); }}
          className="bg-zinc-900 border border-zinc-800 hover:border-cyan-500/30 rounded-xl p-6 flex items-center gap-4 transition-colors"
        >
          <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
            <ArrowUpRight className="text-cyan-400" size={24} />
          </div>
          <div className="text-left">
            <p className="text-white font-semibold">Transfer</p>
            <p className="text-sm text-zinc-400">Move between accounts</p>
          </div>
        </button>
      </div>

      {showForm && (
        <div className="bg-zinc-900 border border-cyan-500/30 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">
            Add {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Amount ($)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Payment description"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleAddTransaction}
              className="bg-cyan-500 hover:bg-cyan-600 text-black font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Add Transaction
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Transactions</h2>
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  tx.type === 'income' ? 'bg-emerald-500/20' :
                  tx.type === 'expense' ? 'bg-red-500/20' : 'bg-cyan-500/20'
                }`}>
                  {tx.type === 'income' ? <ArrowDownLeft className="text-emerald-400" size={18} /> :
                   tx.type === 'expense' ? <ArrowUpRight className="text-red-400" size={18} /> :
                   <Building2 className="text-cyan-400" size={18} />}
                </div>
                <div>
                  <p className="text-white">{tx.description}</p>
                  <p className="text-sm text-zinc-500">{tx.date} • {tx.category}</p>
                </div>
              </div>
              <span className={`font-semibold ${
                tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
