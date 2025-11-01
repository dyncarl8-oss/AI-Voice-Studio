import { Mic, Brain, Sparkles, History, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface TabNavigationProps {
  activeTab: "record" | "models" | "generate" | "examples" | "history";
  onTabChange: (tab: "record" | "models" | "generate" | "examples" | "history") => void;
}

const tabs = [
  { id: "record" as const, label: "Record/Upload", icon: Mic },
  { id: "models" as const, label: "My Voices", icon: Brain },
  { id: "generate" as const, label: "Generate Speech", icon: Sparkles },
  { id: "examples" as const, label: "Emotion Guide", icon: BookOpen },
  { id: "history" as const, label: "History", icon: History },
];

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                data-testid={`tab-${tab.id}`}
                className={cn(
                  "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-3 sm:py-4 font-medium transition-colors relative whitespace-nowrap",
                  "hover-elevate text-sm sm:text-base",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="hidden min-[480px]:inline">{tab.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
