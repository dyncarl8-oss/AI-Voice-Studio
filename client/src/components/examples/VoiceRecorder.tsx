import VoiceRecorder from '../VoiceRecorder';

export default function VoiceRecorderExample() {
  return (
    <div className="p-6">
      <VoiceRecorder 
        onRecordingComplete={(blob) => console.log('Recording complete', blob)}
      />
    </div>
  );
}
