import VoiceModelCard from '../VoiceModelCard';

export default function VoiceModelCardExample() {
  //todo: remove mock functionality
  const mockModels = [
    { id: '1', title: 'John Doe', state: 'trained' as const, createdAt: '2 hours ago' },
    { id: '2', title: 'Jane Smith', state: 'training' as const, createdAt: '5 mins ago' },
    { id: '3', title: 'Alex Johnson', state: 'created' as const, createdAt: '1 day ago' },
  ];

  return (
    <div className="p-6 space-y-4">
      {mockModels.map(model => (
        <VoiceModelCard
          key={model.id}
          {...model}
          onSelect={(id) => console.log('Selected model:', id)}
          onDelete={(id) => console.log('Delete model:', id)}
          onTest={(id) => console.log('Test model:', id)}
        />
      ))}
    </div>
  );
}
