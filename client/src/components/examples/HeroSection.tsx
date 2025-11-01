import HeroSection from '../HeroSection';

export default function HeroSectionExample() {
  return (
    <HeroSection 
      onGetStarted={() => console.log('Get Started clicked')}
    />
  );
}
