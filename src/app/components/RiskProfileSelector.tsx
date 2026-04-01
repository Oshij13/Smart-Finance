import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Shield, TrendingUp, Zap, Check } from "lucide-react";
import { cn } from "./ui/utils";

interface RiskProfileProps {
  selectedRisk?: "low" | "moderate" | "high";
  onSelect?: (risk: "low" | "moderate" | "high") => void;
}

export function RiskProfileSelector({ selectedRisk = "moderate", onSelect }: RiskProfileProps) {
  const riskProfiles = [
    {
      id: "low" as const,
      title: "Low Risk",
      icon: Shield,
      returns: "6-8%",
      description: "Stable returns with minimal volatility",
      instruments: ["Fixed Deposits", "PPF", "Liquid Funds"],
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-300",
      textColor: "text-emerald-700"
    },
    {
      id: "moderate" as const,
      title: "Medium Risk",
      icon: TrendingUp,
      returns: "10-14%",
      description: "Balanced growth with manageable risk",
      instruments: ["Equity + Debt Mix", "Hybrid Funds", "Index Funds"],
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-300",
      textColor: "text-blue-700",
      recommended: true
    },
    {
      id: "high" as const,
      title: "High Risk",
      icon: Zap,
      returns: "15-20%+",
      description: "High returns potential with volatility",
      instruments: ["Direct Equity", "Growth Stocks", "Sector Funds"],
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-300",
      textColor: "text-purple-700"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {riskProfiles.map((profile) => {
        const Icon = profile.icon;
        const isSelected = selectedRisk === profile.id;
        
        return (
          <button
            key={profile.id}
            onClick={() => onSelect?.(profile.id)}
            className={cn(
              "relative text-left transition-all duration-300 rounded-2xl",
              isSelected 
                ? "scale-105 shadow-2xl" 
                : "hover:scale-102 hover:shadow-lg"
            )}
          >
            <Card className={cn(
              "border-2 h-full",
              isSelected 
                ? `${profile.borderColor} bg-gradient-to-br ${profile.color} text-white` 
                : "border-slate-200 bg-white hover:border-slate-300"
            )}>
              <CardHeader>
                {profile.recommended && !isSelected && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-semibold shadow-lg">
                      Recommended
                    </span>
                  </div>
                )}
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                      <Check className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                )}
                
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center mb-4",
                  isSelected ? "bg-white/20" : profile.bgColor
                )}>
                  <Icon className={cn(
                    "w-7 h-7",
                    isSelected ? "text-white" : profile.textColor
                  )} />
                </div>
                
                <CardTitle className={cn(
                  "text-xl mb-2",
                  isSelected ? "text-white" : "text-slate-900"
                )}>
                  {profile.title}
                </CardTitle>
                
                <div className={cn(
                  "inline-block px-3 py-1 rounded-full text-sm font-semibold mb-3",
                  isSelected ? "bg-white/20 text-white" : `${profile.bgColor} ${profile.textColor}`
                )}>
                  Expected: {profile.returns}
                </div>
              </CardHeader>
              
              <CardContent>
                <p className={cn(
                  "text-sm mb-4",
                  isSelected ? "text-white/90" : "text-slate-600"
                )}>
                  {profile.description}
                </p>
                
                <div className="space-y-2">
                  <p className={cn(
                    "text-xs font-semibold",
                    isSelected ? "text-white/80" : "text-slate-500"
                  )}>
                    Suitable Instruments:
                  </p>
                  <ul className="space-y-1.5">
                    {profile.instruments.map((instrument, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full mt-1.5",
                          isSelected ? "bg-white/60" : "bg-slate-400"
                        )}></div>
                        <span className={isSelected ? "text-white/90" : "text-slate-600"}>
                          {instrument}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
