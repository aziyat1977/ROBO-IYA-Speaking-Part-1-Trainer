
export enum SlideType {
    Question = 'Question',
    Answer = 'Answer',
    Reasoning = 'Reasoning',
    Pronunciation = 'Pronunciation Trainer'
}

export interface SlideContent {
    topic: string;
    topicEmoji: string;
    slideType: SlideType;
    text: string;
    subText?: string; // For Q: A: format
    visualMode: number; // 0, 1, 2 representing the evolution of the visual
    id: number;
}

export interface TopicDef {
    id: string;
    name: string;
    emoji: string;
    slides: SlideContent[];
}
