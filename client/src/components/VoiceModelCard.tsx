import { MoreVertical, Play, Trash2, Edit } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VoiceModelCardProps {
  id: string;
  title: string;
  state: "created" | "training" | "trained" | "failed";
  createdAt: string;
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
  onTest?: (id: string) => void;
  onRename?: (id: string) => void;
}

const stateConfig = {
  created: { label: "Created", color: "bg-muted text-muted-foreground" },
  training: { label: "Training", color: "bg-audio-processing text-white" },
  trained: { label: "Ready", color: "bg-audio-recording text-white" },
  failed: { label: "Failed", color: "bg-destructive text-destructive-foreground" },
};

export default function VoiceModelCard({
  id,
  title,
  state,
  createdAt,
  onSelect,
  onDelete,
  onTest,
  onRename,
}: VoiceModelCardProps) {
  const config = stateConfig[state];
  const initials = title.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <Card 
      className="p-4 sm:p-6 hover-elevate cursor-pointer transition-all" 
      onClick={() => onSelect?.(id)}
      data-testid={`card-voice-model-${id}`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <Avatar className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-chart-2">
          <AvatarFallback className="bg-transparent text-primary-foreground font-semibold text-sm sm:text-base">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
            <h3 className="text-sm sm:text-base font-semibold truncate" data-testid={`text-model-title-${id}`}>
              {title}
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 -mt-1"
                  data-testid={`button-model-menu-${id}`}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onRename?.(id);
                }}>
                  <Edit className="w-4 h-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onTest?.(id);
                }}>
                  <Play className="w-4 h-4 mr-2" />
                  Test Voice
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(id);
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={config.color} data-testid={`badge-status-${id}`}>
              {config.label}
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              {createdAt}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
