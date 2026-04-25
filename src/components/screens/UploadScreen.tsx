"use client";

import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  FileText, 
  Check, 
  Loader2, 
  ShieldCheck, 
  Info,
  Building2,
  Calendar,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function UploadScreen({ onBack }: { onBack: () => void }) {
  const [status, setStatus] = useState<"uploading" | "extracting" | "complete">("uploading");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (status === "uploading") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStatus("extracting"), 500);
            return 100;
          }
          return prev + 10;
        });
      }, 150);
      return () => clearInterval(interval);
    } else if (status === "extracting") {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStatus("complete"), 800);
            return 100;
          }
          return prev + 5;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [status]);

  const handleAddToRelief = () => {
    toast.success("Insurance statement added to tax relief");
    onBack();
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="px-6 pt-6 flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full -ml-2">
          <ChevronLeft className="w-6 h-6 text-navy" />
        </Button>
        <h2 className="text-base font-bold text-navy ml-2">Upload Document</h2>
      </div>

      <div className="px-6 flex-1 overflow-y-auto no-scrollbar pb-10">
        <AnimatePresence mode="wait">
          {status !== "complete" ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-24 h-24 bg-blue-50 rounded-[2.5rem] flex items-center justify-center mb-6 relative">
                <FileText className="w-10 h-10 text-blue-600" />
                <div className="absolute inset-0 rounded-[2.5rem] border-4 border-blue-600 border-t-transparent animate-spin opacity-20" />
              </div>
              <h3 className="text-lg font-bold text-navy mb-2">
                {status === "uploading" ? "Uploading Document..." : "Detecting relief categories..."}
              </h3>
              <p className="text-xs text-slate-400 mb-8">AIA_Insurance_Statement_2025.pdf</p>
              
              <div className="w-full max-w-[240px] space-y-2">
                <Progress value={progress} className="h-2 bg-slate-100" indicatorClassName="bg-blue-600" />
                <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">{progress}%</p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm">
                  <Check className="w-8 h-8 text-green-600" strokeWidth={3} />
                </div>
                <h3 className="text-xl font-bold text-navy">Extraction Complete</h3>
                <p className="text-xs text-slate-500 mt-1">Found 2 claimable categories</p>
              </div>

              <Card className="p-5 rounded-3xl border-slate-100 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4">
                  <Badge className="bg-blue-50 text-blue-600 border-none shadow-none font-bold text-[10px]">
                    92% Confidence
                  </Badge>
                </div>
                
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">Document Details</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium flex items-center gap-2">
                      <FileText size={14} /> Type
                    </span>
                    <span className="text-navy font-bold">Insurance Tax Statement</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium flex items-center gap-2">
                      <Building2 size={14} /> Issuer
                    </span>
                    <span className="text-navy font-bold">AIA Malaysia</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium flex items-center gap-2">
                      <Calendar size={14} /> Year
                    </span>
                    <span className="text-navy font-bold">2025</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-50 space-y-3">
                  <div className="bg-slate-50 p-3 rounded-2xl flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Life Insurance</p>
                      <p className="text-xs font-bold text-navy">Relief Eligible</p>
                    </div>
                    <span className="text-sm font-extrabold text-navy">RM 1,200</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Medical Insurance</p>
                      <p className="text-xs font-bold text-navy">Relief Eligible</p>
                    </div>
                    <span className="text-sm font-extrabold text-navy">RM 800</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4 rounded-2xl border-amber-50 bg-amber-50/20 border-2">
                <div className="flex gap-3">
                  <div className="p-1.5 bg-amber-100 rounded-lg h-fit mt-0.5">
                    <AlertCircle size={14} className="text-amber-600" />
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    Please verify extracted information before confirming. Our system has detected these fields with high confidence, but manual review is recommended.
                  </p>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {status === "complete" && (
        <div className="p-6 mt-auto border-t border-slate-50 flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => setStatus("uploading")}
            className="flex-1 h-14 rounded-2xl border-slate-200 text-slate-600 font-bold"
          >
            Re-scan
          </Button>
          <Button 
            onClick={handleAddToRelief}
            className="flex-[2] h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-100"
          >
            Add to Tax Relief
          </Button>
        </div>
      )}
    </div>
  );
}
