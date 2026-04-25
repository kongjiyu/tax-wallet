"use client";

import React from "react";
import {
  User,
  Settings,
  Shield,
  CreditCard,
  Bell,
  LogOut,
  ChevronRight,
  FileJson,
  Lock,
  Heart,
  ChevronDown,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const menuGroups = [
  {
    title: "Account",
    items: [
      { label: "Personal Info", icon: <User className="w-4 h-4" />, color: "blue" },
      { label: "Connected Accounts", icon: <CreditCard className="w-4 h-4" />, color: "indigo", badge: "4" },
    ]
  },
  {
    title: "Preferences",
    items: [
      { label: "Consent & Permissions", icon: <Shield className="w-4 h-4" />, color: "emerald" },
      { label: "Notifications", icon: <Bell className="w-4 h-4" />, color: "amber" },
      { label: "Privacy Settings", icon: <Lock className="w-4 h-4" />, color: "slate" },
    ]
  },
  {
    title: "Data",
    items: [
      { label: "Export My Data", icon: <FileJson className="w-4 h-4" />, color: "slate" },
    ]
  },
];

const colorMap: Record<string, { bg: string; text: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-600" },
  indigo: { bg: "bg-indigo-50", text: "text-indigo-600" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
  amber: { bg: "bg-amber-50", text: "text-amber-600" },
  slate: { bg: "bg-slate-50", text: "text-slate-500" },
};

export function ProfileScreen() {
  return (
    <div className="flex flex-col bg-slate-50 min-h-full pb-10">
      {/* Header */}
      <div className="px-5 pt-12 pb-6 bg-white border-b border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Profile</h2>
          <button className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Settings className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Profile card */}
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
          <div className="relative">
            <Avatar className="w-16 h-16 border-2 border-white shadow-sm">
              <AvatarFallback className="bg-blue-600 text-white font-bold text-lg">JY</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
              <CheckCircle2 className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-slate-900">Ji Yu</h3>
            <p className="text-xs text-slate-500">jiyu@example.com</p>
          </div>
          <Badge className="bg-blue-100 text-blue-600 font-medium text-[10px] px-2 py-0.5 rounded-full">
            Premium
          </Badge>
        </div>
      </div>

      {/* Menu sections */}
      <div className="px-5 py-6 space-y-6">
        {menuGroups.map((group, gi) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gi * 0.05 }}
            className="space-y-3"
          >
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{group.title}</h3>

            <Card className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
              {group.items.map((item, i) => {
                const colors = colorMap[item.color as keyof typeof colorMap];
                return (
                  <button
                    key={item.label}
                    className="w-full p-4 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", colors.bg, colors.text)}>
                        {item.icon}
                      </div>
                      <span className="text-sm font-medium text-slate-900">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="text-xs font-medium text-slate-400">{item.badge} accounts</span>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </div>
                  </button>
                );
              })}
            </Card>
          </motion.div>
        ))}

        {/* e-Filing status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4 rounded-2xl bg-blue-600 border-none overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500 rounded-full -mr-12 -mt-12 opacity-50" />

            <div className="relative z-10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white text-xs font-medium opacity-80">e-Filing Status</p>
                <p className="text-white font-semibold text-sm">Ready to file YA 2025</p>
              </div>
              <Badge className="bg-emerald-400 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                Complete
              </Badge>
            </div>
          </Card>
        </motion.div>

        {/* Danger zone */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-3"
        >
          <h3 className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Danger Zone</h3>

          <Card className="rounded-2xl border border-rose-100 bg-rose-50/50 overflow-hidden">
            <button className="w-full p-4 flex items-center justify-between hover:bg-rose-100/50 active:bg-rose-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-rose-100 text-rose-500">
                  <LogOut className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-rose-600">Log Out</span>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-300" />
            </button>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center pt-4 pb-2"
        >
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <Heart className="w-3 h-3 text-slate-300" />
            <p className="text-xs text-slate-400">Made for Malaysians</p>
          </div>
          <p className="text-[10px] text-slate-300">taxWallet v1.0.0</p>
        </motion.div>
      </div>
    </div>
  );
}