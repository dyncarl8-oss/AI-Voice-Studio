import { useState, useEffect, useRef } from "react";
import { Sparkles, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EmotionSelector from "@/components/EmotionSelector";

interface TextToSpeechGeneratorProps {
  voices?: Array<{ id: string; name: string }>;
  onGenerate?: (text: string, voiceId: string) => void;
  isGenerating?: boolean;
  preselectedVoiceId?: string;
}

export default function TextToSpeechGenerator({
  voices = [],
  onGenerate,
  isGenerating = false,
  preselectedVoiceId,
}: TextToSpeechGeneratorProps) {
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [showErrors, setShowErrors] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (preselectedVoiceId && voices.some(v => v.id === preselectedVoiceId)) {
      setSelectedVoice(preselectedVoiceId);
    }
  }, [preselectedVoiceId, voices]);

  const handleEmotionClick = (tag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPosition = textarea.selectionStart;
    const textBefore = text.substring(0, cursorPosition);
    const textAfter = text.substring(cursorPosition);
    
    const newText = textBefore + tag + " " + textAfter;
    setText(newText.slice(0, maxChars));

    // Set cursor position after the inserted tag
    setTimeout(() => {
      const newPosition = cursorPosition + tag.length + 1;
      textarea.focus();
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const handleGenerate = () => {
    if (!text.trim() || !selectedVoice) {
      setShowErrors(true);
      return;
    }

    setShowErrors(false);
    onGenerate?.(text.trim(), selectedVoice);
  };

  const charCount = text.length;
  const maxChars = 500;
  const hasVoiceError = showErrors && !selectedVoice;
  const hasTextError = showErrors && !text.trim();

  return (
    <Card className="p-4 sm:p-6">
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <Label htmlFor="voice-select">Select Voice</Label>
          <Select value={selectedVoice} onValueChange={(value) => {
            setSelectedVoice(value);
            if (showErrors && value) {
              setShowErrors(false);
            }
          }}>
            <SelectTrigger 
              id="voice-select" 
              data-testid="select-voice"
              className={hasVoiceError ? "border-destructive" : ""}
            >
              <SelectValue placeholder="Choose a voice model" />
            </SelectTrigger>
            <SelectContent>
              {voices.length === 0 ? (
                <SelectItem value="none" disabled>
                  No voice models available
                </SelectItem>
              ) : (
                voices.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    {voice.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {hasVoiceError && (
            <p className="text-sm text-destructive font-medium">
              ⚠️ Please select a voice model or create one in the "Record" tab
            </p>
          )}
        </div>

        <EmotionSelector onEmotionClick={handleEmotionClick} />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="text-input">Enter Text</Label>
            <span className="text-xs text-muted-foreground font-mono">
              {charCount} / {maxChars}
            </span>
          </div>
          <Textarea
            ref={textareaRef}
            id="text-input"
            placeholder="Click emotions above to insert them, or type them yourself like (happy) Hello world!"
            value={text}
            onChange={(e) => {
              setText(e.target.value.slice(0, maxChars));
              if (showErrors && e.target.value.trim()) {
                setShowErrors(false);
              }
            }}
            className={`min-h-32 resize-none ${hasTextError ? "border-destructive" : ""}`}
            data-testid="input-text"
          />
          {hasTextError && (
            <p className="text-sm text-destructive font-medium">
              ⚠️ Please enter some text to generate speech
            </p>
          )}
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full"
          size="lg"
          data-testid="button-generate"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
              <span className="ml-2">Generating...</span>
            </>
          ) : (
            <div className="flex items-center justify-center w-full relative">
              <Sparkles className="w-4 h-4" />
              <span className="ml-2">Generate Speech</span>
              <span className="absolute right-0 flex items-center gap-1 text-xs opacity-80">
                <Coins className="w-3 h-3" />
                -1
              </span>
            </div>
          )}
        </Button>
      </div>
    </Card>
  );
}
