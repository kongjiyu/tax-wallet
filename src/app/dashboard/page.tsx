import { Database, Server, TrendingUp, Wallet } from 'lucide-react';

const stats = [
  { label: 'Connected Databases', value: '2', icon: Database, color: 'text-cyan-400' },
  { label: 'Active Hostings', value: '3', icon: Server, color: 'text-teal-400' },
  { label: 'Monthly Tax Saved', value: '$1,240', icon: TrendingUp, color: 'text-emerald-400' },
  { label: 'Wallet Balance', value: '$8,450', icon: Wallet, color: 'text-blue-400' },
];

const recentActivity = [
  { id: 1, action: 'Database connected', service: 'AWS RDS', time: '2 hours ago' },
  { id: 2, action: 'Deployment completed', service: 'Vercel', time: '5 hours ago' },
  { id: 3, action: 'Tax calculated', service: 'FY 2024', time: '1 day ago' },
  { id: 4, action: 'Transaction recorded', service: 'Wallet', time: '2 days ago' },
];

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400 mt-1">Welcome to taxWallet - your all-in-one tax and wallet management platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-cyan-500/30 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <Icon className={stat.color} size={24} />
                <span className="text-2xl font-bold text-white">{stat.value}</span>
              </div>
              <p className="text-sm text-zinc-400">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0">
              <div>
                <p className="text-white">{item.action}</p>
                <p className="text-sm text-zinc-500">{item.service}</p>
              </div>
              <span className="text-sm text-zinc-500">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
