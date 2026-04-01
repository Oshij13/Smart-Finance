import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Calculator, FileText, DollarSign } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
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
    { label: "Gross Income", amount: annualIncome, color: "#3b82f6" },
    { label: "Tax + Cess", amount: totalTax, color: "#ef4444" },
    { label: "In-Hand Income", amount: annualIncome - totalTax, color: "#10b981" },
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Calculator className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold">Tax Calculator</h1>
        </div>
        <p className="text-lg text-rose-50">
          Calculate your exact tax liability under the new regime and know your in-hand salary.
        </p>
      </div>

      {/* Input Form */}
      <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
        <CardHeader>
          <CardTitle>Income Details</CardTitle>
          <CardDescription>Enter your gross annual income to calculate tax</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gross-income">Gross Annual Income (₹)</Label>
            <Input
              id="gross-income"
              type="number"
              placeholder="e.g., 1200000"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="regime">Tax Regime</Label>
            <Select value={regime} onValueChange={setRegime}>
              <SelectTrigger id="regime">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New Regime (2024-25)</SelectItem>
                <SelectItem value="old" disabled>Old Regime (Coming Soon)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={calculateTax} className="w-full bg-gradient-to-r from-rose-500 to-pink-600">
            Calculate Tax
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {showResults && annualIncome > 0 && (
        <>
          {/* Key Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <p className="text-sm text-gray-600 mb-1">Total Tax + Cess</p>
                <p className="text-3xl font-bold text-rose-600">₹{totalTax.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Including 4% cess</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <p className="text-sm text-gray-600 mb-1">Effective Tax Rate</p>
                <p className="text-3xl font-bold text-gray-900">{effectiveTaxRate.toFixed(2)}%</p>
                <p className="text-xs text-gray-500 mt-1">Of gross income</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <p className="text-sm text-gray-600 mb-1">Monthly TDS</p>
                <p className="text-3xl font-bold text-orange-600">₹{monthlyTDS.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Deducted monthly</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <p className="text-sm text-gray-600 mb-1">Monthly In-Hand</p>
                <p className="text-3xl font-bold text-emerald-600">₹{monthlyInHand.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">After tax deduction</p>
              </CardContent>
            </Card>
          </div>

          {/* Income Breakdown Chart */}
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
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
                    formatter={(value: number) => `₹${value.toLocaleString()}`}
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
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle>Tax Slab Breakdown</CardTitle>
              <CardDescription>How your income is taxed across different slabs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {taxSlabs.map((slab, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                    <div>
                      <p className="font-semibold text-gray-900">{slab.slab}</p>
                      <p className="text-sm text-gray-600">Rate: {slab.rate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ₹{slab.tax.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600">Tax from this slab</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tax Saving Tips */}
          <Card className="border-none shadow-lg bg-gradient-to-br from-rose-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-600" />
                Tax Saving Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 bg-white rounded-lg">
                <h3 className="font-semibold text-rose-900 mb-1">Standard Deduction</h3>
                <p className="text-sm text-gray-600">₹50,000 standard deduction is available in the new regime (already factored in above slabs).</p>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <h3 className="font-semibold text-rose-900 mb-1">NPS Contribution</h3>
                <p className="text-sm text-gray-600">Contribute to NPS for additional ₹50,000 deduction under Section 80CCD(1B).</p>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <h3 className="font-semibold text-rose-900 mb-1">HRA & LTA</h3>
                <p className="text-sm text-gray-600">New regime doesn't allow HRA or LTA exemptions. Compare with old regime if you have these.</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
