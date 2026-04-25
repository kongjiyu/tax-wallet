"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  Share2,
  ExternalLink,
  ShieldCheck,
  Check,
  Receipt,
  Info,
  Calendar,
  CreditCard,
  Building2,
  AlertCircle,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LineItem {
  name: string;
  amount: number;
  status: string;
  category: string | null;
  eligible: boolean;
}

export function TransactionDetailScreen({
  onBack,
  transaction
}: {
  onBack: () => void;
  transaction: any;
}) {
  const [confirmed, setConfirmed] = useState(false);

  // Clean date formatting
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Generate line items from transaction data (einvoice items)
  const lineItems: LineItem[] = transaction?.einvoice?.items?.length > 0
    ? transaction.einvoice.items.map((item: any) => ({
        name: item.description,
        amount: Number(item.totalPrice),
        category: item.category === 'lifestyle' ? 'lifestyle' : 'other',
        status: item.category === 'lifestyle' ? "May be claimable" : "Not claimable",
        eligible: item.category === 'lifestyle'
      }))
    : transaction?.category && transaction.category !== 'other'
      ? [{ name: transaction?.merchant || 'Item', amount: transaction?.amount || 0, status: "May be claimable", category: transaction?.category, eligible: true }]
      : [{ name: transaction?.merchant || 'Transaction', amount: transaction?.amount || 0, status: "Not claimable", category: null, eligible: false }];

  if (!transaction) {
    return (
      <div className="flex flex-col h-full bg-slate-50 items-center justify-center p-6 text-center">
        <Receipt className="w-12 h-12 text-slate-200 mb-4" />
        <h2 className="text-lg font-bold text-slate-900 mb-2">No transaction data</h2>
        <p className="text-sm text-slate-500 mb-6">We couldn't find the details for this transaction.</p>
        <Button onClick={onBack} className="rounded-xl bg-blue-600">
          Go Back
        </Button>
      </div>
    );
  }

  // Get confidence based on transaction type
  const getMatchConfidence = () => {
    if (transaction?.taxReliefCategory === 'insurance' || transaction?.taxReliefCategory === 'LIFE_INSURANCE') return 96;
    if (transaction?.taxReliefCategory === 'EDUCATION_MEDICAL_INSURANCE') return 94;
    if (transaction?.taxReliefCategory === 'SSPN' || transaction?.taxReliefCategory === 'EPF') return 98;
    if (transaction?.requiresReview) return 75;
    return 85;
  };

  const matchConfidence = getMatchConfidence();

  const isPendingProof = transaction?.dbStatus === 'pending_proof' || transaction?.status === 'pending';

  const handleConfirm = async () => {
    if (isPendingProof) {
      toast.error("Please upload supporting documents first");
      return;
    }
    
    if (!confirmed) {
      toast.error("Please confirm personal use first");
      return;
    }

    try {
      // Find the claimable amount from line items (only eligible items)
      const claimableAmount = lineItems
        .filter(item => item.eligible)
        .reduce((sum, item) => sum + item.amount, 0);

      // Map categories correctly to database relief codes
      let reliefCode = (transaction.taxReliefCategory || 'LIFESTYLE').toUpperCase();
      if (reliefCode === 'LIFE_INSURANCE') reliefCode = 'INSURANCE_LIFE';
      if (reliefCode === 'MEDICAL_INSURANCE') reliefCode = 'INSURANCE_MEDICAL';

      const response = await fetch('/api/records/add-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-001',
          recordId: transaction.id,
          assessmentYear: 'YA2025',
          reliefCode: reliefCode,
          amount: claimableAmount > 0 ? claimableAmount : transaction.amount,
          category: reliefCode // Pass for persistence in financial_records
        }),
      });

      if (response.ok) {
        toast.success("Claim added to Tax Relief");
        onBack();
      } else {
        throw new Error('Failed to add claim');
      }
    } catch (err) {
      console.error('Error confirming claim:', err);
      toast.error("Failed to confirm claim");
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="px-6 pt-14 pb-6 flex justify-between items-center bg-white border-b border-slate-100">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl bg-slate-50">
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </Button>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Transaction Details</h2>
        <Button variant="ghost" size="icon" className="rounded-xl bg-slate-50">
          <Share2 className="w-5 h-5 text-slate-600" />
        </Button>
      </div>

      <div className="px-5 flex-1 overflow-y-auto no-scrollbar pb-10 pt-6">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-white border border-slate-100 rounded-[2rem] flex items-center justify-center mb-4 shadow-sm">
            <Receipt className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-1">{transaction?.merchant || transaction?.counterpartyName || "Unknown Merchant"}</h3>
          <p className="text-4xl font-bold text-slate-900 tracking-tight">RM {(transaction?.amount || 0).toLocaleString()}</p>
          <Badge className="mt-4 bg-blue-50 text-blue-600 border-blue-100 shadow-none font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
            <ShieldCheck size={14} /> e-Invoice matched
          </Badge>
        </div>

        <Card className="p-5 rounded-[24px] border-slate-100 shadow-sm mb-6 bg-white">
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5 uppercase tracking-wider">
                <Calendar size={14} className="text-slate-300" /> Date
              </span>
              <span className="text-slate-900 font-bold">{formatDate(transaction?.date || transaction?.transaction?.date)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5 uppercase tracking-wider">
                <CreditCard size={14} className="text-slate-300" /> Payment
              </span>
              <span className="text-slate-900 font-bold uppercase">{transaction?.source || transaction?.transaction?.source || "bank"}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5 uppercase tracking-wider">
                <Building2 size={14} className="text-slate-300" /> Merchant TIN
              </span>
              <span className="text-slate-900 font-bold">{transaction?.merchantTin || "T1234567890"}</span>
            </div>
            <Separator className="bg-slate-50" />
            <div className="flex justify-between items-center">
              <span className="text-xs text-blue-600 font-bold uppercase tracking-wider">Match confidence</span>
              <span className="text-sm font-bold text-blue-600">{matchConfidence}%</span>
            </div>
          </div>
        </Card>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center px-1">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.1em]">e-Invoice Items</h4>
            <Badge variant="outline" className="text-[10px] h-5 border-slate-100 text-slate-400 font-bold bg-slate-50 px-2 rounded-lg">
              {lineItems.length} Items
            </Badge>
          </div>
          
          <div className="space-y-3">
            {lineItems.map((item: LineItem, i: number) => (
              <Card key={i} className={cn(
                "p-4 rounded-[20px] border shadow-none transition-all",
                item.eligible ? "border-blue-100 bg-white" : "border-slate-50 bg-slate-50/50 grayscale opacity-80"
              )}>
                <div className="flex justify-between items-start mb-3">
                  <h5 className="text-sm font-bold text-slate-900 flex-1 pr-4">{item.name}</h5>
                  <span className="text-sm font-bold text-slate-900">RM {item.amount.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={cn(
                    "text-[9px] font-extrabold px-2 py-0.5 h-5 border-none shadow-none uppercase tracking-wider rounded-md",
                    item.eligible ? "bg-blue-50 text-blue-600" : "bg-slate-200 text-slate-400"
                  )}>
                    {item.eligible ? "Claimable" : "Non-Claimable"}
                  </Badge>
                  {item.category && (
                    <Badge variant="outline" className="text-[9px] font-extrabold px-2 py-0.5 h-5 border-blue-100 text-blue-500 bg-blue-50/30 uppercase tracking-wider rounded-md">
                      {item.category}
                    </Badge>
                  )}
                  {!item.eligible && (
                    <span className="text-[10px] text-slate-400 font-medium ml-1 flex items-center gap-1">
                      <X size={10} strokeWidth={3} /> Not Tax Relief
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Card className="p-4 rounded-[20px] border-blue-100 bg-blue-50/30 mb-8">
          <div className="flex gap-3">
            <div className="p-2 bg-white rounded-xl h-fit shadow-sm">
              <Info size={14} className="text-blue-600" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {isPendingProof 
                  ? "An official statement or receipt is required to verify this claim before it can be added to your relief wallet."
                  : "Only the iPhone is eligible for Lifestyle relief. Accessories and cables are excluded per LHDN guidelines."}
              </p>
            </div>
          </div>
        </Card>

        <div className="flex items-start gap-3 mb-10 px-1">
          <Checkbox 
            id="confirm" 
            checked={confirmed} 
            onCheckedChange={(val) => setConfirmed(!!val)}
            className="mt-1 border-slate-300 rounded-md h-5 w-5 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 shadow-sm"
          />
          <label 
            htmlFor="confirm" 
            className="text-xs font-semibold text-slate-500 leading-relaxed cursor-pointer"
          >
            I confirm this item is for personal, non-business use and the receipt will be kept for 7 years.
          </label>
        </div>
      </div>

      <div className="p-6 mt-auto bg-white border-t border-slate-100 flex gap-3">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex-1 h-14 rounded-2xl border-slate-200 text-slate-500 font-bold transition-all active:scale-95"
        >
          {isPendingProof ? "Back" : "Reject"}
        </Button>
        <Button 
          onClick={isPendingProof ? () => onBack() : handleConfirm}
          className="flex-[2] h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
        >
          {isPendingProof ? "Upload Statement" : "Confirm Claim"}
        </Button>
      </div>
    </div>
  );
}
