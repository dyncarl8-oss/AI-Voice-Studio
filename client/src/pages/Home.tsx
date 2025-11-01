import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import TabNavigation from "@/components/TabNavigation";
import VoiceRecorder from "@/components/VoiceRecorder";
import FileUpload from "@/components/FileUpload";
import VoiceModelCard from "@/components/VoiceModelCard";
import TextToSpeechGenerator from "@/components/TextToSpeechGenerator";
import AudioPlayer from "@/components/AudioPlayer";
import ProgressIndicator from "@/components/ProgressIndicator";
import CreditsDisplay from "@/components/CreditsDisplay";
import EmotionExamples from "@/components/EmotionExamples";
import { voiceApi } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Heart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Home() {
  const [activeTab, setActiveTab] = useState<
    "record" | "models" | "generate" | "examples" | "history"
  >("generate");
  const [generatedAudio, setGeneratedAudio] = useState<{
    url: string;
    title: string;
  } | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<{
    blob: Blob;
    title: string;
  } | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [selectedModelForRename, setSelectedModelForRename] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [preselectedVoiceId, setPreselectedVoiceId] = useState<string>("");
  const { toast } = useToast();

  // Fetch voice models
  const { data: voiceModels = [], isLoading: isLoadingModels } = useQuery({
    queryKey: ["/api/voice-models"],
    queryFn: () => voiceApi.listVoiceModels(),
    refetchInterval: 5000, // Poll every 5 seconds to update training status
  });

  // Create voice model mutation
  const createModelMutation = useMutation({
    mutationFn: ({ title, file }: { title: string; file: File }) =>
      voiceApi.createVoiceModel(title, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/voice-models"] });
      setActiveTab("models");
      toast({
        title: "Voice model created",
        description:
          "Your voice model is being trained. This may take a few moments.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Rename voice model mutation
  const renameModelMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      voiceApi.renameVoiceModel(id, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/voice-models"] });
      setRenameDialogOpen(false);
      setSelectedModelForRename(null);
      setNewTitle("");
      toast({
        title: "Voice model renamed",
        description: "The voice model name has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete voice model mutation
  const deleteModelMutation = useMutation({
    mutationFn: (id: string) => voiceApi.deleteVoiceModel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/voice-models"] });
      toast({
        title: "Voice model deleted",
        description: "The voice model has been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Generate speech mutation
  const generateSpeechMutation = useMutation({
    mutationFn: ({
      text,
      voiceModelId,
    }: {
      text: string;
      voiceModelId: string;
    }) => voiceApi.generateSpeech(text, voiceModelId),
    onSuccess: (data) => {
      const audioUrl = `data:audio/mp3;base64,${data.audioBuffer}`;
      setGeneratedAudio({ url: audioUrl, title: "Generated Speech" });
      queryClient.invalidateQueries({ queryKey: ["/api/credits"] });
      toast({
        title: "Speech generated",
        description: "Your audio is ready to play and download.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRecordingComplete = (blob: Blob) => {
    const title = `Voice Clone ${new Date().toLocaleString()}`;
    setRecordedBlob({ blob, title });

    // Convert blob to file and create model
    const file = new File([blob], "recording.wav", { type: "audio/wav" });
    createModelMutation.mutate({ title, file });
  };

  const handleFileSelect = (file: File) => {
    const title = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
    createModelMutation.mutate({ title, file });
  };

  const handleGenerate = (text: string, voiceId: string) => {
    generateSpeechMutation.mutate({ text, voiceModelId: voiceId });
  };

  const handleDownload = () => {
    if (generatedAudio) {
      const link = document.createElement("a");
      link.href = generatedAudio.url;
      link.download = "generated-speech.mp3";
      link.click();
    }
  };

  const handleRename = (id: string) => {
    const model = voiceModels.find((v) => v.id === id);
    if (model) {
      setSelectedModelForRename({ id, title: model.title });
      setNewTitle(model.title);
      setRenameDialogOpen(true);
    }
  };

  const submitRename = () => {
    if (selectedModelForRename && newTitle.trim()) {
      renameModelMutation.mutate({
        id: selectedModelForRename.id,
        title: newTitle.trim(),
      });
    }
  };

  const formatCreatedAt = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  const trainedVoices = voiceModels.filter((v) => v.state === "trained");

  // Fetch generated audio for history tab
  const { data: generatedAudioHistory = [], isLoading: isLoadingHistory } =
    useQuery({
      queryKey: ["/api/generated-audio"],
      queryFn: () => voiceApi.listGeneratedAudio(),
      enabled: activeTab === "history",
    });

  return (
    <div className="min-h-screen bg-background">
      <div className="relative border-b border-border/50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(271_91%_65%_/_0.1),transparent_50%)]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl gradient-primary glow-primary">
                <Heart
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                  data-testid="icon-heart"
                />
              </div>
              <div>
                <h1
                  className="text-2xl sm:text-3xl font-bold text-gradient"
                  data-testid="text-app-title"
                >
                  AI Voice Cloner
                </h1>
                <p
                  className="text-sm sm:text-base text-muted-foreground"
                  data-testid="text-app-description"
                >
                  Create realistic voice clones and generate expressive speech with emotions
                </p>
              </div>
            </div>
            <div className="shrink-0 sm:ml-auto">
              <CreditsDisplay />
            </div>
          </div>
        </div>
      </div>

      <div className="py-4 sm:py-8">
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          {activeTab === "record" && (
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold mb-2">
                  Create Your Voice Model
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                  Record or upload a 20-30 second voice sample to create your AI
                  voice clone
                </p>
              </div>

              {createModelMutation.isPending ? (
                <ProgressIndicator
                  title="Creating Voice Model"
                  progress={50}
                  status="Uploading audio and training AI model..."
                  onCancel={() => {
                    // Can't cancel API request, but we can reset UI
                    createModelMutation.reset();
                  }}
                />
              ) : (
                <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">
                      Record Audio
                    </h3>
                    <VoiceRecorder
                      onRecordingComplete={handleRecordingComplete}
                    />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">
                      Upload Audio File
                    </h3>
                    <FileUpload onFileSelect={handleFileSelect} />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "models" && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold mb-2">
                  My Voice Models
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                  Manage your created voice clones and check their training
                  status
                </p>
              </div>

              {isLoadingModels ? (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
              ) : voiceModels.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    No voice models yet
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Create your first voice clone to get started
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {voiceModels.map((voice) => (
                    <VoiceModelCard
                      key={voice.id}
                      id={voice.id}
                      title={voice.title}
                      state={voice.state}
                      createdAt={formatCreatedAt(voice.createdAt)}
                      onSelect={(id) => {
                        const model = voiceModels.find((v) => v.id === id);
                        if (model?.state === "trained") {
                          setPreselectedVoiceId(id);
                          setActiveTab("generate");
                        } else {
                          toast({
                            title: "Model not ready",
                            description:
                              "Please wait for the model to finish training.",
                          });
                        }
                      }}
                      onRename={handleRename}
                      onDelete={(id) => deleteModelMutation.mutate(id)}
                      onTest={(id) => {
                        const model = voiceModels.find((v) => v.id === id);
                        if (model?.state === "trained") {
                          setActiveTab("generate");
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "generate" && (
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold mb-2">
                  Generate Emotional Speech
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                  Select emotions to add natural expression and feeling to your AI-generated speech
                </p>
              </div>

              <div className="max-w-3xl">
                <TextToSpeechGenerator
                  voices={trainedVoices.map((v) => ({
                    id: v.id,
                    name: v.title,
                  }))}
                  onGenerate={handleGenerate}
                  isGenerating={generateSpeechMutation.isPending}
                  preselectedVoiceId={preselectedVoiceId}
                />
              </div>

              {generatedAudio && (
                <div className="max-w-3xl">
                  <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">
                    Generated Audio
                  </h3>
                  <AudioPlayer
                    audioUrl={generatedAudio.url}
                    title={generatedAudio.title}
                    onDownload={handleDownload}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === "examples" && <EmotionExamples />}

          {activeTab === "history" && (
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold mb-2">
                  Generated Speech History
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                  Access all your previously generated speech recordings
                </p>
              </div>

              {isLoadingHistory ? (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
              ) : generatedAudioHistory.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    No generated speech yet
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Generate your first speech to see it here
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {generatedAudioHistory.map((audio, index) => (
                    <div key={audio.id} className="max-w-3xl">
                      <div className="mb-2">
                        <h3 className="text-base sm:text-lg font-medium">
                          Recording #{generatedAudioHistory.length - index}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                          {audio.text}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatCreatedAt(audio.createdAt)}
                        </p>
                      </div>
                      <AudioPlayer
                        audioUrl={audio.audioUrl}
                        title={`Generated Speech #${generatedAudioHistory.length - index}`}
                        onDownload={() => {
                          const link = document.createElement("a");
                          link.href = audio.audioUrl;
                          link.download = `speech-${audio.id}.mp3`;
                          link.click();
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Voice Model</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-title">New Name</Label>
              <Input
                id="new-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter new name"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    submitRename();
                  }
                }}
                data-testid="input-rename-model"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameDialogOpen(false)}
              data-testid="button-cancel-rename"
            >
              Cancel
            </Button>
            <Button
              onClick={submitRename}
              disabled={!newTitle.trim() || renameModelMutation.isPending}
              data-testid="button-submit-rename"
            >
              {renameModelMutation.isPending ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
