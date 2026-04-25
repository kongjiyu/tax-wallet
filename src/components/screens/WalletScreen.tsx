"use client";

import React from "react";
import {
  Plus,
  FileText,
  ChevronRight,
  CheckCircle2,
  Clock,
  Upload,
  FolderOpen,
  Shield,
  CreditCard,
  Building,
  Heart,
  GraduationCap,
  Baby,
  HandHeart,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const docTypes = [
  { name: "Insurance", icon: <Shield className="w-3.5 h-3.5" /> },
  { name: "EPF", icon: <CreditCard className="w-3.5 h-3.5" /> },
  { name: "SSPN", icon: <Building className="w-3.5 h-3.5" /> },
  { name: "Medical", icon: <Heart className="w-3.5 h-3.5" /> },
  { name: "Education", icon: <GraduationCap className="w-3.5 h-3.5" /> },
  { name: "Childcare", icon: <Baby className="w-3.5 h-3.5" /> },
  { name: "Donation", icon: <HandHeart className="w-3.5 h-3.5" /> },
];

const documents = [
  {
    id: 1,
    name: "AIA Insurance Tax Statement",
    type: "Insurance",
    issuer: "AIA Malaysia",
    year: "2025",
    amount: 2000.00,
    status: "verified",
    issue: null,
  },
  {
    id: 2,
    name: "SSPN Statement",
    type: "SSPN",
    issuer: "PTPTN",
    year: "2025",
    amount: 3500.00,
    status: "pending",
    issue: "Statement not received",
  },
  {
    id: 3,
    name: "EPF Contribution Statement",
    type: "EPF",
    issuer: "KWSP",
    year: "2025",
    amount: 4000.00,
    status: "verified",
    issue: null,
  },
  {
    id: 4,
    name: "Gym Membership Receipt",
    type: "Sports",
    issuer: "Fitness First",
    year: "2025",
    amount: 600.00,
    status: "pending",
    issue: "Confirm sports eligibility",
  },
];

const statusConfig = {
  verified: {
    label: "Done",
    color: "emerald",
    icon: <CheckCircle2 className="w-3 h-3" />,
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
  },
  pending: {
    label: "To-do",
    color: "amber",
    icon: <Clock className="w-3 h-3" />,
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
  },
};

export function WalletScreen({ onUploadClick }: { onUploadClick: () => void }) {
  return (
    <div className="flex flex-col bg-slate-50 min-h-full">
      {/* Header */}
      <div className="px-5 pt-12 pb-5">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Documents</h2>
            <p className="text-sm text-slate-500 mt-0.5">Store proof for claims without e-Invoice</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
            <FolderOpen className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Upload zone - prominent CTA */}
      <div className="px-5 mb-6">
        <button
          onClick={onUploadClick}
          className="w-full p-5 rounded-2xl bg-white border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Plus className="text-white w-5 h-5" />
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-semibold text-slate-900">Upload Statement or Receipt</p>
            <p className="text-xs text-slate-400">PDF, JPG or PNG up to 10MB</p>
          </div>
          <Upload className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
        </button>
      </div>

      {/* Document type filter - icon chips */}
      <div className="px-5 mb-5">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
          {docTypes.map((type) => (
            <button
              key={type.name}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:border-blue-200 hover:text-blue-600 transition-colors flex-shrink-0"
            >
              {type.icon}
              {type.name}
            </button>
          ))}
        </div>
      </div>

      {/* Document list */}
      <div className="px-5 pb-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900">Recent Documents</h3>
          <span className="text-xs text-slate-400">{documents.length} documents</span>
        </div>

        <div className="space-y-3">
          {documents.map((doc, i) => {
            const status = statusConfig[doc.status as keyof typeof statusConfig];
            const docType = docTypes.find(t => t.name === doc.type);
            const DocIcon = docType?.icon || <FileText className="w-3.5 h-3.5" />;

            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group"
              >
                <div className="bg-white rounded-2xl p-4 border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all cursor-pointer">
                  <div className="flex items-start gap-4">
                    {/* File icon with type color */}
                    <div className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
                      doc.status === "verified" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    )}>
                      {DocIcon}
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-slate-900 truncate">{doc.name}</h4>
                        <span className="text-sm font-bold text-slate-900 flex-shrink-0">RM {doc.amount.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-slate-400 mb-3">{doc.issuer} • {doc.year}</p>

                      {/* Status row - using simple text label instead of badge */}
                      <div className="flex items-center gap-2">
                        {doc.status === "verified" ? (
                          <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            {/* Progress bar style indicator instead of badge */}
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="w-2/3 h-full bg-amber-400 rounded-full" />
                            </div>
                            <span className="text-xs font-medium text-amber-600">Pending</span>
                            {doc.issue && (
                              <span className="text-[10px] text-slate-400">• {doc.issue}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action chevron */}
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}