'use client';

import { useState } from 'react';
import { Database, Link2, CheckCircle, XCircle, Loader2, Plus, Trash2 } from 'lucide-react';

interface Connection {
  id: string;
  name: string;
  host: string;
  port: string;
  database: string;
  status: 'connected' | 'disconnected' | 'error';
}

const mockConnections: Connection[] = [
  { id: '1', name: 'Production RDS', host: 'prod-db.example.com', port: '3306', database: 'taxwallet_prod', status: 'connected' },
  { id: '2', name: 'Staging DB', host: 'staging-db.example.com', port: '3306', database: 'taxwallet_staging', status: 'disconnected' },
];

export default function DatabasePage() {
  const [connections, setConnections] = useState<Connection[]>(mockConnections);
  const [showForm, setShowForm] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    host: '',
    port: '3306',
    username: '',
    password: '',
    database: '',
  });

  const handleTestConnection = async (id: string) => {
    setTesting(id);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setTesting(null);
    setConnections(prev => prev.map(conn =>
      conn.id === id ? { ...conn, status: 'connected' } : conn
    ));
  };

  const handleConnect = async () => {
    if (!formData.name || !formData.host || !formData.database) return;
    const newConn: Connection = {
      id: Date.now().toString(),
      name: formData.name,
      host: formData.host,
      port: formData.port,
      database: formData.database,
      status: 'disconnected',
    };
    setConnections(prev => [...prev, newConn]);
    setShowForm(false);
    setFormData({ name: '', host: '', port: '3306', username: '', password: '', database: '' });
  };

  const handleDelete = (id: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Cloud MySQL Integration</h1>
          <p className="text-zinc-400 mt-1">Connect and manage your cloud MySQL databases</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-black font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={18} />
          Add Connection
        </button>
      </div>

      {showForm && (
        <div className="bg-zinc-900 border border-cyan-500/30 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">New Database Connection</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Connection Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="My Production DB"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Host</label>
              <input
                type="text"
                value={formData.host}
                onChange={e => setFormData({ ...formData, host: e.target.value })}
                placeholder="db.example.com"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Port</label>
              <input
                type="text"
                value={formData.port}
                onChange={e => setFormData({ ...formData, port: e.target.value })}
                placeholder="3306"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Database Name</label>
              <input
                type="text"
                value={formData.database}
                onChange={e => setFormData({ ...formData, database: e.target.value })}
                placeholder="taxwallet"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                placeholder="admin"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleConnect}
              className="bg-cyan-500 hover:bg-cyan-600 text-black font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Save Connection
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {connections.map((conn) => (
          <div key={conn.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-cyan-500/30 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <Database className="text-cyan-400" size={20} />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{conn.name}</h3>
                  <p className="text-sm text-zinc-500">{conn.host}:{conn.port}/{conn.database}</p>
                </div>
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                conn.status === 'connected' ? 'bg-emerald-500/20 text-emerald-400' :
                conn.status === 'error' ? 'bg-red-500/20 text-red-400' :
                'bg-zinc-700 text-zinc-400'
              }`}>
                {conn.status === 'connected' ? <CheckCircle size={12} /> :
                 conn.status === 'error' ? <XCircle size={12} /> : null}
                {conn.status}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleTestConnection(conn.id)}
                disabled={testing === conn.id}
                className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                {testing === conn.id ? <Loader2 className="animate-spin" size={14} /> : <Link2 size={14} />}
                Test Connection
              </button>
              <button
                onClick={() => handleDelete(conn.id)}
                className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-colors text-sm"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
