'use client';

import { useState } from 'react';
import { Calculator, DollarSign, TrendingDown, Percent, AlertCircle } from 'lucide-react';

interface TaxResult {
  grossIncome: number;
  deductions: number;
  taxableIncome: number;
  taxRate: number;
  taxAmount: number;
  netIncome: number;
}

export default function TaxPage() {
  const [income, setIncome] = useState('');
  const [deductions, setDeductions] = useState('');
  const [filingStatus, setFilingStatus] = useState<'single' | 'married' | 'head'>('single');
  const [result, setResult] = useState<TaxResult | null>(null);
  const [error, setError] = useState('');

  const calculateTax = () => {
    setError('');
    const gross = parseFloat(income);
    const deductionsAmt = parseFloat(deductions) || 0;

    if (isNaN(gross) || gross < 0) {
      setError('Please enter a valid income amount');
      return;
    }

    const taxableIncome = Math.max(0, gross - deductionsAmt);

    // Simple tax brackets (2024 US tax brackets for demonstration)
    let taxRate = 0;
    if (taxableIncome <= 11600) taxRate = 0.10;
    else if (taxableIncome <= 47150) taxRate = 0.12;
    else if (taxableIncome <= 100525) taxRate = 0.22;
    else if (taxableIncome <= 191950) taxRate = 0.24;
    else if (taxableIncome <= 243725) taxRate = 0.32;
    else if (taxableIncome <= 609350) taxRate = 0.35;
    else taxRate = 0.37;

    const taxAmount = taxableIncome * taxRate;

    setResult({
      grossIncome: gross,
      deductions: deductionsAmt,
      taxableIncome,
      taxRate,
      taxAmount,
      netIncome: gross - taxAmount,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Tax Calculator</h1>
        <p className="text-zinc-400 mt-1">Estimate your income tax based on current tax brackets</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-6">Enter Your Information</h2>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Filing Status</label>
            <select
              value={filingStatus}
              onChange={e => setFilingStatus(e.target.value as typeof filingStatus)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="single">Single</option>
              <option value="married">Married Filing Jointly</option>
              <option value="head">Head of Household</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Gross Annual Income ($)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="number"
                value={income}
                onChange={e => setIncome(e.target.value)}
                placeholder="75000"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-zinc-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-zinc-400 mb-1">Total Deductions ($)</label>
            <div className="relative">
              <TrendingDown className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="number"
                value={deductions}
                onChange={e => setDeductions(e.target.value)}
                placeholder="0"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-zinc-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <button
          onClick={calculateTax}
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-black font-medium px-6 py-3 rounded-lg transition-colors mt-6"
        >
          <Calculator size={18} />
          Calculate Tax
        </button>
      </div>

      {result && (
        <div className="bg-zinc-900 border border-cyan-500/30 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Tax Summary</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-zinc-800 rounded-lg p-4">
              <p className="text-sm text-zinc-400 mb-1">Gross Income</p>
              <p className="text-xl font-bold text-white">${result.grossIncome.toLocaleString()}</p>
            </div>
            <div className="bg-zinc-800 rounded-lg p-4">
              <p className="text-sm text-zinc-400 mb-1">Deductions</p>
              <p className="text-xl font-bold text-cyan-400">-${result.deductions.toLocaleString()}</p>
            </div>
            <div className="bg-zinc-800 rounded-lg p-4">
              <p className="text-sm text-zinc-400 mb-1">Taxable Income</p>
              <p className="text-xl font-bold text-white">${result.taxableIncome.toLocaleString()}</p>
            </div>
            <div className="bg-zinc-800 rounded-lg p-4">
              <p className="text-sm text-zinc-400 mb-1">Tax Rate</p>
              <div className="flex items-center gap-2">
                <Percent size={18} className="text-zinc-500" />
                <span className="text-xl font-bold text-white">{(result.taxRate * 100).toFixed(0)}%</span>
              </div>
            </div>
            <div className="bg-zinc-800 rounded-lg p-4">
              <p className="text-sm text-zinc-400 mb-1">Estimated Tax</p>
              <p className="text-xl font-bold text-red-400">${result.taxAmount.toLocaleString()}</p>
            </div>
            <div className="bg-zinc-800 rounded-lg p-4">
              <p className="text-sm text-zinc-400 mb-1">Net Income</p>
              <p className="text-xl font-bold text-emerald-400">${result.netIncome.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-zinc-950 rounded-lg p-4">
            <p className="text-sm text-zinc-400">
              This is an estimate based on 2024 US federal tax brackets. Actual tax may vary based on state taxes, credits, and other factors.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
