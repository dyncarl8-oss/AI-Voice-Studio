import { Mic, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onGetStarted?: () => void;
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-chart-2/20 border-b border-border">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(262,83%,58%,0.1),transparent_50%),radial-gradient(circle_at_70%_50%,rgba(195,92%,56%,0.1),transparent_50%)]" />
      
      <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Advanced Voice AI Technology</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Create Your Own
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-chart-2">
              AI Voice Clone
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Record or upload a 20-30 second voice sample, create a personalized voice model, 
            and generate high-quality speech from any text.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button 
              size="lg" 
              onClick={onGetStarted}
              data-testid="button-get-started"
              className="gap-2"
            >
              <Mic className="w-4 h-4" />
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              data-testid="button-learn-more"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
