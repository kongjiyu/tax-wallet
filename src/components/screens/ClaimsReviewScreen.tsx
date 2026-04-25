"use client";

import React from "react";
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
  ArrowRight,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const claims = [
  {
    id: 1,
    merchant: "Popular Bookstore",
    category: "Lifestyle",
    amount: 128.50,
    source: "e-Invoice",
    reason: "Confirm this expense for lifestyle relief",
    status: "needs_action"
  },
  {
    id: 2,
    merchant: "AIA Malaysia",
    category: "Insurance",
    amount: 250.00,
    source: "Bank Transaction",
    reason: "Tax statement for 2025 needed",
    status: "waiting_docs"
  },
  {
    id: 3,
    merchant: "Klinik HealthCare",
    category: "Medical",
    amount: 350.00,
    source: "e-Invoice",
    reason: "Confirm if for parents or yourself",
    status: "needs_info"
  },
];

const statusConfig = {
  needs_action: { label: "Ready", color: "emerald", icon: <CheckCircle2 className="w-3 h-3" /> },
  waiting_docs: { label: "Docs needed", color: "amber", icon: <Clock className="w-3 h-3" /> },
  needs_info: { label: "Info needed", color: "blue", icon: <HelpCircle className="w-3 h-3" /> },
};

const categoryIcons: Record<string, React.ReactNode> = {
  Lifestyle: <Receipt className="w-4 h-4" />,
  Insurance: <Umbrella className="w-4 h-4" />,
  Medical: <HelpCircle className="w-4 h-4" />,
};

export function ClaimsReviewScreen({ onBack }: { onBack: () => void }) {
  const handleConfirm = (id: number) => {
    toast.success("Claim confirmed");
  };

  const handleReject = (id: number) => {
    toast.error("Claim rejected");
  };

  const handleUpload = (id: number) => {
    toast.success("Upload flow");
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="px-5 pt-14 pb-4 bg-white border-b border-slate-100">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Review Claims</h2>
            <p className="text-xs text-slate-500">{claims.length} claims to review</p>
          </div>
        </div>
      </div>

      {/* Claims list - action-focused */}
      <div className="flex-1 px-5 py-6 overflow-y-auto">
        <div className="space-y-4">
          {claims.map((claim, index) => {
            const status = statusConfig[claim.status as keyof typeof statusConfig];
            const catIcon = categoryIcons[claim.category] || <Receipt className="w-4 h-4" />;

            return (
              <motion.div
                key={claim.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <Card className="p-4 rounded-2xl border border-slate-100 bg-white">
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {/* Number badge */}
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                        {index + 1}
                      </div>
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", status.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : status.color === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600')}>
                        {catIcon}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">{claim.merchant}</h4>
                        <p className="text-xs text-slate-500">{claim.category} • RM {claim.amount.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Status pill */}
                    <span className={cn(
                      "inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full",
                      status.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                      status.color === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    )}>
                      {status.icon}
                      {status.label}
                    </span>
                  </div>

                  {/* Reason text */}
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed pl-[52px]">
                    {claim.reason}
                  </p>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 pl-[52px]">
                    {claim.status === 'needs_action' && (
                      <>
                        <Button
                          onClick={() => handleConfirm(claim.id)}
                          className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" /> Confirm
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleReject(claim.id)}
                          className="h-9 px-3 rounded-xl border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50"
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    )}
                    {claim.status === 'waiting_docs' && (
                      <Button
                        onClick={() => handleUpload(claim.id)}
                        className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium"
                      >
                        <Upload className="w-3.5 h-3.5 mr-1" /> Upload Statement
                      </Button>
                    )}
                    {claim.status === 'needs_info' && (
                      <Button
                        onClick={() => handleUpload(claim.id)}
                        className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium"
                      >
                        <ArrowRight className="w-3.5 h-3.5 mr-1" /> Add Info
                      </Button>
                    )}
                    <span className="text-[10px] text-slate-400 ml-auto">via {claim.source}</span>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Empty state - only shows if no claims */}
        {claims.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">All caught up!</p>
            <p className="text-xs text-slate-400 mt-1">No pending claims to review</p>
          </div>
        )}
      </div>
    </div>
  );
}