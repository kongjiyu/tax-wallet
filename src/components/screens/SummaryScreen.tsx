"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Copy,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  ShieldCheck,
  Info,
  ArrowRight,
  ExternalLink,
  TrendingUp,
  Receipt,
  Loader2,
  BookOpen,
  Dumbbell,
  Heart,
  Umbrella,
  Building,
  GraduationCap,
  CreditCard,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const TEST_USER_ID = 'user-001';

const mockCategories = [
  { key: "lifestyle", name: "Lifestyle", amount: 2300, limit: 2500, status: "Claimable", shortName: "Life" },
  { key: "sports", name: "Sports", amount: 600, limit: 1000, status: "Claimable", shortName: "Sport" },
  { key: "medical", name: "Medical", amount: 450, limit: 10000, status: "Claimable", shortName: "Med" },
  { key: "insurance", name: "Insurance", amount: 2000, limit: 3000, status: "Verified", shortName: "Ins" },
  { key: "sspn", name: "SSPN", amount: 3500, limit: 8000, status: "Verified", shortName: "SSPN" },
  { key: "education", name: "Education", amount: 0, limit: 7000, status: "Empty", shortName: "Edu" },
];

const statusConfig = {
  Claimable: { badge: "bg-emerald-50 text-emerald-600 border-emerald-200", dot: "bg-emerald-500", label: "Claimable" },
  Verified: { badge: "bg-blue-50 text-blue-600 border-blue-200", dot: "bg-blue-500", label: "Verified" },
  Empty: { badge: "bg-slate-50 text-slate-400 border-slate-200", dot: "bg-slate-300", label: "Not started" },
  available: { badge: "bg-emerald-50 text-emerald-600 border-emerald-200", dot: "bg-emerald-500", label: "Available" },
  almost_full: { badge: "bg-amber-50 text-amber-600 border-amber-200", dot: "bg-amber-500", label: "Almost full" },
  filled: { badge: "bg-blue-50 text-blue-600 border-blue-200", dot: "bg-blue-500", label: "Filled" },
};

const categoryIcons: Record<string, React.ReactNode> = {
  lifestyle: <BookOpen className="w-5 h-5" />,
  sports: <Dumbbell className="w-5 h-5" />,
  medical: <Heart className="w-5 h-5" />,
  insurance: <Umbrella className="w-5 h-5" />,
  sspn: <Building className="w-5 h-5" />,
  education: <GraduationCap className="w-5 h-5" />,
  epf: <CreditCard className="w-5 h-5" />,
};

