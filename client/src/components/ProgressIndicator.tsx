import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ProgressIndicatorProps {
  title: string;
  progress: number;
  status: string;
  onCancel?: () => void;
}

export default function ProgressIndicator({ 
  title, 
  progress, 
  status,
  onCancel 
}: ProgressIndicatorProps) {
  return (
    <Card className="p-4 sm:p-6">
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-semibold mb-1" data-testid="text-progress-title">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground" data-testid="text-progress-status">
              {status}
            </p>
          </div>
          {onCancel && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onCancel}
              data-testid="button-cancel-training"
              className="flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <Progress value={progress} className="h-2" data-testid="progress-bar" />
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground">Training model...</span>
            <span className="font-mono font-semibold" data-testid="text-progress-percentage">
              {progress}%
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-8">
          <div className="relative">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-primary/20 rounded-full" />
            <div 
              className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"
              style={{ animationDuration: "1s" }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
