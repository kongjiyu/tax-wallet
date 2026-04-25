'use client';

import { useState } from 'react';
import { Server, Link2, CheckCircle, XCircle, Loader2, Plus, Trash2, Globe, Zap, Cloud } from 'lucide-react';

interface HostingService {
  id: string;
  name: string;
  provider: 'vercel' | 'netlify' | 'aws' | 'Railway';
  url: string;
  status: 'deployed' | 'building' | 'error';
  lastDeploy: string;
}

const providers = {
  vercel: { name: 'Vercel', icon: Globe, color: 'text-white' },
  netlify: { name: 'Netlify', icon: Zap, color: 'text-teal-400' },
  aws: { name: 'AWS Elastic Beanstalk', icon: Cloud, color: 'text-orange-400' },
  Railway: { name: 'Railway', icon: Zap, color: 'text-cyan-400' },
};

const mockServices: HostingService[] = [
  { id: '1', name: 'Production', provider: 'vercel', url: 'https://taxwallet.vercel.app', status: 'deployed', lastDeploy: '2 hours ago' },
  { id: '2', name: 'Staging', provider: 'Railway', url: 'https://staging.taxwallet.railway.app', status: 'building', lastDeploy: '5 hours ago' },
];

export default function HostingPage() {
  const [services, setServices] = useState<HostingService[]>(mockServices);
  const [showForm, setShowForm] = useState(false);
  const [deploying, setDeploying] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    provider: 'vercel' as HostingService['provider'],
    url: '',
  });

  const handleDeploy = async (id: string) => {
    setDeploying(id);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setDeploying(null);
    setServices(prev => prev.map(svc =>
      svc.id === id ? { ...svc, status: 'deployed', lastDeploy: 'Just now' } : svc
    ));
  };

  const handleAddService = () => {
    if (!formData.name || !formData.url) return;
    const newSvc: HostingService = {
      id: Date.now().toString(),
      name: formData.name,
      provider: formData.provider,
      url: formData.url,
      status: 'deployed',
      lastDeploy: 'Never',
    };
    setServices(prev => [...prev, newSvc]);
    setShowForm(false);
    setFormData({ name: '', provider: 'vercel', url: '' });
  };

  const handleDelete = (id: string) => {
    setServices(prev => prev.filter(svc => svc.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Cloud Hosting Integration</h1>
          <p className="text-zinc-400 mt-1">Manage and deploy to your cloud hosting providers</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-black font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={18} />
          Add Service
        </button>
      </div>

      {showForm && (
        <div className="bg-zinc-900 border border-cyan-500/30 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Add Hosting Service</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Service Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="My Production App"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Provider</label>
              <select
                value={formData.provider}
                onChange={e => setFormData({ ...formData, provider: e.target.value as HostingService['provider'] })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="vercel">Vercel</option>
                <option value="netlify">Netlify</option>
                <option value="aws">AWS Elastic Beanstalk</option>
                <option value="Railway">Railway</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">URL</label>
              <input
                type="text"
                value={formData.url}
                onChange={e => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleAddService}
              className="bg-cyan-500 hover:bg-cyan-600 text-black font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Add Service
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
        {services.map((svc) => {
          const provider = providers[svc.provider];
          const ProviderIcon = provider.icon;
          return (
            <div key={svc.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-cyan-500/30 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <ProviderIcon className={provider.color} size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{svc.name}</h3>
                    <p className="text-sm text-zinc-500">{provider.name}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  svc.status === 'deployed' ? 'bg-emerald-500/20 text-emerald-400' :
                  svc.status === 'building' ? 'bg-cyan-500/20 text-cyan-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {svc.status === 'deployed' ? <CheckCircle size={12} /> :
                   svc.status === 'error' ? <XCircle size={12} /> :
                   <Loader2 size={12} className="animate-spin" />}
                  {svc.status}
                </div>
              </div>
              <div className="mb-4">
                <p className="text-sm text-zinc-400">URL</p>
                <a href={svc.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline text-sm">{svc.url}</a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">Last deploy: {svc.lastDeploy}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDeploy(svc.id)}
                    disabled={deploying === svc.id}
                    className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-black px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    {deploying === svc.id ? <Loader2 className="animate-spin" size={14} /> : <Link2 size={14} />}
                    Deploy
                  </button>
                  <button
                    onClick={() => handleDelete(svc.id)}
                    className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
