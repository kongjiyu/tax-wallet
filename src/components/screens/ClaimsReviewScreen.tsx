"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  Check,
  X,
  AlertCircle,
  HelpCircle,
  Receipt,
  Umbrella,
  FileText,
  CheckCircle2,
  Upload,
  Clock,
  Loader2,
  FolderOpen,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const TEST_USER_ID = 'user-001';

interface Claim {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  source: string;
  reason: string;
  status: 'needs_action' | 'waiting_docs' | 'needs_info';
  taxReliefCategory?: string;
  date?: string;
  dbStatus?: string;
}

const statusConfig = {
  needs_action: { label: "Ready to Claim", color: "blue", icon: <CheckCircle2 className="w-3 h-3" /> },
  waiting_docs: { label: "Pending Upload", color: "amber", icon: <Clock className="w-3 h-3" /> },
  needs_info: { label: "Incomplete", color: "slate", icon: <HelpCircle className="w-3 h-3" /> },
};

const categoryIcons: Record<string, React.ReactNode> = {
  lifestyle: <Receipt className="w-4 h-4" />,
  insurance: <Umbrella className="w-4 h-4" />,
  medical: <HelpCircle className="w-4 h-4" />,
  sports: <FileText className="w-4 h-4" />,
  sspn: <Umbrella className="w-4 h-4" />,
  education: <FileText className="w-4 h-4" />,
  other: <FolderOpen className="w-4 h-4" />,
};

export function ClaimsReviewScreen({ onBack, onNavigate }: { onBack: () => void; onNavigate?: (screen: string, params?: any) => void }) {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const response = await fetch(`/api/records/categorize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: TEST_USER_ID }),
        });

        if (!response.ok) throw new Error('Failed to fetch');

        const result = await response.json();

        if (result.success && result.data) {
          // Filter items that are pending proof or confirmation
          const reviewItems = result.data
            .filter((item: any) => item.dbStatus === 'pending_proof' || item.dbStatus === 'pending_confirmation')
            .map((item: any) => ({
              id: item.transaction.id,
              merchant: item.transaction.counterpartyName || 'Unknown',
              category: item.taxReliefCategory || 'lifestyle',
              amount: Number(item.transaction.amount) || 0,
              source: item.transaction.source || item.transaction.institution || 'bank',
              reason: item.dbStatus === 'pending_proof' ? 'Official statement required' : 'Confirm personal use',
              status: item.dbStatus === 'pending_proof' ? 'waiting_docs' : 'needs_action',
              dbStatus: item.dbStatus,
              date: item.transaction.date,
            }));

          setClaims(reviewItems);
        }
      } catch (err) {
        console.error('Error fetching claims:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, []);

  const handleConfirm = async (claim: Claim) => {
    try {
      const response = await fetch('/api/records/add-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: TEST_USER_ID,
          recordId: claim.id,
          assessmentYear: 'YA2025',
          reliefCode: claim.category.toUpperCase(),
          amount: claim.amount,
        }),
      });

      if (response.ok) {
        toast.success("Added to tax relief");
        setClaims(prev => prev.filter(c => c.id !== claim.id));
      } else {
        throw new Error('Failed to add');
      }
    } catch (err) {
      toast.error("Failed to confirm");
    }
  };

  const handleAction = (claim: Claim) => {
    if (claim.dbStatus === 'pending_proof') {
      onNavigate?.('wallet', { id: claim.id, merchant: claim.merchant, category: claim.category, amount: claim.amount });
    } else {
      // For iPhone confirmation, we can show details
      onNavigate?.('transaction_detail', { 
        id: claim.id, 
        merchant: claim.merchant, 
        amount: claim.amount, 
        date: claim.date,
        category: claim.category,
        source: claim.source
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-slate-50 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="px-6 pt-14 pb-4 bg-white border-b border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack} className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-none">Review Tasks</h1>
            <p className="text-xs text-slate-500 mt-1">{claims.length} items require action</p>
          </div>
        </div>
      </div>

      <div className="px-5 flex-1 overflow-y-auto pb-10 pt-6">
        {claims.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <p className="text-base font-semibold text-slate-700">All tasks completed</p>
            <p className="text-sm text-slate-400 mt-1 px-10">Your tax relief records are currently up to date.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {claims.map((claim, index) => {
              const status = statusConfig[claim.status];
              const catIcon = categoryIcons[claim.category] || categoryIcons.other;

              return (
                <motion.div
                  key={claim.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-5 rounded-[24px] bg-white border border-slate-100 shadow-sm overflow-hidden relative">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0",
                        claim.dbStatus === 'pending_proof' ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
                      )}>
                        {catIcon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-base font-bold text-slate-900 leading-tight truncate pr-4">{claim.merchant}</h4>
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">{claim.category}</p>
                          </div>
                          <p className="text-base font-bold text-slate-900 whitespace-nowrap">RM {claim.amount.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className={cn(
                      "flex items-center gap-2 p-3 rounded-xl mb-5",
                      claim.dbStatus === 'pending_proof' ? "bg-amber-50" : "bg-blue-50"
                    )}>
                      {claim.dbStatus === 'pending_proof' ? (
                        <Clock className="w-4 h-4 text-amber-500" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                      )}
                      <p className={cn(
                        "text-xs font-semibold",
                        claim.dbStatus === 'pending_proof' ? "text-amber-700" : "text-blue-700"
                      )}>
                        {claim.reason}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAction(claim)}
                        className={cn(
                          "flex-1 h-12 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95",
                          claim.dbStatus === 'pending_proof' ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
                        )}
                      >
                        {claim.dbStatus === 'pending_proof' ? 'Upload Statement' : 'Confirm Claim'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setClaims(prev => prev.filter(c => c.id !== claim.id))}
                        className="h-12 px-4 rounded-xl border-slate-200 text-slate-500 font-medium text-xs"
                      >
                        Dismiss
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}