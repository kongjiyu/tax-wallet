"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  FileText,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
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
  Loader2,
  Receipt
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
  { name: "Sports", icon: <Receipt className="w-3.5 h-3.5" />, key: "sports" },
];

const categoryLabels: Record<string, string> = {
  insurance: "Insurance",
  epf: "EPF",
  sspn: "SSPN",
  medical: "Medical",
  education: "Education",
  childcare: "Childcare",
  donation: "Donation",
  sports: "Sports",
  gym_expenses: "Sports",
  sports_expenses: "Sports",
  medical_expenses: "Medical",
  provident_fund: "SSPN/EPF",
  books_journals: "Lifestyle",
  life_insurance: "Insurance",
  medical_insurance: "Insurance",
};

interface DocumentItem {
  id: string;
  merchant: string;
  category: string;
  categoryKey: string;
  amount: number;
  date: string;
  status: 'pending_confirmation' | 'pending_proof' | 'uploaded' | 'not_needed';
  reason: string;
}

export function WalletScreen({ onUploadClick }: { onUploadClick?: (doc?: {id: string; merchant: string; category: string; amount: number}) => void }) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        // Fetch categorized transactions
        const response = await fetch(`/api/records/categorize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: TEST_USER_ID }),
        });

        if (!response.ok) throw new Error('Failed to fetch');

        const result = await response.json();

        if (result.success && result.data) {
          // Filter transactions that need proof or are tax relief
          const docItems: DocumentItem[] = [];

          result.data.forEach((item: any) => {
            // Skip income transactions
            if (item.incomeCategory === 'income') return;
            if (item.transactionType === 'individual_to_individual') return;

            const taxCategory = item.taxReliefCategory;
            const dbStatus = item.dbStatus; // Use database status as source of truth

            // Only show items that have a tax category or need proof
            if (!taxCategory && dbStatus !== 'pending_proof') return;

            // Map tax category to doc type using new YA2025 codes
            let categoryKey = 'other';
            if (taxCategory === 'LIFESTYLE_SPORTS' || taxCategory === 'sports_expenses') categoryKey = 'sports';
            else if (taxCategory === 'MEDICAL_SELF' || taxCategory === 'MEDICAL_SERIOUS' || taxCategory === 'medical_expenses') categoryKey = 'medical';
            else if (taxCategory === 'SSPN' || taxCategory === 'EPF' || taxCategory === 'provident_fund') categoryKey = 'sspn';
            else if (taxCategory === 'LIFE_INSURANCE' || taxCategory === 'EDUCATION_MEDICAL_INSURANCE' || taxCategory === 'life_insurance' || taxCategory === 'medical_insurance') categoryKey = 'insurance';
            else if (taxCategory === 'EDUCATION_SELF' || taxCategory === 'education_fees') categoryKey = 'education';
            else if (taxCategory === 'LIFESTYLE_GENERAL' || taxCategory === 'books_journals') categoryKey = 'lifestyle';
            else if (taxCategory === 'CHILDCARE') categoryKey = 'childcare';

            // Map to wallet screen statuses:
            // claimed → 'uploaded' (document uploaded, green)
            // pending_confirmation → 'pending_confirmation' (needs user confirm, blue)
            // pending_proof → 'pending_proof' (needs document, amber)
            // not_claimable → 'not_needed' (not eligible, slate)
            const walletStatus: 'pending_confirmation' | 'pending_proof' | 'uploaded' | 'not_needed' = dbStatus === 'claimed' ? 'uploaded' :
                               dbStatus === 'pending_confirmation' ? 'pending_confirmation' :
                               dbStatus === 'not_claimable' ? 'not_needed' : 'pending_proof';

            docItems.push({
              id: item.transaction.id || `doc-${docItems.length}`,
              merchant: item.transaction.counterpartyName || 'Unknown',
              category: categoryLabels[taxCategory] || categoryLabels[categoryKey] || 'Other',
              categoryKey,
              amount: Number(item.transaction.amount) || 0,
              date: item.transaction.date ? new Date(item.transaction.date).toLocaleDateString('en-MY', { day: '2-digit', month: 'short' }) : 'N/A',
              status: walletStatus,
              reason: item.reviewReason || item.proofReason || (
                walletStatus === 'pending_proof' ? 'Document required for claim' :
                walletStatus === 'pending_confirmation' ? 'Confirm to claim' : 'Claim recorded'
              ),
            });
          });

          setDocuments(docItems);
        }
      } catch (err) {
        console.error('Error fetching documents:', err);
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const filteredDocs = activeFilter
    ? documents.filter(d => d.categoryKey === activeFilter)
    : documents;

  const pendingCount = documents.filter(d => d.status === 'pending_proof' || d.status === 'pending_confirmation').length;
  const uploadedCount = documents.filter(d => d.status === 'uploaded').length;

  const handleDocumentClick = (doc: DocumentItem) => {
    if (doc.status === 'pending_proof') {
      onUploadClick?.({ id: doc.id, merchant: doc.merchant, category: doc.categoryKey, amount: doc.amount });
    } else if (doc.status === 'pending_confirmation') {
      toast.info(`${doc.merchant} - Please confirm this claim in the app`);
    } else {
      toast.success(`${doc.merchant} - Document uploaded`);
    }
  };

  return (
    <div className="flex flex-col bg-slate-50 min-h-full">
      {/* Header */}
      <div className="px-5 pt-12 pb-5">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Documents</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {pendingCount > 0 ? `${pendingCount} items need attention` : 'All documents uploaded'}
            </p>
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
          <button
            onClick={() => setActiveFilter(null)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex-shrink-0",
              activeFilter === null ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-600"
            )}
          >
            All ({documents.length})
          </button>
          {docTypes.map((type) => {
            const count = documents.filter(d => d.categoryKey === type.key).length;
            if (count === 0) return null;
            return (
              <button
                key={type.name}
                onClick={() => setActiveFilter(type.key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex-shrink-0",
                  activeFilter === type.key ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-600"
                )}
              >
                {type.icon}
                {type.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Document list */}
      <div className="px-5 pb-10">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-10">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No documents needed</p>
            <p className="text-xs text-slate-400 mt-1">Upload your first statement to get started</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Required Documents</h3>
              <span className="text-xs text-slate-400">{pendingCount} pending, {uploadedCount} uploaded</span>
            </div>

            <div className="space-y-3">
              {filteredDocs.map((doc, i) => {
                const docType = docTypes.find(t => t.key === doc.categoryKey);
                const DocIcon = docType?.icon || <FileText className="w-3.5 h-3.5" />;
                const isPendingProof = doc.status === 'pending_proof';
                const isPendingConfirmation = doc.status === 'pending_confirmation';
                const isPending = isPendingProof || isPendingConfirmation;

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
                      className={cn(
                        "rounded-2xl p-4 border transition-all cursor-pointer active:scale-[0.98]",
                        isPendingProof
                          ? "bg-white border-amber-200 hover:border-amber-300 hover:shadow-sm"
                          : isPendingConfirmation
                          ? "bg-white border-blue-300 hover:border-blue-400 hover:shadow-sm"
                          : "bg-white border-emerald-200 hover:border-emerald-300 hover:shadow-sm"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        {/* File icon with type color */}
                        <div className={cn(
                          "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
                          isPendingProof ? "bg-amber-50 text-amber-600" :
                          isPendingConfirmation ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                        )}>
                          {DocIcon}
                        </div>

                        {/* Main content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-slate-900 truncate">{doc.merchant}</h4>
                            <span className="text-sm font-bold text-slate-900 flex-shrink-0">RM {doc.amount.toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-slate-400 mb-2">{doc.category} • {doc.date}</p>

                          {/* Status and reason */}
                          <div className="flex items-start gap-2">
                            {isPendingProof ? (
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-amber-500" />
                                <span className="text-xs text-amber-600 font-medium">Proof needed</span>
                                <span className="text-xs text-slate-400">• {doc.reason}</span>
                              </div>
                            ) : isPendingConfirmation ? (
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-blue-500" />
                                <span className="text-xs text-blue-600 font-medium">Confirm to claim</span>
                                <span className="text-xs text-slate-400">• {doc.reason}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-xs text-emerald-600 font-medium">Document uploaded</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action */}
                        <div className="flex-shrink-0">
                          {isPendingProof ? (
                            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                              <Upload className="w-4 h-4 text-amber-600" />
                            </div>
                          ) : isPendingConfirmation ? (
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                              <Clock className="w-4 h-4 text-blue-600" />
                            </div>
                          ) : (
                            <ChevronRight className="w-5 h-5 text-emerald-400" />
                          )}
                        </div>
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