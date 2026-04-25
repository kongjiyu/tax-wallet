"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronRight,
  Receipt,
  Building,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  XCircle,
  ArrowRight,
  ReceiptText,
  Clock,
  Shield,
  Sparkles,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const TEST_USER_ID = 'user-001';

const filterConfig = {
  all: { label: "All", color: "slate" },
  claimable: { label: "Claimable", color: "emerald" },
  awaiting: { label: "Awaiting", color: "blue" },
  pending: { label: "Need docs", color: "amber" },
  failed: { label: "Failed", color: "rose" },
};

const categoryIcons: Record<string, React.ReactNode> = {
  Lifestyle: <Receipt className="w-5 h-5" />,
  Insurance: <Shield className="w-5 h-5" />,
  Sports: <Building className="w-5 h-5" />,
  Medical: <HelpCircle className="w-5 h-5" />,
  Food: <ReceiptText className="w-5 h-5" />,
};

const statusConfig = {
  claimable: {
    label: "Claimable",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    indicator: "bg-emerald-500",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />
  },
  awaiting: {
    label: "Awaiting",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    indicator: "bg-blue-500",
    icon: <AlertCircle className="w-3.5 h-3.5" />
  },
  pending: {
    label: "Need docs",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    indicator: "bg-amber-500",
    icon: <Clock className="w-3.5 h-3.5" />
  },
  failed: {
    label: "Not eligible",
    badge: "bg-slate-100 text-slate-500 border-slate-200",
    indicator: "bg-slate-300",
    icon: <XCircle className="w-3.5 h-3.5" />
  },
};

interface Transaction {
  id: string;
  merchant: string;
  date: string;
  amount: number;
  source: string;
  status: string;
  category: string;
  eInvoice: boolean;
  einvoice?: any;
  taxReliefCategory?: string;
  requiresReview?: boolean;
}

export function ActivityScreen({
  onTransactionClick
}: {
  onTransactionClick: (t: any) => void
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<keyof typeof filterConfig>("all");

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        // Use categorize endpoint to get proper status
        const response = await fetch(`/api/records/categorize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: TEST_USER_ID }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch records');
        }
        const result = await response.json();

        if (result.success && result.data && Array.isArray(result.data)) {
          // Transform categorized records to match expected format
          const transformedTransactions: Transaction[] = result.data.map((item: any) => {
            // Use database status as source of truth
            const dbStatus = item.dbStatus;

            // Map database status to activity screen status
            let status: string;
            if (dbStatus === 'claimed') {
              status = 'claimable';
            } else if (dbStatus === 'pending_confirmation') {
              status = 'awaiting';
            } else if (dbStatus === 'pending_proof') {
              status = 'pending';
            } else if (dbStatus === 'not_claimable') {
              status = 'failed';
            } else {
              status = 'pending';
            }

            return {
              ...item, // Keep all original data (transaction, einvoice, etc.)
              id: item.transaction.id,
              merchant: item.transaction.counterpartyName || 'Unknown',
              date: item.transaction.date ? new Date(item.transaction.date).toLocaleDateString('en-MY', { day: '2-digit', month: 'short' }) : 'N/A',
              amount: Number(item.transaction.amount) || 0,
              source: item.transaction.source || item.transaction.institution || 'bank',
              status,
              category: item.taxReliefCategory || 'other',
              eInvoice: !!item.einvoice,
            };
          });
          setTransactions(transformedTransactions);
        } else {
          setTransactions([]);
        }
      } catch (err) {
        console.error('Error fetching records:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  const filteredTransactions = activeFilter === "all"
    ? transactions
    : transactions.filter(t => t.status === activeFilter);

  return (
    <div className="flex flex-col bg-slate-50 min-h-full">
      {/* Header */}
      <div className="px-5 pt-14 pb-6 bg-white border-b border-slate-100">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Activity</h2>
          <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        {/* Search bar - simple, no shadow */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search transactions"
            className="pl-11 h-11 rounded-xl bg-slate-50 border-transparent focus-visible:ring-1 focus-visible:ring-blue-500 font-medium placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Filter tabs - simple underline style */}
      <div className="flex gap-1 px-5 py-4 bg-white border-b border-slate-100">
        {(Object.keys(filterConfig) as Array<keyof typeof filterConfig>).map((filter) => {
          const config = filterConfig[filter];
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-semibold transition-all capitalize",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-500 hover:bg-slate-100"
              )}
            >
              {config.label}
            </button>
          );
        })}
      </div>

      {/* Transaction list - clean, minimal */}
      <div className="flex-1 px-5 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-400">No transactions found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((t, i) => {
              const status = statusConfig[t.status as keyof typeof statusConfig] || statusConfig.pending;
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => onTransactionClick(t)}
                  className="group"
                >
                  <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all cursor-pointer">
                    {/* Category icon with status ring */}
                    <div className="relative">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center",
                        t.status === "claimable" ? "bg-emerald-50 text-emerald-600" :
                        t.status === "awaiting" ? "bg-blue-50 text-blue-600" :
                        t.status === "pending" ? "bg-amber-50 text-amber-600" :
                        "bg-slate-100 text-slate-400"
                      )}>
                        {categoryIcons[t.category] || <Receipt className="w-5 h-5" />}
                      </div>
                      {/* Status dot */}
                      <div className={cn(
                        "absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center",
                        status.indicator
                      )}>
                        {t.status === "claimable" && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                        {t.status === "awaiting" && <AlertCircle className="w-2.5 h-2.5 text-white" />}
                        {t.status === "pending" && <Clock className="w-2.5 h-2.5 text-white" />}
                        {t.status === "failed" && <XCircle className="w-2.5 h-2.5 text-white" />}
                      </div>
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <h4 className="text-sm font-semibold text-slate-900 truncate">{t.merchant}</h4>
                        <span className="text-base font-bold text-slate-900 flex-shrink-0">RM {t.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-400">{t.source}</span>
                        <span className="text-slate-200">•</span>
                        <span className="text-xs text-slate-400">{t.date}</span>
                        {t.eInvoice && (
                          <Badge variant="outline" className="text-[9px] font-medium px-1.5 py-0 bg-blue-50 text-blue-600 border-blue-100 rounded-md ml-1">
                            e-Invoice
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Arrow indicator */}
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}