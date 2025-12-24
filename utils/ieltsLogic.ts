// The "Brain" of the offline examiner.
// Based on official band descriptors for FC, LR, GRA, and P.

export interface FeedbackResult {
    overallBand: string;
    transcript: string;
    criteria: {
        fc: { score: number; feedback: string; wpm: number; fillers: number };
        lr: { score: number; feedback: string; advancedWordsUsed: string[]; repeatedWords: string[] };
        gra: { score: number; feedback: string; complexStructures: string[] };
        p: { score: number; feedback: string }; // Estimated via fluency metrics
    };
    mistakes: { text: string; issue: string; type: 'grammar' | 'vocab' | 'fluency' }[];
}

// Band 7+ Vocabulary Database
const ADVANCED_VOCAB = new Set([
    'captivating', 'landmarks', 'stark', 'contrast', 'indispensable', 'facilitates',
    'sedentary', 'concentration', 'simultaneously', 'demanding', 'tangible', 'heritage',
    'productivity', 'ritual', 'artisanal', 'replicate', 'synchronization', 'inevitable',
    'fundamental', 'consequently', 'furthermore', 'nevertheless', 'predominantly',
    'substantially', 'aesthetic', 'pragmatic', 'tedious', 'monotonous', 'invigorating',
    'nostalgic', 'reminiscent', 'impeccable', 'meticulous', 'spontaneous', 'deliberate'
]);

// Weak/Overused words (Band 4-5)
const BASIC_VOCAB = new Set([
    'good', 'bad', 'nice', 'happy', 'sad', 'big', 'small', 'thing', 'stuff', 'very', 'really', 'like'
]);

// Complex Grammar Patterns (Regex)
const GRAMMAR_PATTERNS = [
    { name: 'Conditional (If)', regex: /\bif\b/i },
    { name: 'Passive Voice', regex: /\b(is|are|was|were|been)\s\w+(ed|en)\b/i },
    { name: 'Relative Clause', regex: /\b(which|who|that|where)\b/i },
    { name: 'Perfect Tense', regex: /\b(have|has|had)\s\w+(ed|en)\b/i },
    { name: 'Concessive Clause', regex: /\b(although|even though|despite|however)\b/i }
];

export const analyzeSpeech = (transcript: string, durationSeconds: number): FeedbackResult => {
    const words = transcript.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").split(/\s+/);
    const wordCount = words.length;
    const wpm = Math.round((wordCount / durationSeconds) * 60);

    // 1. FLUENCY & COHERENCE (FC)
    // Examiners look for: Speed, Hesitation, Self-correction.
    let fcScore = 5.0;
    const fillers = words.filter(w => ['um', 'uh', 'ah', 'like', 'you know', 'sort of'].includes(w)).length;
    
    // WPM Scoring logic
    if (wpm > 110) fcScore += 2; // Band 7+ speed
    else if (wpm > 90) fcScore += 1; // Band 6 speed
    else fcScore -= 1; // Slow

    // Penalty for fillers
    const fillerRatio = fillers / wordCount;
    if (fillerRatio > 0.10) fcScore -= 1.5; // Frequent hesitation
    else if (fillerRatio > 0.05) fcScore -= 0.5;

    fcScore = Math.min(9, Math.max(4, fcScore));

    // 2. LEXICAL RESOURCE (LR)
    // Examiners look for: Range, Collocation, Less common items.
    let lrScore = 5.0;
    const usedAdvanced = words.filter(w => ADVANCED_VOCAB.has(w));
    const usedBasic = words.filter(w => BASIC_VOCAB.has(w));
    
    // Repetition check
    const wordFreq: Record<string, number> = {};
    words.forEach(w => { if(w.length > 3) wordFreq[w] = (wordFreq[w] || 0) + 1; });
    const repeated = Object.keys(wordFreq).filter(w => wordFreq[w] > 2);

    if (usedAdvanced.length > 4) lrScore += 3; // Strong vocab
    else if (usedAdvanced.length > 2) lrScore += 1.5;
    
    if (usedBasic.length > 5) lrScore -= 1; // Limited range

    lrScore = Math.min(9, Math.max(4, lrScore));

    // 3. GRAMMATICAL RANGE & ACCURACY (GRA)
    // Examiners look for: Sentence complexity, Error free sentences.
    let graScore = 5.0;
    const foundStructures = GRAMMAR_PATTERNS.filter(p => p.regex.test(transcript)).map(p => p.name);
    
    if (foundStructures.length >= 3) graScore += 3; // Band 7+ Range
    else if (foundStructures.length >= 2) graScore += 1.5; // Band 6 Range

    // Approximation: Longer sentences usually imply better structure in fluid speech
    const avgWordLen = transcript.length / (words.length || 1);
    if (avgWordLen > 4.5) graScore += 0.5;

    graScore = Math.min(9, Math.max(4, graScore));

    // 4. PRONUNCIATION (P)
    // Offline approximation based on fluency and utterance length (chunking).
    // In real exam: Intonation, stress, sounds.
    // Here: Smoothness serves as proxy.
    let pScore = fcScore * 0.8 + (usedAdvanced.length > 0 ? 1 : 0); 
    pScore = Math.min(9, Math.max(4, pScore));

    // GENERATE MISTAKES / FEEDBACK
    const mistakes = [];
    
    if (fillerRatio > 0.08) {
        mistakes.push({ text: "High usage of fillers", issue: "You used 'um', 'like', or 'uh' too frequently. Pause silently instead.", type: 'fluency' as const });
    }
    if (wpm < 90) {
        mistakes.push({ text: "Slow Speech Rate", issue: "Your pace is below 90 WPM. Aim for a continuous flow.", type: 'fluency' as const });
    }
    repeated.forEach(word => {
        mistakes.push({ text: word, issue: `You repeated '${word}' ${wordFreq[word]} times. Use synonyms.`, type: 'vocab' as const });
    });
    if (foundStructures.length < 2) {
        mistakes.push({ text: "Simple Sentences", issue: "Try using 'If', 'Although', or 'Which' to connect ideas.", type: 'grammar' as const });
    }

    const overallBand = ((fcScore + lrScore + graScore + pScore) / 4).toFixed(1);

    return {
        overallBand,
        transcript,
        criteria: {
            fc: { 
                score: Math.round(fcScore * 2) / 2, 
                feedback: fcScore > 7 ? "Excellent continuous flow." : "Try to reduce hesitation.",
                wpm,
                fillers
            },
            lr: { 
                score: Math.round(lrScore * 2) / 2, 
                feedback: usedAdvanced.length > 2 ? "Good use of less common items." : "Vocabulary is functional but limited.",
                advancedWordsUsed: [...new Set(usedAdvanced)],
                repeatedWords: repeated
            },
            gra: { 
                score: Math.round(graScore * 2) / 2, 
                feedback: foundStructures.length > 2 ? "Good range of complex structures." : "Reliant on simple sentence forms.",
                complexStructures: foundStructures
            },
            p: { 
                score: Math.round(pScore * 2) / 2, 
                feedback: "Pronunciation estimated based on flow and clarity."
            }
        },
        mistakes
    };
};