import { useState, useRef } from "react";
import { Upload, File, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect?: (file: File) => void;
  accept?: string;
  maxSize?: number;
}

export default function FileUpload({ 
  onFileSelect, 
  accept = "audio/*,.mp3,.wav",
  maxSize = 10 * 1024 * 1024 // 10MB
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file.size > maxSize) {
      console.error('File too large');
      return;
    }
    setSelectedFile(file);
    onFileSelect?.(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setSelectedFile(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Card className="p-4 sm:p-8">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        className="hidden"
        data-testid="input-file"
      />

      {selectedFile ? (
        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
            <File className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate" data-testid="text-filename">
              {selectedFile.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleRemove}
            data-testid="button-remove-file"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          data-testid="dropzone-upload"
          className={cn(
            "border-2 border-dashed rounded-lg p-8 sm:p-12 text-center cursor-pointer transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          )}
        >
          <Upload className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
          <p className="text-base sm:text-lg font-medium mb-2">
            Drop your audio file here
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
            or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            Supports MP3, WAV (max 10MB, 20-30 seconds)
          </p>
        </div>
      )}
    </Card>
  );
}
