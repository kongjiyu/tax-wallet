'use client';

import { useState, useEffect } from 'react';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, Minus, Building2, FileText, Clock } from 'lucide-react';

interface DocumentRecord {
  id: string;
  type: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  status: 'verified' | 'pending' | 'unverified';
}

export default function WalletPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const response = await fetch('/api/records/categorize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: 'user-001' }),
        });
        if (!response.ok) throw new Error('Failed to fetch documents');
        const data = await response.json();
        setDocuments(data.records || []);
      } catch (err) {
        setError('Unable to load documents. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchDocuments();
  }, []);

  const totalClaimable = documents
    .filter(d => d.status === 'verified')
    .reduce((sum, d) => sum + d.amount, 0);

  const totalPending = documents
    .filter(d => d.status === 'pending')
    .reduce((sum, d) => sum + d.amount, 0);

  const totalDocuments = documents.length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Documents</h1>
        <p className="text-zinc-400 mt-1">Manage your tax relief documents and proofs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-cyan-600 to-teal-600 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Wallet className="text-white/80" size={24} />
            <span className="text-xs text-white/60">Claimable Amount</span>
          </div>
          <p className="text-3xl font-bold text-white">${totalClaimable.toLocaleString()}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Clock className="text-amber-400" size={24} />
            <span className="text-xs text-zinc-400">Pending Review</span>
          </div>
          <p className="text-2xl font-bold text-amber-400">${totalPending.toLocaleString()}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <FileText className="text-blue-400" size={24} />
            <span className="text-xs text-zinc-400">Total Documents</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">{totalDocuments}</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Your Documents</h2>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-rose-400">{error}</p>
          </div>
        )}

        {!loading && !error && documents.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto text-zinc-500 mb-4" size={48} />
            <p className="text-zinc-400">No documents found</p>
            <p className="text-sm text-zinc-500 mt-1">Upload your receipts and statements to get started</p>
          </div>
        )}

        {!loading && documents.length > 0 && (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    doc.status === 'verified' ? 'bg-emerald-500/20' :
                    doc.status === 'pending' ? 'bg-amber-500/20' : 'bg-zinc-700/50'
                  }`}>
                    {doc.status === 'verified' ? (
                      <Building2 className="text-emerald-400" size={18} />
                    ) : (
                      <FileText className={doc.status === 'pending' ? 'text-amber-400' : 'text-zinc-400'} size={18} />
                    )}
                  </div>
                  <div>
                    <p className="text-white">{doc.description}</p>
                    <p className="text-sm text-zinc-500">{doc.date} • {doc.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-semibold ${
                    doc.status === 'verified' ? 'text-emerald-400' :
                    doc.status === 'pending' ? 'text-amber-400' : 'text-zinc-400'
                  }`}>
                    ${doc.amount.toLocaleString()}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    doc.status === 'verified' ? 'bg-emerald-500/20 text-emerald-400' :
                    doc.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-700/50 text-zinc-400'
                  }`}>
                    {doc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}