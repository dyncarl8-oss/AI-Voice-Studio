import AudioPlayer from '../AudioPlayer';

export default function AudioPlayerExample() {
  return (
    <div className="p-6">
      <AudioPlayer 
        audioUrl="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
        title="My Generated Voice"
        onDownload={() => console.log('Download clicked')}
      />
    </div>
  );
}
