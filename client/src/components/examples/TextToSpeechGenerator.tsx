import { useState } from 'react';
import TextToSpeechGenerator from '../TextToSpeechGenerator';

export default function TextToSpeechGeneratorExample() {
  //todo: remove mock functionality
  const mockVoices = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Alex Johnson' },
  ];

  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = (text: string, voiceId: string) => {
    console.log('Generate speech:', { text, voiceId });
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <div className="p-6">
      <TextToSpeechGenerator 
        voices={mockVoices}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
      />
    </div>
  );
}
