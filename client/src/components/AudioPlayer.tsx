import { useState, useRef, useEffect } from "react";
import { Play, Pause, Download, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

interface AudioPlayerProps {
  audioUrl: string;
  title?: string;
  onDownload?: () => void;
}

export default function AudioPlayer({ audioUrl, title = "Generated Audio", onDownload }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="p-4 sm:p-6">
      <audio ref={audioRef} src={audioUrl} />
      
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm sm:text-base font-semibold truncate" data-testid="text-audio-title">{title}</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={onDownload}
            className="gap-1.5 sm:gap-2 flex-shrink-0"
            data-testid="button-download"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden min-[480px]:inline">Download</span>
          </Button>
        </div>

        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
            data-testid="slider-progress"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            size="icon"
            onClick={togglePlay}
            data-testid="button-play-pause-audio"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>

          <div className="flex items-center gap-2 flex-1 max-w-[150px] sm:max-w-xs">
            <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
            <Slider
              value={[volume * 100]}
              max={100}
              step={1}
              onValueChange={(value) => setVolume(value[0] / 100)}
              className="cursor-pointer"
              data-testid="slider-volume"
            />
          </div>

          <div className="h-10 sm:h-12 flex items-center gap-0.5 sm:gap-1">
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={i}
                className="w-0.5 sm:w-1 bg-audio-waveform rounded-full transition-all"
                style={{
                  height: `${Math.random() * 60 + 40}%`,
                  opacity: isPlaying ? 0.8 : 0.3,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
