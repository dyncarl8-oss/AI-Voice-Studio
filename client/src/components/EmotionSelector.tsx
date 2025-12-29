import { getAllEmotions } from "@shared/emotions";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EmotionSelectorProps {
  onEmotionClick: (tag: string) => void;
}

export default function EmotionSelector({ onEmotionClick }: EmotionSelectorProps) {
  const allEmotions = getAllEmotions();

  return (
    <div className="space-y-2" data-testid="emotion-selector">
      <h3 className="text-sm font-medium">Available Emotions (click to insert)</h3>
      <ScrollArea className="h-32 border rounded-md p-3">
        <div className="flex flex-wrap gap-2">
          {allEmotions.map((emotion) => (
            <Badge
              key={emotion.id}
              variant="outline"
              className="cursor-pointer hover-elevate active-elevate-2"
              onClick={() => onEmotionClick(emotion.tag)}
              data-testid={`emotion-${emotion.id}`}
            >
              {emotion.tag}
            </Badge>
          ))}
        </div>
      </ScrollArea>
      <p className="text-xs text-muted-foreground">
        Click any emotion to insert at cursor, or type them manually like (happy)
      </p>
    </div>
  );
}
