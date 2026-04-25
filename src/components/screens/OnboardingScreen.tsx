"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Fingerprint, Building, ArrowRight, ChevronLeft, ExternalLink, Info } from "lucide-react";
import { motion } from "framer-motion";

export function OnboardingScreen({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="flex flex-col min-h-full bg-slate-50">
      {/* Header */}
      <div className="px-5 pt-16 pb-6">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 mb-6">
          <Shield className="text-white w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">taxWallet</h1>
        <p className="text-slate-500 text-sm">Your personal tax relief assistant for YA 2025</p>
      </div>

      {/* Features */}
      <div className="px-5 mb-6">
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: <Building className="w-5 h-5" />, title: "Connect MyID", desc: "Verify with MyDigital ID" },
            { icon: <Fingerprint className="w-5 h-5" />, title: "Secure Login", desc: "Biometric authentication" },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-4 rounded-2xl border border-slate-100"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
                {item.icon}
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">{item.title}</h3>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Login Card */}
      <div className="px-5 flex-1">
        <Card className="p-5 rounded-2xl border border-slate-100 bg-white">
          <h2 className="text-base font-semibold text-slate-900 mb-3">Sign in with MyDigital ID</h2>
          <p className="text-xs text-slate-500 mb-5 leading-relaxed">
            Use Malaysia's official digital identity to securely login and authorize tax relief analysis.
          </p>

          <Button
            onClick={onGetStarted}
            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2"
          >
            Continue with MyDigital ID <ArrowRight className="w-4 h-4" />
          </Button>

          <div className="mt-4 flex items-start gap-2 p-3 bg-slate-50 rounded-xl">
            <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Your login is secured by Jabatan Sistem Malaysia (JSM). taxWallet does not store your MyDigital ID credentials.
            </p>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <div className="px-5 py-6 mt-auto">
        <div className="text-center mb-4">
          <button className="text-xs text-blue-600 font-medium flex items-center justify-center gap-1 mx-auto">
            Learn more about MyDigital ID <ExternalLink className="w-3 h-3" />
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-400">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}