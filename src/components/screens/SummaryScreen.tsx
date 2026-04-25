"use client";

import React from "react";
import {
  FileText,
  Download,
  Copy,
  ChevronRight,
  CheckCircle2,
  ShieldCheck,
  Info,
  ArrowRight,
  ExternalLink,
  TrendingUp,
  Receipt
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const categories = [
  { name: "Lifestyle", amount: 2300, limit: 2500, status: "Claimable", shortName: "Life" },
  { name: "Sports", amount: 600, limit: 1000, status: "Claimable", shortName: "Sport" },
  { name: "Medical", amount: 450, limit: 10000, status: "Claimable", shortName: "Med" },
  { name: "Insurance", amount: 2000, limit: 3000, status: "Verified", shortName: "Ins" },
  { name: "SSPN", amount: 3500, limit: 8000, status: "Verified", shortName: "SSPN" },
  { name: "Education", amount: 0, limit: 7000, status: "Empty", shortName: "Edu" },
];

const chartData = categories.map(c => ({
  name: c.shortName,
  amount: c.amount,
  fullName: c.name
}));

const statusConfig = {
  Claimable: { badge: "bg-emerald-50 text-emerald-600 border-emerald-200", dot: "bg-emerald-500" },
  Verified: { badge: "bg-blue-50 text-blue-600 border-blue-200", dot: "bg-blue-500" },
  Empty: { badge: "bg-slate-50 text-slate-400 border-slate-200", dot: "bg-slate-300" },
};

export function SummaryScreen({ onNavigate }: { onNavigate: (s: any) => void }) {
  const totalClaimed = categories.reduce((sum, c) => sum + c.amount, 0);
  const totalLimit = categories.reduce((sum, c) => sum + c.limit, 0);

  const handleExport = (type: string) => {
    toast.success(`${type} summary generated for e-Filing`);
  };

  const handleCopy = () => {
    toast.success("Summary copied to clipboard");
  };

  return (
    <div className="flex flex-col bg-slate-50 min-h-full pb-10">
      {/* Header */}
      <div className="px-5 pt-12 pb-6 bg-white border-b border-slate-100">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Tax Summary</h2>
            <p className="text-sm text-slate-500 mt-0.5">YA 2025 Filing Report</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <Receipt className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
      </div>

      <div className="px-5 pt-6 space-y-6">
        {/* Total Relief Hero */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 rounded-3xl bg-white border border-slate-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16" />

            <div className="relative z-10">
              {/* Status row */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-xs font-medium text-emerald-600">Ready for e-Filing</span>
                </div>
                <span className="text-xs text-slate-400">{categories.length} categories</span>
              </div>

              {/* Total amount */}
              <div className="mb-5">
                <p className="text-xs text-slate-400 font-medium mb-1">Total Estimated Relief</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900">RM {totalClaimed.toLocaleString()}</span>
                </div>
              </div>

              {/* Progress to limit */}
              <div className="mb-5">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-500">Utilization</span>
                  <span className="font-semibold text-slate-900">{((totalClaimed / totalLimit) * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                    style={{ width: `${(totalClaimed / totalLimit) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">of RM {totalLimit.toLocaleString()} total limit</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleExport("PDF")}
                  className="flex-1 h-11 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-medium text-sm flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Export
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCopy}
                  className="h-11 w-11 rounded-xl border-slate-200 p-0 hover:bg-slate-50"
                >
                  <Copy className="w-4 h-4 text-slate-500" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Visual Breakdown - no hover needed, shows all info at once */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-5 rounded-2xl border border-slate-100 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Relief Breakdown</h3>
              <Badge className="bg-slate-100 text-slate-500 font-medium text-[10px] px-2 py-0.5 rounded-md">
                RM {totalLimit.toLocaleString()} limit
              </Badge>
            </div>

            {/* Horizontal stacked bar showing utilization */}
            <div className="mb-4">
              <div className="h-4 rounded-full bg-slate-100 overflow-hidden flex">
                {categories.filter(c => c.amount > 0).map((cat, i) => {
                  const width = (cat.amount / totalClaimed) * 100;
                  const colors = ['bg-blue-500', 'bg-blue-400', 'bg-blue-300', 'bg-blue-200'];
                  return (
                    <div
                      key={cat.name}
                      className={colors[i % colors.length]}
                      style={{ width: `${width}%` }}
                      title={`${cat.name}: RM ${cat.amount.toLocaleString()}`}
                    />
                  );
                })}
                {totalClaimed < totalLimit && (
                  <div
                    className="bg-slate-100"
                    style={{ width: `${((totalLimit - totalClaimed) / totalLimit) * 100}%` }}
                  />
                )}
              </div>
            </div>

            {/* Category list with visual bars */}
            <div className="space-y-3">
              {categories.map((cat, i) => {
                const pct = (cat.amount / cat.limit) * 100;
                const colors = ['text-blue-600', 'text-blue-500', 'text-blue-400', 'text-slate-400'];
                return (
                  <div key={cat.name} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-slate-500 w-16">{cat.name}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 w-20 text-right">RM {cat.amount.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Category List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">By Category</h3>
            <span className="text-xs text-slate-400">{categories.length} categories</span>
          </div>

          <div className="space-y-2">
            {categories.map((cat, i) => {
              const status = statusConfig[cat.status as keyof typeof statusConfig];
              return (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className="group"
                >
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${status.dot}`} />
                      <span className="text-sm font-medium text-slate-900">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">RM {cat.amount.toLocaleString()}</span>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                <Info className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  taxWallet helps prepare your relief summary. Final filing decisions remain under your responsibility according to LHDN guidelines.
                </p>
                <button className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700">
                  View LHDN Guidelines <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}