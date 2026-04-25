"use client";

import React, { useState, useRef } from "react";
import {
  ChevronLeft,
  FileText,
  Check,
  X,
  Loader2,
  ShieldCheck,
  Info,
  Building2,
  Calendar,
  AlertCircle,
  Upload,
  X as XIcon,
  Camera,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Mapping from AI-detected category names to LHDN relief codes (matching database)
const CATEGORY_MAPPING: Record<string, string> = {
  'LIFE': 'INSURANCE_LIFE',
  'LIFE INSURANCE': 'INSURANCE_LIFE',
  'MEDICAL': 'INSURANCE_MEDICAL',
  'MEDICAL INSURANCE': 'INSURANCE_MEDICAL',
  'MEDICAL/LIFE': 'INSURANCE_MEDICAL',
  'HEALTH': 'INSURANCE_MEDICAL',
  'EPF': 'EPF',
  'SSPN': 'SSPN',
  'EDUCATION': 'EDUCATION_SELF',
  'BOOKS': 'LIFESTYLE',
  'SPORTS': 'SPORTS',
  'GYM': 'SPORTS',
  'MEDICAL_EXPENSES': 'MEDICAL_SELF',
  'MEDICAL EXPENSES': 'MEDICAL_SELF',
};

// Validation rules for tax relief (using database relief codes)
const RELIEF_LIMITS: Record<string, { max: number; category: string }> = {
  'INSURANCE_LIFE': { max: 3000, category: 'Life Insurance' },
  'INSURANCE_MEDICAL': { max: 4000, category: 'Medical/Education Insurance' },
  'EPF': { max: 4000, category: 'EPF/KWSP' },
  'SSPN': { max: 8000, category: 'SSPN' },
  'EDUCATION_SELF': { max: 7000, category: 'Education Fees' },
  'LIFESTYLE': { max: 2500, category: 'Lifestyle' },
  'SPORTS': { max: 1000, category: 'Sports' },
  'MEDICAL_SELF': { max: 10000, category: 'Medical (Self/Spouse/Child)' },
};

interface ExtractedCategory {
  name: string;
  amount: number;
  eligible: boolean;
  lhdnCategory?: string;
  validated?: boolean;
  validationReason?: string;
}

interface AnalysisResult {
  documentType: string;
  issuer: string;
  amount: number;
  date: string;
  year: string;
  categories: ExtractedCategory[];
  confidence: number;
  fileName: string;
  rawCategories?: ExtractedCategory[];
}

// Validate claim against LHDN rules
const validateClaim = (category: ExtractedCategory): ExtractedCategory => {
  const upperName = category.name.toUpperCase();
  let lhdnCategory = 'other';
  let limit = 0;
  let found = false;

  // Try to match category name
  for (const [key, mapping] of Object.entries(CATEGORY_MAPPING)) {
    if (upperName.includes(key)) {
      lhdnCategory = mapping;
      limit = RELIEF_LIMITS[mapping]?.max || 0;
      found = true;
      break;
    }
  }

  if (!found) {
    return {
      ...category,
      lhdnCategory: 'other',
      validated: false,
      validationReason: 'Category not recognized as valid LHDN tax relief'
    };
  }

  // Check if within limits
  if (limit > 0 && category.amount > limit) {
    return {
      ...category,
      lhdnCategory,
      eligible: false,
      validated: true,
      validationReason: `Exceeds RM${limit.toLocaleString()} limit for ${RELIEF_LIMITS[lhdnCategory]?.category}`
    };
  }

  return {
    ...category,
    lhdnCategory,
    eligible: true,
    validated: true,
    validationReason: `Valid ${RELIEF_LIMITS[lhdnCategory]?.category || lhdnCategory} claim`
  };
};

export function UploadScreen({ onBack, pendingDoc }: { onBack: () => void; pendingDoc?: {id: string; merchant: string; category: string; amount: number} | null }) {
  const [status, setStatus] = useState<"select" | "analyzing" | "complete">("select");
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingDocId, setPendingDocId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setStatus("select");
      setResult(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    try {
      setStatus("analyzing");
      setProgress(0);
      setError(null);

      // Simulate progress while AI is analyzing
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Call backend API for document analysis
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('category', 'general');

      const response = await fetch('/api/analyze-document', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      clearInterval(progressInterval);
      setProgress(100);

      // Parse and validate the response
      if (result.success && result.data) {
        let parsedResult;
        try {
          const content = typeof result.data === 'string' ? result.data : JSON.stringify(result.data);
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedResult = JSON.parse(jsonMatch[0]);
          } else {
            parsedResult = typeof result.data === 'object' ? result.data : {};
          }
        } catch {
          throw new Error("Failed to parse AI response");
        }

        // Store raw categories from AI
        const rawCategories = parsedResult.categories || [];

        // Validate each category against LHDN rules
        const validatedCategories = rawCategories.map((cat: ExtractedCategory) => validateClaim(cat));

        setResult({
          ...parsedResult,
          categories: validatedCategories,
          rawCategories: rawCategories,
          fileName: selectedFile?.name || 'document'
        });
        setStatus("complete");
      } else {
        throw new Error(result.error || "Failed to analyze document");
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze document');
      toast.error('Failed to analyze document. Please try again.');
      setStatus("select");
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setStatus("select");
    setProgress(0);
  };

  const handleAddToRelief = async () => {
    if (!result) {
      toast.success("Document added to tax relief");
      onBack();
      return;
    }

    try {
      // Get valid (eligible) categories from the analysis result
      const validCategories = (result.categories || []).filter((cat: any) => cat.validated && cat.eligible);

      if (validCategories.length > 0 && pendingDoc) {
        // Add each valid category as a claim
        for (const cat of validCategories) {
          const reliefCode = cat.lhdnCategory || 'other';

          await fetch('/api/records/add-claim', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: 'user-001',
              recordId: pendingDoc.id,
              assessmentYear: 'YA2025',
              reliefCode: reliefCode,
              amount: cat.amount,
              category: reliefCode
            }),
          });
        }

        toast.success(`${validCategories.length} claim(s) added to tax relief`);
      } else {
        toast.success("Document added to tax relief");
      }
    } catch (err) {
      console.error('Error adding claim:', err);
      toast.error("Failed to add claim");
    }

    onBack();
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="px-6 pt-6 flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full -ml-2">
          <ChevronLeft className="w-6 h-6 text-navy" />
        </Button>
        <h2 className="text-base font-bold text-navy ml-2">Upload Document</h2>
      </div>

      {/* Pending document info */}
      {pendingDoc && (
        <div className="px-6 mb-4">
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-xs text-amber-600 font-medium mb-1">Uploading for:</p>
            <p className="text-sm font-bold text-slate-800">{pendingDoc.merchant}</p>
            <p className="text-xs text-slate-500">RM {pendingDoc.amount.toLocaleString()} • {pendingDoc.category}</p>
          </div>
        </div>
      )}

      <div className="px-6 flex-1 overflow-y-auto no-scrollbar pb-10">
        <AnimatePresence mode="wait">
          {status === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* File preview / upload area */}
              <div
                onClick={triggerFileSelect}
                className={cn(
                  "relative rounded-3xl border-2 border-dashed transition-all cursor-pointer overflow-hidden",
                  previewUrl
                    ? "border-blue-300 bg-blue-50"
                    : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/50"
                )}
              >
                {previewUrl ? (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Document preview"
                      className="w-full h-64 object-contain"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReset();
                      }}
                      className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md"
                    >
                      <X className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                      <Upload className="w-8 h-8 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-bold text-navy mb-2">Upload Document</h3>
                    <p className="text-xs text-slate-400 mb-4">Tap to select or take a photo</p>
                    <div className="flex gap-3">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerFileSelect();
                        }}
                        className="h-11 px-6 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-medium text-sm"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Choose File
                      </Button>
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.info("Camera feature coming soon");
                        }}
                        className="h-11 px-6 rounded-xl border-slate-200 text-slate-600 font-medium text-sm"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Take Photo
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Selected file info */}
              {selectedFile && (
                <Card className="p-4 rounded-2xl border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy truncate">{selectedFile.name}</p>
                      <p className="text-xs text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <Button
                      onClick={handleAnalyze}
                      className="h-11 px-6 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-medium text-sm"
                    >
                      Analyze
                    </Button>
                  </div>
                </Card>
              )}

              {/* Error display */}
              {error && (
                <Card className="p-4 rounded-2xl border-red-200 bg-red-50">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </Card>
              )}

              {/* Supported documents */}
              <div className="bg-slate-50 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Supported Documents</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Insurance Statement",
                    "Medical Receipt",
                    "Sports Receipt",
                    "Education Invoice",
                    "SSPN Statement",
                    "EPF Statement"
                  ].map(doc => (
                    <div key={doc} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      <span className="text-xs text-slate-500">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {status === "analyzing" && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Document preview"
                  className="w-32 h-32 object-contain rounded-2xl mb-6 opacity-50"
                />
              )}
              <div className="w-24 h-24 bg-blue-50 rounded-[2.5rem] flex items-center justify-center mb-6 relative">
                <FileText className="w-10 h-10 text-blue-600" />
                <div className="absolute inset-0 rounded-[2.5rem] border-4 border-blue-600 border-t-transparent animate-spin opacity-20" />
              </div>
              <h3 className="text-lg font-bold text-navy mb-2">Analyzing Document...</h3>
              <p className="text-xs text-slate-400 mb-8">{selectedFile?.name}</p>

              <div className="w-full max-w-[240px] space-y-2">
                <Progress value={progress} className="h-2 bg-slate-100" indicatorClassName="bg-blue-600" />
                <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">{progress}%</p>
              </div>
            </motion.div>
          )}

          {status === "complete" && result && (
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
                <h3 className="text-xl font-bold text-navy">Analysis Complete</h3>
                <p className="text-xs text-slate-500 mt-1">Found {result.categories?.length || 0} claimable items</p>
              </div>

              <Card className="p-5 rounded-3xl border-slate-100 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4">
                  <Badge className={cn(
                    "border-none shadow-none font-bold text-[10px]",
                    (result.confidence || 0) >= 0.8 ? "bg-green-50 text-green-600" :
                    (result.confidence || 0) >= 0.6 ? "bg-amber-50 text-amber-600" :
                    "bg-red-50 text-red-600"
                  )}>
                    {Math.round((result.confidence || 0) * 100)}% Confidence
                  </Badge>
                </div>

                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">Document Details</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium flex items-center gap-2">
                      <FileText size={14} /> Type
                    </span>
                    <span className="text-navy font-bold">{result.documentType || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium flex items-center gap-2">
                      <Building2 size={14} /> Issuer
                    </span>
                    <span className="text-navy font-bold">{result.issuer || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium flex items-center gap-2">
                      <Calendar size={14} /> Year
                    </span>
                    <span className="text-navy font-bold">{result.year || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium flex items-center gap-2">
                      <FileText size={14} /> Amount
                    </span>
                    <span className="text-navy font-bold">RM {(result.amount || 0).toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-50 space-y-3">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Detected Claims</p>
                  {(result.categories || []).map((cat: any, i: number) => (
                    <div
                      key={i}
                      className={cn(
                        "p-3 rounded-2xl",
                        cat.validated ? (
                          cat.eligible ? "bg-emerald-50 border border-emerald-100" : "bg-rose-50 border border-rose-100"
                        ) : "bg-slate-50 border border-slate-100"
                      )}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-xs font-bold text-slate-700">{cat.name || 'Unknown'}</p>
                        <span className="text-sm font-extrabold text-slate-700">
                          RM {(cat.amount || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {cat.validated ? (
                          cat.eligible ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                              <CheckCircle2 className="w-3 h-3" /> LHDN Validated
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-rose-600">
                              <XIcon className="w-3 h-3" /> {cat.validationReason || 'Not eligible'}
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500">
                            <AlertTriangle className="w-3 h-3" /> {cat.validationReason || 'Pending validation'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {result.rawCategories && result.rawCategories.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-[10px] font-medium text-slate-400 mb-2">Raw AI Detection (for debugging)</p>
                    <div className="space-y-2">
                      {result.rawCategories.map((cat: any, i: number) => (
                        <div key={i} className="flex justify-between text-[10px] text-slate-400">
                          <span>{cat.name}: RM {cat.amount} → eligible: {cat.eligible ? 'yes' : 'no'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              <Card className="p-4 rounded-2xl border-amber-50 bg-amber-50/20 border-2">
                <div className="flex gap-3">
                  <div className="p-1.5 bg-amber-100 rounded-lg h-fit mt-0.5">
                    <AlertCircle size={14} className="text-amber-600" />
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    Please verify extracted information before confirming. Claims shown as "LHDN Validated" have been checked against official relief limits.
                  </p>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {status === "complete" && result && (
        <div className="p-6 mt-auto border-t border-slate-50 flex gap-3">
          <Button
            variant="outline"
            onClick={handleReset}
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

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}