const categoryColors: Record<string, { bg: string; text: string; light: string }> = {
  lifestyle: { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50" },
  sports: { bg: "bg-teal-500", text: "text-teal-600", light: "bg-teal-50" },
  medical: { bg: "bg-rose-500", text: "text-rose-600", light: "bg-rose-50" },
  insurance: { bg: "bg-indigo-500", text: "text-indigo-600", light: "bg-indigo-50" },
  sspn: { bg: "bg-amber-500", text: "text-amber-600", light: "bg-amber-50" },
  education: { bg: "bg-slate-500", text: "text-slate-600", light: "bg-slate-50" },
  epf: { bg: "bg-indigo-500", text: "text-indigo-600", light: "bg-indigo-50" },
};

interface Category {
  key: string;
  name: string;
  amount: number;
  limit: number;
  status: string;
  shortName: string;
}

interface TransactionItem {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  status: string;
  description?: string;
}

interface SummaryScreenProps {
  onNavigate: (s: any) => void;
  initialCategory?: Category | null;
  onBack?: () => void;
}

export function SummaryScreen({ onNavigate, initialCategory = null, onBack }: SummaryScreenProps) {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [totalClaimed, setTotalClaimed] = useState(0);
  const [totalLimit, setTotalLimit] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(initialCategory);
  const [categoryTransactions, setCategoryTransactions] = useState<TransactionItem[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  useEffect(() => {
    const fetchReliefSummary = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/relief-summary?userId=${TEST_USER_ID}`);
        if (!response.ok) {
          throw new Error('Failed to fetch relief summary');
        }
        const result = await response.json();

        if (result.success && result.data) {
          const apiData = result.data;

          // Transform API categories to match expected format
          let transformedCategories: Category[];

          if (apiData.categories && Array.isArray(apiData.categories)) {
            transformedCategories = apiData.categories.map((cat: any) => ({
              key: cat.key || 'lifestyle',
              name: cat.name || cat.key || 'Unknown',
              amount: cat.amount || 0,
              limit: cat.limit || 0,
              status: cat.status || 'Empty',
              shortName: (cat.name || cat.key || 'Unknown').substring(0, 4),
            }));
          } else {
            transformedCategories = mockCategories;
          }

          setCategories(transformedCategories);

          // Calculate totals from categories
          const claimed = transformedCategories.reduce((sum, c) => sum + c.amount, 0);
          const limit = transformedCategories.reduce((sum, c) => sum + c.limit, 0);
          setTotalClaimed(claimed);
          setTotalLimit(limit);
        }
      } catch (err) {
        console.error('Error fetching relief summary:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setCategories(mockCategories);
        const claimed = mockCategories.reduce((sum, c) => sum + c.amount, 0);
        const limit = mockCategories.reduce((sum, c) => sum + c.limit, 0);
        setTotalClaimed(claimed);
        setTotalLimit(limit);
      } finally {
        setLoading(false);
      }
    };

    fetchReliefSummary();
  }, []);

  const fetchCategoryTransactions = async (category: Category) => {
    try {
      setLoadingTransactions(true);
      const response = await fetch(`/api/records/categorize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: TEST_USER_ID }),
      });

      if (!response.ok) throw new Error('Failed to fetch');

      const result = await response.json();

      if (result.success && result.data) {
        // Map category keys to tax relief categories
        const categoryMapping: Record<string, string[]> = {
          medical: ['medical_expenses', 'medical_education_expenses'],
          sports: ['sports_expenses', 'gym_expenses'],
          sspn: ['provident_fund'],
          education: ['education_fees', 'postgraduate_study'],
          insurance: ['life_insurance', 'medical_insurance', 'education_insurance'],
          lifestyle: ['books_journals', 'broadband_internet', 'handphone', 'computer_laptop'],
        };

        const validCategories = categoryMapping[category.key] || [category.key];

        // Filter transactions for this category
        const filtered = result.data.filter((item: any) => {
          return item.taxReliefCategory && validCategories.includes(item.taxReliefCategory);
        });

        const transactions: TransactionItem[] = filtered.map((item: any, index: number) => ({
          id: item.transaction.id || `txn-${index}`,
          date: item.transaction.date ? new Date(item.transaction.date).toLocaleDateString('en-MY', { day: '2-digit', month: 'short' }) : 'N/A',
          merchant: item.transaction.counterpartyName || 'Unknown',
          amount: Number(item.transaction.amount) || 0,
          status: item.requiresReview ? 'pending' : 'verified',
          description: item.transaction.description || '',
        }));

        setCategoryTransactions(transactions);
      }
    } catch (err) {
      console.error('Error fetching category transactions:', err);
      setCategoryTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    fetchCategoryTransactions(category);
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setCategoryTransactions([]);
    onBack?.();
  };

  const handleExport = (type: string) => {
    toast.success(`${type} summary generated for e-Filing`);
  };

  const handleCopy = () => {
    toast.success("Summary copied to clipboard");
  };

  // Category Detail View
  if (selectedCategory) {
    const colors = categoryColors[selectedCategory.key] || categoryColors.lifestyle;
    const status = statusConfig[selectedCategory.status as keyof typeof statusConfig] || statusConfig.Empty;
    const remaining = selectedCategory.limit - selectedCategory.amount;
    const pct = selectedCategory.limit > 0 ? (selectedCategory.amount / selectedCategory.limit) * 100 : 0;

    return (
      <div className="flex flex-col bg-slate-50 min-h-full pb-10">
        {/* Header */}
        <div className="px-5 pt-12 pb-4 bg-white border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colors.light, colors.text)}>
                {categoryIcons[selectedCategory.key] || <FileText className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{selectedCategory.name}</h2>
                <p className="text-xs text-slate-500">Category details</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 pt-6 space-y-6">
          {/* Category Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-5 rounded-2xl bg-white border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <span className={cn("text-xs font-medium px-2 py-1 rounded-full border", status.badge)}>
                  {status.label}
                </span>
                <span className="text-xs text-slate-400">{categoryTransactions.length} transactions</span>
              </div>

              <div className="mb-4">
                <p className="text-xs text-slate-400 font-medium mb-1">Claimed Amount</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900">RM {selectedCategory.amount.toLocaleString()}</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-500">Limit Utilization</span>
                  <span className="font-semibold text-slate-900">{pct.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", colors.bg)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-slate-400">RM {selectedCategory.amount.toLocaleString()} claimed</span>
                  <span className="text-[10px] text-slate-400">RM {remaining.toLocaleString()} remaining</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] text-slate-400 mb-1">Limit</p>
                  <p className="text-sm font-bold text-slate-900">RM {selectedCategory.limit.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] text-slate-400 mb-1">Remaining</p>
                  <p className="text-sm font-bold text-emerald-600">RM {remaining.toLocaleString()}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Transactions List */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">Transactions</h3>
            </div>

            {loadingTransactions ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : categoryTransactions.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-slate-100">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No transactions in this category</p>
                <p className="text-xs text-slate-400 mt-1">Upload statements to add more</p>
              </div>
            ) : (
              <div className="space-y-2">
                {categoryTransactions.map((txn, i) => (
                  <motion.div
                    key={txn.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        txn.status === 'verified' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      )}>
                        {txn.status === 'verified' ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Clock className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{txn.merchant}</p>
                        <p className="text-xs text-slate-400">{txn.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">RM {txn.amount.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{txn.status}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // Main Summary View
  return (
    <div className="flex flex-col bg-slate-50 min-h-full pb-10">
      {/* Header */}
      <div className="px-5 pt-12 pb-6 bg-white border-b border-slate-100">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Tax Summary</h2>
            <p className="text-sm text-slate-500 mt-0.5">YA 2025 Filing Report</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <Receipt className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="px-5 pt-6 space-y-6">
          <div className="h-48 bg-slate-200 rounded-3xl animate-pulse" />
          <div className="h-40 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-slate-200 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      ) : (
        <div className="px-5 pt-6 space-y-6">
          {/* Total Relief Hero */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6 rounded-3xl bg-white border border-slate-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16" />

              <div className="relative z-10">
                {/* Status row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-xs font-medium text-emerald-600">Ready for e-Filing</span>
                  </div>
                  <span className="text-xs text-slate-400">{categories.length} categories</span>
                </div>

                {/* Total amount */}
                <div className="mb-5">
                  <p className="text-xs text-slate-400 font-medium mb-1">Total Estimated Relief</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-900">RM {totalClaimed.toLocaleString()}</span>
                  </div>
                </div>

                {/* Progress to limit */}
                <div className="mb-5">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-500">Utilization</span>
                    <span className="font-semibold text-slate-900">{totalLimit > 0 ? ((totalClaimed / totalLimit) * 100).toFixed(0) : 0}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                      style={{ width: `${totalLimit > 0 ? (totalClaimed / totalLimit) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">of RM {totalLimit.toLocaleString()} total limit</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleExport("PDF")}
                    className="flex-1 h-11 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Export
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCopy}
                    className="h-11 w-11 rounded-xl border-slate-200 p-0 hover:bg-slate-50"
                  >
                    <Copy className="w-4 h-4 text-slate-500" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Visual Breakdown - no hover needed, shows all info at once */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-5 rounded-2xl border border-slate-100 bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900">Relief Breakdown</h3>
                <Badge className="bg-slate-100 text-slate-500 font-medium text-[10px] px-2 py-0.5 rounded-md">
                  RM {totalLimit.toLocaleString()} limit
                </Badge>
              </div>

              {/* Horizontal stacked bar showing proportion of total limit */}
              <div className="mb-4">
                <div className="h-4 rounded-full bg-slate-100 overflow-hidden flex">
                  {categories.filter(c => c.amount > 0).map((cat, i) => {
                    // Show proportion of TOTAL LIMIT (not proportion of claimed)
                    const width = totalLimit > 0 ? (cat.limit / totalLimit) * 100 : 0;
                    const catColors = ['bg-blue-500', 'bg-amber-500', 'bg-teal-500', 'bg-rose-500'];
                    return (
                      <div
                        key={cat.name}
                        className={catColors[i % catColors.length]}
                        style={{ width: `${width}%` }}
                        title={`${cat.name}: RM ${cat.limit.toLocaleString()} limit`}
                      />
                    );
                  })}
                  {categories.some(c => c.amount === 0) && (
                    <div
                      className="bg-slate-200"
                      style={{ width: `${categories.filter(c => c.amount === 0).reduce((sum, c) => sum + (totalLimit > 0 ? (c.limit / totalLimit) * 100 : 0), 0)}%` }}
                    />
                  )}
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-3 mb-4">
                {categories.filter(c => c.amount > 0).map((cat, i) => {
                  const catColors = ['text-blue-600', 'text-amber-600', 'text-teal-600', 'text-rose-600'];
                  return (
                    <div key={cat.name} className="flex items-center gap-1.5">
                      <div className={cn("w-2 h-2 rounded-full", ['bg-blue-500', 'bg-amber-500', 'bg-teal-500', 'bg-rose-500'][i % 4])} />
                      <span className={cn("text-[10px] font-medium", catColors[i % catColors.length])}>
                        {cat.name} RM {cat.amount.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Category list with visual bars */}
              <div className="space-y-3">
                {categories.map((cat, i) => {
                  const pct = cat.limit > 0 ? (cat.amount / cat.limit) * 100 : 0;
                  return (
                    <div key={cat.name} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-slate-500 w-16">{cat.name}</span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 w-20 text-right">RM {cat.amount.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Category List - Clickable */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">By Category</h3>
              <span className="text-xs text-slate-400">{categories.length} categories</span>
            </div>

            <div className="space-y-2">
              {categories.map((cat, i) => {
                const status = statusConfig[cat.status as keyof typeof statusConfig] || statusConfig.Empty;
                const colors = categoryColors[cat.key] || categoryColors.lifestyle;
                return (
                  <motion.div
                    key={cat.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    className="group"
                  >
                    <div
                      onClick={() => handleCategoryClick(cat)}
                      className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all cursor-pointer active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colors.light, colors.text)}>
                          {categoryIcons[cat.key] || <FileText className="w-5 h-5" />}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-900 block">{cat.name}</span>
                          <span className="text-[10px] text-slate-400">{cat.limit > 0 ? `${((cat.amount / cat.limit) * 100).toFixed(0)}% used` : 'No limit'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-sm font-semibold text-slate-900 block">RM {cat.amount.toLocaleString()}</span>
                          <span className="text-[10px] text-slate-400">RM {(cat.limit - cat.amount).toLocaleString()} left</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                  <Info className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    taxWallet helps prepare your relief summary. Final filing decisions remain under your responsibility according to LHDN guidelines.
                  </p>
                  <button className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700">
                    View LHDN Guidelines <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Error notice if using fallback data */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-700">Using demo data. {error}</p>
              </Card>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}