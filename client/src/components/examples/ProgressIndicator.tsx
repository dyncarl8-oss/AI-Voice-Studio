import { useState, useEffect } from 'react';
import ProgressIndicator from '../ProgressIndicator';

export default function ProgressIndicatorExample() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 0;
        return prev + 5;
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6">
      <ProgressIndicator 
        title="Creating Voice Model: John Doe"
        progress={progress}
        status="Processing audio samples and training AI model..."
        onCancel={() => console.log('Cancel training')}
      />
    </div>
  );
}
