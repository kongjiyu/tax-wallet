"use client";

import React, { useState, useEffect } from "react";
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
  AlertTriangle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const TEST_USER_ID = 'user-001';

const docTypes = [
  { name: "Insurance", icon: <Shield className="w-3.5 h-3.5" />, key: "insurance" },
  { name: "EPF", icon: <CreditCard className="w-3.5 h-3.5" />, key: "epf" },
  { name: "SSPN", icon: <Building className="w-3.5 h-3.5" />, key: "sspn" },
  { name: "Medical", icon: <Heart className="w-3.5 h-3.5" />, key: "medical" },
  { name: "Education", icon: <GraduationCap className="w-3.5 h-3.5" />, key: "education" },
  { name: "Childcare", icon: <Baby className="w-3.5 h-3.5" />, key: "childcare" },
  { name: "Donation", icon: <HandHeart className="w-3.5 h-3.5" />, key: "donation" },
];

const statusConfig = {
  verified: {
    label: "Verified",
    color: "emerald",
    icon: <CheckCircle2 className="w-3 h-3" />,
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
  },
  pending: {
    label: "Pending",
    color: "amber",
    icon: <Clock className="w-3 h-3" />,
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
  },
};

interface Document {
  id: string;
  name: string;
  type: string;
  issuer: string;
  year: string;
  amount: number;
  status: 'verified' | 'pending';
  issue?: string;
}

export function WalletScreen({ onUploadClick }: { onUploadClick?: (category?: string) => void }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const handleDocumentClick = (doc: Document) => {
    // For pending documents, trigger upload flow
    if (doc.status === 'pending') {
      toast.success(`Upload ${doc.name}`);
      onUploadClick?.(doc.type);
    } else {
      toast.success(`${doc.name} is verified`);
    }
  };

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        // Fetch relief summary to get document info
        const response = await fetch(`/api/relief-summary?userId=${TEST_USER_ID}`);
        if (!response.ok) throw new Error('Failed to fetch');

        const result = await response.json();

        if (result.success && result.data) {
          // Transform categories to documents
          const docs: Document[] = result.data.categories?.map((cat: any, index: number) => {
            const docType = docTypes.find(t => t.key === cat.key);
            const isFilled = cat.status === 'filled';
            const isPartial = cat.amount > 0;

            return {
              id: `doc-${index}`,
              name: `${cat.name} Relief Claim`,
              type: cat.key || 'other',
              issuer: 'LHDN Verified',
              year: 'YA2025',
              amount: cat.amount || 0,
              status: isFilled ? 'verified' as const : isPartial ? 'pending' as const : 'pending' as const,
              issue: isFilled ? null : isPartial ? 'Claim in progress' : 'Not started',
            };
          }) || [];

          setDocuments(docs);
        }
      } catch (err) {
        console.error('Error fetching documents:', err);
        // Fallback empty
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

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
          onClick={() => onUploadClick?.()}
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
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-10">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No documents yet</p>
            <p className="text-xs text-slate-400 mt-1">Upload your first statement to get started</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Relief Documents</h3>
              <span className="text-xs text-slate-400">{documents.length} documents</span>
            </div>

            <div className="space-y-3">
              {documents.map((doc, i) => {
                const status = statusConfig[doc.status];
                const docType = docTypes.find(t => t.key === doc.type);
                const DocIcon = docType?.icon || <FileText className="w-3.5 h-3.5" />;

                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group"
                  >
                    <div
                      onClick={() => handleDocumentClick(doc)}
                      className="bg-white rounded-2xl p-4 border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all cursor-pointer active:scale-[0.98]"
                    >
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

                          {/* Status row */}
                          <div className="flex items-center gap-2">
                            {doc.status === "verified" ? (
                              <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                              </span>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-amber-400 rounded-full"
                                    style={{ width: doc.amount > 0 ? '60%' : '10%' }}
                                  />
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
          </>
        )}
      </div>
    </div>
  );
}