import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Calculator, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function TaxCalculator() {
  const [income, setIncome] = useState("");
  const [regime, setRegime] = useState("new");
  const [showResults, setShowResults] = useState(false);

  const calculateTax = () => {
    if (income) setShowResults(true);
  };

  const annualIncome = parseInt(income) || 0;

  // New Tax Regime Calculation (2024-25)
  let taxAmount = 0;
  if (annualIncome <= 300000) {
    taxAmount = 0;
  } else if (annualIncome <= 700000) {
    taxAmount = (annualIncome - 300000) * 0.05;
  } else if (annualIncome <= 1000000) {
    taxAmount = 20000 + (annualIncome - 700000) * 0.10;
  } else if (annualIncome <= 1200000) {
    taxAmount = 50000 + (annualIncome - 1000000) * 0.15;
  } else if (annualIncome <= 1500000) {
    taxAmount = 80000 + (annualIncome - 1200000) * 0.20;
  } else {
    taxAmount = 140000 + (annualIncome - 1500000) * 0.30;
  }

  // Add 4% cess
  const cess = taxAmount * 0.04;
  const totalTax = taxAmount + cess;
  const effectiveTaxRate = (totalTax / annualIncome) * 100;
  const monthlyInHand = (annualIncome - totalTax) / 12;
  const monthlyTDS = totalTax / 12;

  const breakdownData = [
    { label: "Gross Income", amount: annualIncome, color: "#1e40af" },
    { label: "Tax + Cess", amount: totalTax, color: "#93c5fd" },
    { label: "In-Hand Income", amount: annualIncome - totalTax, color: "#3b82f6" },
  ];

  const taxSlabs = [
    { slab: "Up to ₹3L", rate: "0%", tax: 0 },
    { slab: "₹3L - ₹7L", rate: "5%", tax: Math.min(Math.max(annualIncome - 300000, 0), 400000) * 0.05 },
    { slab: "₹7L - ₹10L", rate: "10%", tax: Math.min(Math.max(annualIncome - 700000, 0), 300000) * 0.10 },
    { slab: "₹10L - ₹12L", rate: "15%", tax: Math.min(Math.max(annualIncome - 1000000, 0), 200000) * 0.15 },
    { slab: "₹12L - ₹15L", rate: "20%", tax: Math.min(Math.max(annualIncome - 1200000, 0), 300000) * 0.20 },
    { slab: "Above ₹15L", rate: "30%", tax: Math.max(annualIncome - 1500000, 0) * 0.30 },
  ];

  return (
    <div className="w-full px-6 lg:px-10 py-12 space-y-12">
      {/* Header */}
      <header className="space-y-2">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Tax</p>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight text-left">Income Tax Calculator</h1>
        </div>
        <p className="text-sm text-gray-500 max-w-xl font-medium text-left">
          Quick estimate under the new regime (FY 2024-25).
        </p>
      </header>

      {/* Input Form */}
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500">Gross Annual Income (₹)</label>
            <input
              type="number"
              placeholder="e.g. 12,00,000"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-gray-300 shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500">Tax Regime</label>
            <select
              value={regime}
              onChange={(e) => setRegime(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer shadow-sm"
            >
              <option value="new">New Regime (2024-25)</option>
              <option value="old" disabled>Old Regime (Coming Soon)</option>
            </select>
          </div>
        </div>

        <button
          onClick={calculateTax}
          className="px-8 h-11 rounded-full bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-sm text-center"
        >
          Calculate Tax
        </button>
      </div>

      {/* Results */}
      {showResults && annualIncome > 0 && (
        <>
          {/* Key Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="p-6 rounded-2xl bg-gray-50/50 border border-gray-100 flex flex-col justify-between h-full">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">total tax + cess</p>
              <div className="mt-2 text-left">
                <p className="text-2xl font-bold text-gray-900">₹{totalTax.toLocaleString('en-IN')}</p>
                <p className="text-[10px] font-bold text-rose-500 mt-0.5 uppercase tracking-tight">inc. 4% cess</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50/50 border border-gray-100 flex flex-col justify-between h-full">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">effective rate</p>
              <div className="mt-2 text-left">
                <p className="text-2xl font-bold text-gray-900">{effectiveTaxRate.toFixed(2)}%</p>
                <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-tight">of gross income</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50/50 border border-gray-100 flex flex-col justify-between h-full">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">monthly tds</p>
              <div className="mt-2 text-left">
                <p className="text-2xl font-bold text-gray-900">₹{Math.round(monthlyTDS).toLocaleString('en-IN')}</p>
                <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-tight">deducted monthly</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-200 flex flex-col justify-between h-full shadow-sm">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest text-left">monthly in-hand</p>
              <div className="mt-2 text-left">
                <p className="text-2xl font-bold text-emerald-600">₹{Math.round(monthlyInHand).toLocaleString('en-IN')}</p>
                <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-tight font-medium">after tax</p>
              </div>
            </div>
          </div>

          {/* Income Breakdown Chart */}
          <Card className="border-none shadow-md bg-white mt-4">
            <CardHeader>
              <CardTitle>Income Breakdown</CardTitle>
              <CardDescription>Visual representation of your tax and take-home</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={breakdownData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="label" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                    {breakdownData.map((entry, index) => (
                      <rect key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tax Slab Breakdown */}
          <div className="space-y-6 mt-12">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Analysis</p>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight text-left">Tax Slab Breakdown</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {taxSlabs.map((slab, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gray-50/50 border border-gray-100 hover:border-gray-200 transition-colors">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{slab.slab}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mt-0.5">Rate: {slab.rate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      ₹{slab.tax.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">from slab</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tax Saving Tips */}
          <div className="space-y-6 mt-12">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest text-left">Insights</p>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight text-left">Tax Saving Tips</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-2">Standard Deduction</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">₹50,000 deduction is available automatically in the new regime.</p>
              </div>
              <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-2">NPS Contribution</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">Additional ₹50,000 deduction possible under Section 80CCD(1B).</p>
              </div>
              <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-2">HRA & LTA</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">Exemptions aren't available under the new regime. Compare with old if needed.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
