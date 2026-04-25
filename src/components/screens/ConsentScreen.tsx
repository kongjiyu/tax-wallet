"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Check, ChevronLeft, Building, CreditCard, Smartphone, AlertCircle, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const dataTypes = [
  { icon: <Building className="w-4 h-4" />, label: "Bank transactions", desc: "Date, merchant, amount" },
  { icon: <CreditCard className="w-4 h-4" />, label: "Card payments", desc: "Purchase records" },
  { icon: <Smartphone className="w-4 h-4" />, label: "e-Wallet", desc: "Digital payment history" },
];

const permissions = [
  "Read your transaction history",
  "Detect tax-relief eligible expenses",
  "Match with e-Invoice records",
  "Generate tax relief summary",
];

export function ConsentScreen({
  onBack,
  onConnect
}: {
  onBack: () => void;
  onConnect: () => void;
}) {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-sm"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Data Consent</h2>
            <p className="text-xs text-slate-500">Step 1 of 2</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 flex-1 overflow-y-auto pb-6">
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          To analyze your transactions for tax relief, taxWallet needs access to your financial data. Here's what we'll access:
        </p>

        {/* Data types */}
        <div className="space-y-3 mb-6">
          {dataTypes.map((type, i) => (
            <motion.div
              key={type.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                {type.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{type.label}</p>
                <p className="text-xs text-slate-500">{type.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Permissions list */}
        <Card className="p-4 rounded-2xl border border-slate-100 bg-white mb-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">What we'll do with your data:</h3>
          <div className="space-y-2.5">
            {permissions.map((perm, i) => (
              <div key={perm} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-emerald-600" />
                </div>
                <span className="text-xs text-slate-600">{perm}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Warning notice */}
        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 mb-6">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-700 mb-1">Important</p>
            <p className="text-[11px] text-amber-600 leading-relaxed">
              taxWallet only reads your data locally on your device. We do not store or transmit your financial data to any server.
            </p>
          </div>
        </div>

        {/* Consent checkbox */}
        <button
          onClick={() => setIsChecked(!isChecked)}
          className="w-full p-4 bg-white rounded-2xl border border-slate-200 flex items-start gap-3 mb-6 hover:border-slate-300 transition-colors"
        >
          <div className={cn(
            "w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
            isChecked ? "bg-blue-600 border-blue-600" : "border-slate-300"
          )}>
            {isChecked && <Check className="w-3 h-3 text-white" />}
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-slate-900">I understand and consent</p>
            <p className="text-xs text-slate-500 mt-0.5">
              I allow taxWallet to analyze my transaction data for tax relief purposes
            </p>
          </div>
        </button>
      </div>

      {/* Footer CTA */}
      <div className="px-5 py-6 bg-white border-t border-slate-100">
        <Button
          onClick={onConnect}
          disabled={!isChecked}
          className={cn(
            "w-full h-12 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all",
            isChecked
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          )}
        >
          <Lock className="w-4 h-4" />
          {isChecked ? "Authorize Analysis" : "Please accept to continue"}
        </Button>
      </div>
    </div>
  );
}