import { useState, useEffect, useRef } from "react";
import { Mic, Square, Play, Pause, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface VoiceRecorderProps {
  onRecordingComplete?: (audioBlob: Blob) => void;
}

export default function VoiceRecorder({ onRecordingComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartRecording = async () => {
    try {
      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      console.log('Microphone access granted');
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        
        if (onRecordingComplete) {
          onRecordingComplete(audioBlob);
        }

        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecordingTime(0);
      setAudioURL(null);
      setIsRecording(true);
      
      console.log('Recording started');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to record audio.",
        variant: "destructive",
      });
    }
  };

  const handleStopRecording = () => {
    console.log('Stop button clicked, isRecording:', isRecording);
    console.log('MediaRecorder state:', mediaRecorderRef.current?.state);
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      console.log('Recording stopped');
    }
    
    setIsRecording(false);
    setIsPaused(false);
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDelete = () => {
    setAudioURL(null);
    setRecordingTime(0);
    setIsPlaying(false);
  };

  return (
    <Card className="p-4 sm:p-8">
      <div className="flex flex-col items-center gap-4 sm:gap-6">
        <div className="relative">
          {isRecording && (
            <div className="absolute -inset-2 rounded-full border-4 border-audio-recording/30 animate-pulse pointer-events-none" />
          )}
          <button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={!!audioURL && !isRecording}
            data-testid={isRecording ? "button-stop-recording" : "button-start-recording"}
            className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 relative z-10",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              isRecording
                ? "bg-destructive hover:bg-destructive/90 animate-pulse"
                : "bg-audio-recording hover:bg-audio-recording/90"
            )}
          >
            {isRecording ? (
              <Square className="w-10 h-10 text-destructive-foreground" />
            ) : (
              <Mic className="w-10 h-10 text-white" />
            )}
          </button>
        </div>

        <div className="text-center space-y-2">
          <div className="font-mono text-2xl sm:text-3xl font-semibold tabular-nums">
            {formatTime(recordingTime)}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground px-2">
            {isRecording
              ? "Recording in progress..."
              : audioURL
              ? "Recording complete"
              : "Click to start recording (20-30 seconds)"}
          </p>
        </div>

        {audioURL && (
          <>
            <audio ref={audioRef} src={audioURL} onEnded={() => setIsPlaying(false)} />
            <div className="flex items-center gap-3 w-full max-w-md">
              <Button
                size="icon"
                variant="outline"
                onClick={handlePlayPause}
                data-testid="button-play-pause"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-audio-waveform" style={{ width: "60%" }} />
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleDelete}
                data-testid="button-delete-recording"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
