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
      icon: <Shield className="w-5 h-5" />,
      returns: "6-8%",
      description: "Stable returns with minimal volatility.",
      instruments: ["Fixed Deposits", "PPF", "Liquid Funds"],
    },
    {
      id: "moderate" as const,
      title: "Medium Risk",
      icon: <TrendingUp className="w-5 h-5" />,
      returns: "10-14%",
      description: "Balanced growth with manageable risk.",
      instruments: ["Equity + Debt Mix", "Hybrid Funds", "Index Funds"],
    },
    {
      id: "high" as const,
      title: "High Risk",
      icon: <Zap className="w-5 h-5" />,
      returns: "15-20%+",
      description: "High returns potential with volatility.",
      instruments: ["Direct Equity", "Growth Stocks", "Sector Funds"],
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {riskProfiles.map((profile) => {
        const isSelected = selectedRisk === profile.id;
        
        return (
          <button
            key={profile.id}
            onClick={() => onSelect?.(profile.id)}
            className={cn(
              "relative text-left transition-all duration-300 rounded-2xl border p-8 flex flex-col items-start gap-4",
              isSelected 
                ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                : "border-border hover:bg-muted/40 cursor-pointer"
            )}
          >
            {isSelected && (
              <div className="absolute top-4 right-4">
                <Check className="w-4 h-4 text-primary" />
              </div>
            )}
            
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}>
              {profile.icon}
            </div>
            
            <div className="space-y-1">
              <h3 className={cn(
                "text-base font-semibold",
                isSelected ? "text-primary" : "text-foreground"
              )}>
                {profile.title}
              </h3>
              
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-tight">
                Expected {profile.returns}
              </p>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              {profile.description}
            </p>
            
            <ul className="space-y-1.5 mt-auto pt-2">
              {profile.instruments.map((instrument, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs font-medium text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 bg-muted-foreground/30"></div>
                  <span>{instrument}</span>
                </li>
              ))}
            </ul>
          </button>
        );
      })}
    </div>
  );
}
