import { EMOTION_EXAMPLES, getAllEmotions } from "@shared/emotions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function EmotionExamples() {
  const { toast } = useToast();
  const allEmotions = getAllEmotions();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold mb-2">
          How to Use Emotions
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Add emotion tags like (happy) at the start of sentences to control how the AI speaks
        </p>
      </div>

      <Card className="p-4 sm:p-6">
        <div className="flex items-start gap-3 mb-4">
          <Lightbulb className="w-5 h-5 text-primary mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-medium">Quick Tips</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Place emotion tags at the beginning of sentences: <code className="text-xs bg-muted px-1 py-0.5 rounded">(happy) Hello!</code></li>
              <li>You can type emotions manually or click them from the list above</li>
              <li>Combine multiple emotions: <code className="text-xs bg-muted px-1 py-0.5 rounded">(happy)(excited) This is amazing!</code></li>
              <li>Change emotions throughout your text for natural expression</li>
            </ul>
          </div>
        </div>
      </Card>

      <div>
        <h3 className="text-lg font-semibold mb-4">Example Texts</h3>
        <div className="space-y-4">
          {EMOTION_EXAMPLES.map((example, index) => (
            <Card key={index} className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{example.title}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(example.text)}
                    data-testid={`button-copy-${index}`}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">{example.description}</p>
                <div className="bg-muted p-3 rounded-md">
                  <code className="text-sm">{example.text}</code>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">All Available Emotions ({allEmotions.length})</h3>
        <Card className="p-4">
          <div className="flex flex-wrap gap-2">
            {allEmotions.map((emotion) => (
              <Badge
                key={emotion.id}
                variant="secondary"
                className="cursor-pointer hover-elevate"
                onClick={() => copyToClipboard(emotion.tag)}
                data-testid={`emotion-badge-${emotion.id}`}
              >
                {emotion.tag}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Click any emotion to copy it to clipboard
          </p>
        </Card>
      </div>
    </div>
  );
}
