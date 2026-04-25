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
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function TransactionDetailScreen({ 
  onBack, 
  transaction 
}: { 
  onBack: () => void;
  transaction: any;
}) {
  const [confirmed, setConfirmed] = useState(false);

  const lineItems = [
    { name: "iPhone 15", amount: 3999.00, status: "May be claimable", category: "Lifestyle" },
    { name: "Phone Case", amount: 199.00, status: "Not claimable", category: null },
    { name: "USB-C Cable", amount: 101.00, status: "Not claimable", category: null },
  ];

  const handleConfirm = () => {
    if (!confirmed) {
      toast.error("Please confirm personal use first");
      return;
    }
    toast.success("Claim added to Tax Relief");
    onBack();
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="px-6 pt-6 flex justify-between items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full -ml-2">
          <ChevronLeft className="w-6 h-6 text-navy" />
        </Button>
        <h2 className="text-base font-bold text-navy">Transaction Details</h2>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Share2 className="w-5 h-5 text-navy" />
        </Button>
      </div>

      <div className="px-6 flex-1 overflow-y-auto no-scrollbar pb-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-white border border-slate-100 rounded-[2rem] flex items-center justify-center mb-4 shadow-sm">
            <Receipt className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-navy mb-1">{transaction?.merchant || "Apple Store Malaysia"}</h3>
          <p className="text-3xl font-extrabold text-navy">RM {transaction?.amount?.toFixed(2) || "4,299.00"}</p>
          <Badge className="mt-3 bg-blue-100 text-blue-600 border-none shadow-none font-bold">
            <ShieldCheck size={12} className="mr-1" /> e-Invoice matched
          </Badge>
        </div>

        <Card className="p-5 rounded-3xl border-slate-100 shadow-sm mb-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Calendar size={14} /> Date
              </span>
              <span className="text-navy font-bold">{transaction?.date || "12 Oct 2025"}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <CreditCard size={14} /> Payment
              </span>
              <span className="text-navy font-bold">{transaction?.source || "Visa •••• 1234"}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Building2 size={14} /> Merchant TIN
              </span>
              <span className="text-navy font-bold">C1234567890</span>
            </div>
            <Separator className="bg-slate-50" />
            <div className="flex justify-between items-center">
              <span className="text-xs text-blue-600 font-bold">Match confidence</span>
              <span className="text-xs font-extrabold text-blue-600">96%</span>
            </div>
          </div>
        </Card>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center px-1">
            <h4 className="text-sm font-bold text-navy uppercase tracking-tight">e-Invoice Items</h4>
            <Badge variant="outline" className="text-[10px] h-5 border-blue-100 text-blue-500 font-bold">
              3 Items
            </Badge>
          </div>
          
          <div className="space-y-3">
            {lineItems.map((item, i) => (
              <Card key={i} className="p-4 rounded-2xl border-slate-50 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="text-sm font-bold text-navy">{item.name}</h5>
                  <span className="text-sm font-bold text-navy">RM {item.amount.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={cn(
                    "text-[9px] font-bold px-1.5 py-0 h-4 border-none shadow-none",
                    item.category ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"
                  )}>
                    {item.status}
                  </Badge>
                  {item.category && (
                    <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0 h-4 border-blue-100 text-blue-500">
                      {item.category}
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Card className="p-4 rounded-2xl border-blue-50 bg-blue-50/20 mb-8 border-2">
          <div className="flex gap-3">
            <div className="p-1.5 bg-blue-100 rounded-lg h-fit mt-0.5">
              <Info size={14} className="text-blue-600" />
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              The iPhone may qualify under <span className="text-navy font-bold">Lifestyle Relief</span>, subject to annual limit and non-business use confirmation. Accessories are not included.
            </p>
          </div>
        </Card>

        <div className="flex items-start gap-3 mb-10 px-1">
          <Checkbox 
            id="confirm" 
            checked={confirmed} 
            onCheckedChange={(val) => setConfirmed(!!val)}
            className="mt-1 border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          />
          <label 
            htmlFor="confirm" 
            className="text-xs font-medium text-slate-500 leading-relaxed cursor-pointer"
          >
            I confirm this item is for personal, non-business use and the receipt will be kept for 7 years.
          </label>
        </div>
      </div>

      <div className="p-6 mt-auto border-t border-slate-50 flex gap-3">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex-1 h-14 rounded-2xl border-slate-200 text-slate-600 font-bold"
        >
          Reject
        </Button>
        <Button 
          onClick={handleConfirm}
          className="flex-[2] h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-100"
        >
          Confirm Claim
        </Button>
      </div>
    </div>
  );
}
