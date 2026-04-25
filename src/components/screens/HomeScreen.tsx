"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  ShieldCheck,
  Plus,
  AlertCircle,
  BookOpen,
  Dumbbell,
  Heart,
  Building,
  GraduationCap,
  Scan,
  FileCheck,
  Sparkles,
  TrendingUp,
  Receipt,
  Umbrella,
  ChevronRight,
  Star,
  Crown,
  CheckCircle2,
  ArrowRight,
  Clock,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const TEST_USER_ID = 'user-001';

const stagger = {
  container: { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } } },
  item: { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }
};

// Category colors - semantic assignment based on tax category type
const categoryConfig = {
  lifestyle: { icon: BookOpen, color: "blue", label: "Lifestyle" },
  sports: { icon: Dumbbell, color: "teal", label: "Sports" },
  medical: { icon: Heart, color: "rose", label: "Medical" },
  insurance: { icon: Umbrella, color: "indigo", label: "Insurance" },
  sspn: { icon: Building, color: "amber", label: "SSPN" },
  education: { icon: GraduationCap, color: "slate", label: "Education" },
};

// Semantic color system - each color has ONE meaning
const colors = {
  primary: {
    bg: "bg-blue-600",
    text: "text-blue-600",
    light: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
  },
  success: {
    bg: "bg-emerald-500",
    text: "text-emerald-600",
    light: "bg-emerald-50",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  warning: {
    bg: "bg-amber-500",
    text: "text-amber-600",
    light: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
  },
  error: {
    bg: "bg-rose-500",
    text: "text-rose-600",
    light: "bg-rose-50",
    border: "border-rose-200",
    badge: "bg-rose-100 text-rose-700 border-rose-200",
  },
  neutral: {
    bg: "bg-slate-400",
    text: "text-slate-600",
    light: "bg-slate-50",
    border: "border-slate-200",
    badge: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

// Per-category color tokens
const categoryColors = {
  lifestyle: { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", progress: "bg-blue-500" },
  sports: { bg: "bg-teal-500", text: "text-teal-600", light: "bg-teal-50", progress: "bg-teal-500" },
  medical: { bg: "bg-rose-500", text: "text-rose-600", light: "bg-rose-50", progress: "bg-rose-500" },
  insurance: { bg: "bg-indigo-500", text: "text-indigo-600", light: "bg-indigo-50", progress: "bg-indigo-500" },
  sspn: { bg: "bg-amber-500", text: "text-amber-600", light: "bg-amber-50", progress: "bg-amber-500" },
  education: { bg: "bg-slate-400", text: "text-slate-500", light: "bg-slate-50", progress: "bg-slate-400" },
};

// Mock data for fallback
const mockData = {
  totalRelief: 4850,
  potential: 1420,
  remaining: 6200,
  pendingItems: 2,
  categories: [
    { key: "lifestyle", name: "Lifestyle", amount: 2300, limit: 2500, status: "almost_full" },
    { key: "sports", name: "Sports", amount: 600, limit: 1000, status: "available" },
    { key: "medical", name: "Medical", amount: 450, limit: 10000, status: "available" },
    { key: "insurance", name: "Insurance", amount: 2000, limit: 3000, status: "needs_info" },
    { key: "sspn", name: "SSPN", amount: 3500, limit: 8000, status: "filled" },
    { key: "education", name: "Education", amount: 0, limit: 7000, status: "empty" },
  ],
  attentionItems: [
    { title: "AIA Insurance", category: "insurance", amount: "RM250/mo", issue: "Statement missing", badge: "Upload required" },
    { title: "Apple Store", category: "lifestyle", amount: "RM4,299", issue: "Confirm personal use", badge: "e-Invoice matched" },
  ],
};

const statusConfig = {
  filled: { label: "Filled", variant: "success" as const },
  almost_full: { label: "Almost full", variant: "warning" as const },
  available: { label: "Available", variant: "neutral" as const },
  needs_info: { label: "Needs info", variant: "error" as const },
  empty: { label: "Not started", variant: "neutral" as const },
};

interface ReliefSummary {
  totalRelief: number;
  potential: number;
  remaining: number;
  pendingItems: number;
  categories: Array<{
    key: string;
    name: string;
    amount: number;
    limit: number;
    status: string;
  }>;
  attentionItems: Array<{
    title: string;
    category: string;
    amount: string;
    issue: string;
    badge: string;
  }>;
}

interface HomeScreenProps {
  onNavigate: (screen: any) => void;
  onCategoryClick?: (category: { key: string; name: string; amount: number; limit: number; status: string; shortName: string }) => void;
}

export function HomeScreen({ onNavigate, onCategoryClick }: HomeScreenProps) {
  const [data, setData] = useState<ReliefSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          // Transform API response to match expected format
          const apiData = result.data;
          setData({
            totalRelief: apiData.claimed_amount || apiData.total_relief_amount || apiData.totalRelief || 0,
            potential: apiData.max_amount || apiData.potential || 0,
            remaining: apiData.remaining_quota || apiData.remaining || 0,
            pendingItems: apiData.pending_items || apiData.pendingItems || 0,
            categories: apiData.categories || mockData.categories,
            attentionItems: apiData.attention_items || apiData.attentionItems || [],
          });
        }
      } catch (err) {
        console.error('Error fetching relief summary:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        // Fallback to mock data on error
        setData(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchReliefSummary();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col bg-slate-50 min-h-full pb-10">
        <div className="px-5 pt-16 pb-6 bg-white border-b border-slate-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-200 rounded-full animate-pulse" />
              <div>
                <div className="h-6 w-24 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-32 bg-slate-200 rounded animate-pulse mt-2" />
              </div>
            </div>
          </div>
        </div>
        <div className="px-5 pt-6 space-y-6">
          <div className="h-48 bg-slate-200 rounded-3xl animate-pulse" />
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const displayData = data || mockData;

  return (
    <div className="flex flex-col bg-slate-50 min-h-full pb-10">
      {/* Header */}
      <motion.div variants={stagger.item} className="px-5 pt-16 pb-6 bg-white border-b border-slate-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="w-12 h-12 border-2 border-slate-200 shadow-sm">
                <AvatarFallback className="bg-blue-600 text-white font-bold text-sm uppercase">
                  JY
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-none">taxWallet</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">YA 2025 • Ready for filing</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="relative h-11 w-11 rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200">
            <Bell className="w-5 h-5" />
            {displayData.pendingItems > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full" />
            )}
          </Button>
        </div>
      </motion.div>

      <div className="px-5 space-y-6">
        {/* Hero Wallet Card - Primary Blue */}
        <motion.div variants={stagger.item}>
          <Card className="relative overflow-hidden rounded-3xl border-none shadow-lg shadow-blue-900/10 mt-6">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400" />
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 400 220">
                <circle cx="350" cy="30" r="100" fill="white" />
                <circle cx="400" cy="200" r="70" fill="white" />
              </svg>
            </div>

            <div className="relative z-10 p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white/80 text-xs font-semibold uppercase tracking-widest">Relief Wallet</span>
                </div>
                <Badge className="bg-emerald-400 text-white text-[10px] font-semibold px-3 py-1 rounded-full shadow-sm">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> {displayData.pendingItems} to review
                </Badge>
              </div>

              <div className="mb-5">
                <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest mb-1">Ready to Claim</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white tracking-tight">RM {displayData.totalRelief.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5 py-4 border-t border-white/20">
                <div>
                  <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest mb-1">Potential</p>
                  <p className="text-xl font-bold text-emerald-300">+RM {displayData.potential.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest mb-1">Remaining</p>
                  <p className="text-xl font-bold text-white">RM {displayData.remaining.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => onNavigate("review")}
                  className="flex-1 bg-white text-blue-600 hover:bg-blue-50 h-12 rounded-2xl font-semibold text-sm shadow-lg"
                >
                  <Sparkles className="w-4 h-4 mr-2" /> Review Claims
                </Button>
                <Button
                  onClick={() => onNavigate("summary")}
                  className="flex-1 bg-white/10 text-white hover:bg-white/20 h-12 rounded-2xl font-semibold text-sm border border-white/20"
                >
                  Summary
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions - Neutral grays, blue primary */}
        <motion.div variants={stagger.item} className="grid grid-cols-4 gap-3">
          {[
            { label: "Review", icon: <ShieldCheck className="w-5 h-5" />, screen: "review" },
            { label: "Upload", icon: <Plus className="w-5 h-5" />, screen: "wallet" },
            { label: "Scan", icon: <Scan className="w-5 h-5" />, screen: "activity" },
            { label: "Summary", icon: <FileCheck className="w-5 h-5" />, screen: "summary" },
          ].map((action) => (
            <motion.button
              key={action.label}
              onClick={() => onNavigate(action.screen)}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-200 shadow-sm active:scale-95 transition-all hover:shadow-md hover:border-slate-300"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600">
                {action.icon}
              </div>
              <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-tight">
                {action.label}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* Needs Attention - Action-focused task cards */}
        <motion.div variants={stagger.item} className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Pending Tasks</h2>
            <div className="h-5 w-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">{displayData.attentionItems.length} items require your action</span>
          </div>

          <div className="space-y-2">
            {displayData.attentionItems.length === 0 ? (
              <div className="p-6 bg-white rounded-xl border border-slate-200 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No pending tasks</p>
              </div>
            ) : (
              displayData.attentionItems.map((item, index) => {
                const catConfig = categoryConfig[item.category as keyof typeof categoryConfig];
                const IconComponent = catConfig?.icon || BookOpen;
                const isFirst = index === 0;

                return (
                  <motion.div
                    key={item.title}
                    whileTap={{ scale: 0.99 }}
                    className="group relative"
                  >
                    {/* Number indicator - makes it feel like a numbered task list */}
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center z-10">
                      {index + 1}
                    </div>

                    {/* Connection line between items */}
                    {index < displayData.attentionItems.length - 1 && (
                      <div className="absolute left-[10px] top-full w-0.5 h-3 bg-slate-200" />
                    )}

                    <div className="pl-6 pr-4 py-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${categoryColors[item.category as keyof typeof categoryColors]?.light || 'bg-slate-50'} ${categoryColors[item.category as keyof typeof categoryColors]?.text || 'text-slate-600'}`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-400 font-medium mb-0.5">{item.title}</p>
                            <p className="text-sm font-semibold text-slate-900 truncate">{item.issue}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500 font-medium">{item.amount}</span>
                          <Button
                            onClick={() => onNavigate("review")}
                            size="sm"
                            className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium"
                          >
                            {item.badge.split(' ')[0]} <ChevronRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Relief Categories - Horizontal scroll with visual depth */}
        <motion.div variants={stagger.item} className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Your Relief</h2>
            <Button
              variant="ghost"
              onClick={() => onNavigate("summary")}
              className="text-xs text-blue-600 font-medium h-7 px-2"
            >
              See all <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>

          {/* Horizontal scrolling list - more like a real wallet view */}
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
            {displayData.categories.map((cat) => {
              const catColors = categoryColors[cat.key as keyof typeof categoryColors] || categoryColors.lifestyle;
              const status = statusConfig[cat.status as keyof typeof statusConfig] || statusConfig.available;
              const statusColors = colors[status.variant];
              const pct = cat.limit > 0 ? (cat.amount / cat.limit) * 100 : 0;
              const remaining = cat.limit - cat.amount;

              return (
                <motion.button
                  key={cat.name}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onCategoryClick?.({ ...cat, shortName: cat.name.substring(0, 4) })}
                  className="flex-shrink-0 w-40 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-left"
                >
                  {/* Category header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${catColors.light} ${catColors.text}`}>
                      {React.createElement(categoryConfig[cat.key as keyof typeof categoryConfig]?.icon || BookOpen, { className: "w-4 h-4" })}
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{cat.name}</span>
                  </div>

                  {/* Amount display */}
                  <p className="text-lg font-bold text-slate-900 mb-1">RM {cat.amount.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400 mb-3">of RM {cat.limit.toLocaleString()}</p>

                  {/* Mini progress */}
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div className={`h-full rounded-full ${catColors.progress}`} style={{ width: `${pct}%` }} />
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-medium ${statusColors.text}`}>{status.label}</span>
                    <span className="text-[9px] text-slate-400">RM {remaining.toLocaleString()} left</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Opportunity Card - Integrated naturally as a notification */}
        <motion.div variants={stagger.item}>
          <div className="relative overflow-hidden rounded-2xl bg-blue-600 border border-blue-500">
            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 200 80">
                <path d="M0 40 Q 50 20 100 40 T 200 40" stroke="white" strokeWidth="2" fill="none" />
                <path d="M0 60 Q 50 40 100 60 T 200 60" stroke="white" strokeWidth="1" fill="none" />
              </svg>
            </div>

            <div className="relative z-10 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {/* Emoji-style icon instead of generic icon */}
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-blue-100 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Unused Relief</p>
                    <h3 className="text-white font-semibold text-sm mb-1">Sports Relief: RM 400 left</h3>
                    <p className="text-blue-200 text-xs leading-relaxed">Gym, badminton, equipment may be claimable under LHDN rules.</p>
                  </div>
                </div>
                <Button
                  onClick={() => onNavigate("wallet")}
                  className="flex-shrink-0 h-8 px-3 rounded-lg bg-white text-blue-600 hover:bg-blue-50 text-xs font-semibold"
                >
                  Claim
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer hint */}
        <motion.div variants={stagger.item} className="text-center py-4">
          {error ? (
            <p className="text-xs text-amber-500 font-medium">Using cached data. {error}</p>
          ) : (
            <p className="text-xs text-slate-400 font-medium">Last synced: Today at 2:30 PM</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}