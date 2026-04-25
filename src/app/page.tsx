"use client";

import React, { useState } from "react";
import { AppShell, ScreenType } from "@/components/layout/AppShell";
import { OnboardingScreen } from "@/components/screens/OnboardingScreen";
import { ConsentScreen } from "@/components/screens/ConsentScreen";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { ActivityScreen } from "@/components/screens/ActivityScreen";
import { TransactionDetailScreen } from "@/components/screens/TransactionDetailScreen";
import { WalletScreen } from "@/components/screens/WalletScreen";
import { UploadScreen } from "@/components/screens/UploadScreen";
import { ClaimsReviewScreen } from "@/components/screens/ClaimsReviewScreen";
import { SummaryScreen } from "@/components/screens/SummaryScreen";
import { ProfileScreen } from "@/components/screens/ProfileScreen";
import { AnimatePresence, motion } from "framer-motion";

interface Category {
  key: string;
  name: string;
  amount: number;
  limit: number;
  status: string;
  shortName: string;
}

export default function Home() {
  const [activeScreen, setActiveScreen] = useState<ScreenType>("onboarding");
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [pendingDoc, setPendingDoc] = useState<{id: string; merchant: string; category: string; amount: number} | null>(null);

  const handleNavigate = (screen: ScreenType) => {
    setActiveScreen(screen);
  };

  const handleTransactionClick = (transaction: any) => {
    setSelectedTransaction(transaction);
    setActiveScreen("transaction_detail");
  };

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    setActiveScreen("summary");
  };

  const handleUploadFromWallet = (doc?: {id: string; merchant: string; category: string; amount: number}) => {
    setPendingDoc(doc || null);
    setActiveScreen("upload");
  };

  const showBottomNav = !["onboarding", "consent", "transaction_detail", "upload"].includes(activeScreen);

  const renderScreen = () => {
    switch (activeScreen) {
      case "onboarding":
        return <OnboardingScreen onGetStarted={() => setActiveScreen("consent")} />;
      case "consent":
        return <ConsentScreen onBack={() => setActiveScreen("onboarding")} onConnect={() => setActiveScreen("home")} />;
      case "home":
        return <HomeScreen 
          onNavigate={(screen, params) => {
            if (screen === 'transaction_detail') handleTransactionClick(params);
            else if (screen === 'wallet') handleUploadFromWallet(params);
            else handleNavigate(screen as ScreenType);
          }} 
          onCategoryClick={handleCategoryClick} 
        />;
      case "activity":
        return <ActivityScreen onTransactionClick={handleTransactionClick} />;
      case "transaction_detail":
        return <TransactionDetailScreen transaction={selectedTransaction} onBack={() => setActiveScreen("activity")} />;
      case "wallet":
        return <WalletScreen onUploadClick={(doc) => handleUploadFromWallet(doc)} />;
      case "upload":
        return <UploadScreen onBack={() => { setPendingDoc(null); setActiveScreen("wallet"); }} pendingDoc={pendingDoc} />;
      case "review":
        return <ClaimsReviewScreen 
          onBack={() => setActiveScreen("home")} 
          onNavigate={(screen, params) => {
            if (screen === 'wallet') handleUploadFromWallet(params);
            else if (screen === 'transaction_detail') handleTransactionClick(params);
            else setActiveScreen(screen as ScreenType);
          }} 
        />;
      case "summary":
        return <SummaryScreen onNavigate={handleNavigate} initialCategory={selectedCategory} onBack={() => setSelectedCategory(null)} />;
      case "profile":
        return <ProfileScreen />;
      default:
        return <HomeScreen onNavigate={handleNavigate} onCategoryClick={handleCategoryClick} />;
    }
  };

  return (
    <AppShell
      activeScreen={activeScreen}
      onNavigate={handleNavigate}
      showBottomNav={showBottomNav}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeScreen}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
}