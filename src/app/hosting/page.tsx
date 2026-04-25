'use client';

import { Globe, Server, Cloud, Info } from 'lucide-react';

export default function HostingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Hosting Status</h1>
          <p className="text-zinc-400 mt-1">Deployment and hosting information for tax-wallet</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
            <Globe className="text-cyan-400" size={24} />
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">Next.js Application</h2>
            <p className="text-zinc-400 mt-1">
              This application is built with Next.js 16 using the App Router. It can be deployed
              to various hosting platforms including Vercel, Netlify, or any Node.js-compatible hosting service.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
              <Globe className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-white font-semibold">Vercel</h3>
              <p className="text-sm text-zinc-500">Recommended</p>
            </div>
          </div>
          <p className="text-sm text-zinc-400">
            Deploy directly from Git for automatic deployments and edge network delivery.
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
              <Cloud className="text-teal-400" size={20} />
            </div>
            <div>
              <h3 className="text-white font-semibold">Netlify</h3>
              <p className="text-sm text-zinc-500">Alternative</p>
            </div>
          </div>
          <p className="text-sm text-zinc-400">
            Static site hosting with continuous deployment from Git repositories.
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Server className="text-orange-400" size={20} />
            </div>
            <div>
              <h3 className="text-white font-semibold">Railway</h3>
              <p className="text-sm text-zinc-500">Full-stack</p>
            </div>
          </div>
          <p className="text-sm text-zinc-400">
            Deploy full-stack applications with database support and custom domains.
          </p>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
        <div className="flex items-center gap-2 text-zinc-400">
          <Info size={18} />
          <span className="text-sm">
            Deployment configuration is managed through package.json and next.config.js.
            Environment variables are set per-deployment platform.
          </span>
        </div>
      </div>
    </div>
  );
}