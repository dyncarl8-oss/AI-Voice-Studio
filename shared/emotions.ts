export interface EmotionCategory {
  name: string;
  description: string;
  emotions: Emotion[];
}

export interface Emotion {
  id: string;
  label: string;
  tag: string;
  description: string;
  example: string;
}

export const EMOTION_CATEGORIES: EmotionCategory[] = [
  {
    name: "Basic Emotions",
    description: "Fundamental emotional expressions for everyday conversations",
    emotions: [
      { id: "happy", label: "(happy)", tag: "(happy)", description: "Cheerful, upbeat tone", example: "What a beautiful day!" },
      { id: "sad", label: "(sad)", tag: "(sad)", description: "Melancholic, downcast", example: "I'm sorry to hear that." },
      { id: "angry", label: "(angry)", tag: "(angry)", description: "Frustrated, aggressive", example: "This is unacceptable!" },
      { id: "excited", label: "(excited)", tag: "(excited)", description: "Energetic, enthusiastic", example: "This is amazing news!" },
      { id: "calm", label: "(calm)", tag: "(calm)", description: "Peaceful, relaxed", example: "Let's take a deep breath." },
      { id: "nervous", label: "(nervous)", tag: "(nervous)", description: "Anxious, uncertain", example: "I'm not sure about this." },
      { id: "confident", label: "(confident)", tag: "(confident)", description: "Assertive, self-assured", example: "I know we can do this!" },
      { id: "surprised", label: "(surprised)", tag: "(surprised)", description: "Shocked, amazed", example: "I can't believe it!" },
      { id: "satisfied", label: "(satisfied)", tag: "(satisfied)", description: "Content, pleased", example: "Perfect, just what I needed." },
      { id: "delighted", label: "(delighted)", tag: "(delighted)", description: "Very pleased, joyful", example: "This makes me so happy!" },
      { id: "scared", label: "(scared)", tag: "(scared)", description: "Frightened, fearful", example: "That's terrifying!" },
      { id: "worried", label: "(worried)", tag: "(worried)", description: "Concerned, troubled", example: "What if something goes wrong?" },
    ]
  },
  {
    name: "Advanced Emotions",
    description: "Nuanced emotional expressions for complex scenarios",
    emotions: [
      { id: "empathetic", label: "(empathetic)", tag: "(empathetic)", description: "Understanding, caring", example: "I understand how you feel." },
      { id: "grateful", label: "(grateful)", tag: "(grateful)", description: "Thankful, appreciative", example: "Thank you so much!" },
      { id: "proud", label: "(proud)", tag: "(proud)", description: "Accomplished, satisfied", example: "I'm proud of what we've achieved." },
      { id: "curious", label: "(curious)", tag: "(curious)", description: "Inquisitive, interested", example: "How does that work?" },
      { id: "hopeful", label: "(hopeful)", tag: "(hopeful)", description: "Optimistic about future", example: "Things will get better." },
      { id: "disappointed", label: "(disappointed)", tag: "(disappointed)", description: "Let down, dissatisfied", example: "That's not what I expected." },
      { id: "frustrated", label: "(frustrated)", tag: "(frustrated)", description: "Annoyed, exasperated", example: "Why isn't this working?" },
      { id: "confused", label: "(confused)", tag: "(confused)", description: "Puzzled, perplexed", example: "I don't understand." },
      { id: "determined", label: "(determined)", tag: "(determined)", description: "Resolved, decided", example: "I will make this happen." },
      { id: "nostalgic", label: "(nostalgic)", tag: "(nostalgic)", description: "Longing for the past", example: "I remember when..." },
    ]
  },
  {
    name: "Tone Controls",
    description: "Adjust volume and speaking intensity",
    emotions: [
      { id: "whispering", label: "(whispering)", tag: "(whispering)", description: "Very soft, secretive", example: "Don't tell anyone." },
      { id: "soft", label: "(soft tone)", tag: "(soft tone)", description: "Gentle, quiet", example: "Everything will be okay." },
      { id: "hurried", label: "(in a hurry tone)", tag: "(in a hurry tone)", description: "Rushed, urgent", example: "We need to go now!" },
      { id: "shouting", label: "(shouting)", tag: "(shouting)", description: "Loud, calling out", example: "Hey, over here!" },
    ]
  },
  {
    name: "Audio Effects",
    description: "Natural human sounds and reactions",
    emotions: [
      { id: "laughing", label: "(laughing)", tag: "(laughing)", description: "Full laughter", example: "Ha ha ha!" },
      { id: "chuckling", label: "(chuckling)", tag: "(chuckling)", description: "Light laugh", example: "Heh heh." },
      { id: "sighing", label: "(sighing)", tag: "(sighing)", description: "Exhale of relief/frustration", example: "Sigh." },
      { id: "gasping", label: "(gasping)", tag: "(gasping)", description: "Sharp intake of breath", example: "Gasp!" },
      { id: "sobbing", label: "(sobbing)", tag: "(sobbing)", description: "Crying heavily", example: "I can't do this." },
    ]
  }
];

export const EMOTION_EXAMPLES = [
  {
    title: "Customer Service",
    text: "(empathetic) I understand your frustration. (confident) Let me help you resolve this issue right away.",
    description: "Combine empathy with confidence to reassure customers"
  },
  {
    title: "Storytelling",
    text: "(excited) Once upon a time, there was a magical kingdom. (whispering) But deep in the forest, a secret waited.",
    description: "Use varying emotions to create engaging narratives"
  },
  {
    title: "Celebration",
    text: "(excited) Congratulations! (laughing) Ha ha! You did it!",
    description: "Express genuine joy and excitement"
  },
  {
    title: "Motivation",
    text: "(confident) You have what it takes. (determined) Keep pushing forward and you'll succeed!",
    description: "Inspire and encourage with confident tones"
  },
  {
    title: "Apology",
    text: "(sad) I'm truly sorry for the inconvenience. (hopeful) We'll make sure this doesn't happen again.",
    description: "Show genuine remorse and commitment to improvement"
  }
];

export const EMOTION_USAGE_TIPS = [
  {
    title: "Placement",
    tip: "Emotion tags must go at the beginning of sentences in English",
    example: "Correct: (happy) What a wonderful day!\nIncorrect: What a (happy) wonderful day!"
  },
  {
    title: "Combining",
    tip: "Layer multiple emotions for complex expressions",
    example: "(sad)(whispering) I miss you so much."
  },
  {
    title: "Sequential",
    tip: "Change emotions throughout your text naturally",
    example: "(excited) We're launching tomorrow! (nervous) I hope everything goes smoothly."
  },
  {
    title: "Natural Text",
    tip: "Add appropriate text after sound effects",
    example: "(laughing) Ha ha ha, that's hilarious!"
  }
];

export function getAllEmotions(): Emotion[] {
  return EMOTION_CATEGORIES.flatMap(category => category.emotions);
}

export function getEmotionByTag(tag: string): Emotion | undefined {
  return getAllEmotions().find(emotion => emotion.tag === tag);
}

export function getEmotionById(id: string): Emotion | undefined {
  return getAllEmotions().find(emotion => emotion.id === id);
}
