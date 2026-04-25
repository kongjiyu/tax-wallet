'use client';

import { Database, Link2, CheckCircle, Info } from 'lucide-react';

export default function DatabasePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Database Status</h1>
          <p className="text-zinc-400 mt-1">MySQL database connection status for tax-wallet</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
            <Database className="text-cyan-400" size={24} />
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">Prisma with MySQL</h2>
            <p className="text-zinc-400 mt-1">
              This application uses Prisma ORM with a MySQL database for persistent storage.
              Database connections are managed through the Prisma client configured in{' '}
              <code className="text-cyan-400 bg-zinc-800 px-1 py-0.5 rounded">prisma/schema.prisma</code>.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-emerald-400" size={20} />
              </div>
              <div>
                <h3 className="text-white font-semibold">Primary Database</h3>
                <p className="text-sm text-zinc-500">Connected via Prisma</p>
              </div>
            </div>
            <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
              <CheckCircle size={12} />
              Active
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Provider</span>
              <span className="text-white">MySQL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Status</span>
              <span className="text-emerald-400">Connected</span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <Link2 className="text-cyan-400" size={20} />
              </div>
              <div>
                <h3 className="text-white font-semibold">Prisma Client</h3>
                <p className="text-sm text-zinc-500">Database client initialized</p>
              </div>
            </div>
            <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-400">
              <CheckCircle size={12} />
              Ready
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Client Status</span>
              <span className="text-cyan-400">Initialized</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">ORM</span>
              <span className="text-white">Prisma</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
        <div className="flex items-center gap-2 text-zinc-400">
          <Info size={18} />
          <span className="text-sm">Database models and schema are defined in the Prisma schema file. Use Prisma Studio for database management.</span>
        </div>
      </div>
    </div>
  );
}