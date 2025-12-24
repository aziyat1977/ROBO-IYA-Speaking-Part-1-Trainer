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
    'nostalgic', 'reminiscent', 'impeccable', 'meticulous', 'spontaneous', 'deliberate',
    'crucial', 'significant', 'aspect', 'perspective', 'notion', 'controversial'
]);

// Weak/Overused words (Band 4-5)
const BASIC_VOCAB = new Set([
    'good', 'bad', 'nice', 'happy', 'sad', 'big', 'small', 'thing', 'stuff', 'very', 'really', 'like', 'lot', 'lots'
]);

// Complex Grammar Patterns (Regex)
const GRAMMAR_PATTERNS = [
    { name: 'Conditional (If)', regex: /\bif\b/i },
    { name: 'Passive Voice', regex: /\b(is|are|was|were|been)\s\w+(ed|en)\b/i },
    { name: 'Relative Clause', regex: /\b(which|who|that|where)\b/i },
    { name: 'Perfect Tense', regex: /\b(have|has|had)\s\w+(ed|en)\b/i },
    { name: 'Concessive Clause', regex: /\b(although|even though|despite|however)\b/i }
];

// Common Grammar Slips Regex
const GRAMMAR_ERRORS = [
    { regex: /\b(a)\s+[aeiou]/i, issue: "Incorrect article 'a' before vowel sound", fix: "an" },
    { regex: /\b(an)\s+[bcdfghjklmnpqrstvwxyz]/i, issue: "Incorrect article 'an' before consonant", fix: "a" },
    { regex: /\b(I|you|we|they)\s+is\b/i, issue: "Subject-verb agreement error", fix: "are/am" },
    { regex: /\b(he|she|it)\s+have\b/i, issue: "Subject-verb agreement error", fix: "has" },
    { regex: /\b(much)\s+(people|cars|books)\b/i, issue: "Quantifier error with countable noun", fix: "many" },
    { regex: /\b(less)\s+(people|cars|books)\b/i, issue: "Quantifier error with countable noun", fix: "fewer" },
];

export const analyzeSpeech = (transcript: string, durationSeconds: number): FeedbackResult => {
    // Basic cleanup for analysis
    const cleanTranscript = transcript.trim();
    const lowerTranscript = cleanTranscript.toLowerCase();
    const words = lowerTranscript.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").split(/\s+/);
    const wordCount = words.length;
    const wpm = Math.round((wordCount / (durationSeconds || 1)) * 60);

    const mistakes: { text: string; issue: string; type: 'grammar' | 'vocab' | 'fluency' }[] = [];

    // 1. FLUENCY & COHERENCE (FC)
    let fcScore = 5.0;
    const fillers = words.filter(w => ['um', 'uh', 'ah', 'like', 'you know', 'sort of', 'kind of'].includes(w)).length;
    
    // WPM Scoring logic
    if (wpm > 120) fcScore += 2; 
    else if (wpm > 100) fcScore += 1.5;
    else if (wpm > 80) fcScore += 0.5;
    else fcScore -= 0.5;

    // Penalty for fillers
    const fillerRatio = fillers / wordCount;
    if (fillerRatio > 0.12) fcScore -= 1.5; 
    else if (fillerRatio > 0.08) fcScore -= 0.5;

    fcScore = Math.min(9, Math.max(4, fcScore));

    // 2. LEXICAL RESOURCE (LR)
    let lrScore = 5.0;
    const usedAdvanced = words.filter(w => ADVANCED_VOCAB.has(w));
    const usedBasic = words.filter(w => BASIC_VOCAB.has(w));
    
    // Repetition check (exclude common small words)
    const wordFreq: Record<string, number> = {};
    words.forEach(w => { 
        if(w.length > 4) wordFreq[w] = (wordFreq[w] || 0) + 1; 
    });
    const repeated = Object.keys(wordFreq).filter(w => wordFreq[w] > 2);

    if (usedAdvanced.length > 5) lrScore += 3; 
    else if (usedAdvanced.length > 2) lrScore += 1.5;
    
    if (usedBasic.length > 6) lrScore -= 1;

    lrScore = Math.min(9, Math.max(4, lrScore));

    // 3. GRAMMATICAL RANGE & ACCURACY (GRA)
    let graScore = 5.0;
    const foundStructures = GRAMMAR_PATTERNS.filter(p => p.regex.test(transcript)).map(p => p.name);
    
    // Check specific grammar errors
    GRAMMAR_ERRORS.forEach(err => {
        const match = transcript.match(err.regex);
        if (match) {
            mistakes.push({ 
                text: match[0], 
                issue: `${err.issue}. Try '${err.fix}'.`, 
                type: 'grammar' 
            });
            graScore -= 0.5;
        }
    });

    if (foundStructures.length >= 4) graScore += 3;
    else if (foundStructures.length >= 2) graScore += 1.5;

    const avgWordLen = cleanTranscript.length / (words.length || 1);
    if (avgWordLen > 5) graScore += 0.5;

    graScore = Math.min(9, Math.max(3, graScore));

    // 4. PRONUNCIATION (P)
    // Approximate based on lack of pauses (inferred from WPM) and complexity
    let pScore = fcScore * 0.7 + (usedAdvanced.length > 1 ? 1.5 : 0.5); 
    pScore = Math.min(9, Math.max(4, pScore));

    // POPULATE MISTAKES LIST
    if (fillerRatio > 0.1) {
        mistakes.push({ text: "Filler words", issue: "High usage of 'um', 'uh', 'like'.", type: 'fluency' });
    }
    if (wpm < 80) {
        mistakes.push({ text: "Slow pace", issue: "Speech rate < 80 WPM.", type: 'fluency' });
    }
    repeated.forEach(word => {
        mistakes.push({ text: word, issue: `Repeated '${word}' ${wordFreq[word]} times.`, type: 'vocab' });
    });
    usedBasic.forEach(word => {
        // Only flag if used excessively, but here we flag first instance to be strict
        if (!mistakes.some(m => m.text === word)) {
             mistakes.push({ text: word, issue: "Basic vocabulary. Try a more precise synonym.", type: 'vocab' });
        }
    });

    const overallBand = ((fcScore + lrScore + graScore + pScore) / 4).toFixed(1);

    return {
        overallBand,
        transcript: cleanTranscript,
        criteria: {
            fc: { 
                score: Math.round(fcScore * 2) / 2, 
                feedback: fcScore > 7 ? "Fluid and coherent." : "Noticeable hesitation.",
                wpm,
                fillers
            },
            lr: { 
                score: Math.round(lrScore * 2) / 2, 
                feedback: usedAdvanced.length > 3 ? "Wide range of vocabulary." : "Limited lexical resource.",
                advancedWordsUsed: [...new Set(usedAdvanced)],
                repeatedWords: repeated
            },
            gra: { 
                score: Math.round(graScore * 2) / 2, 
                feedback: foundStructures.length > 2 ? "Complex structures used effectively." : "Simple sentence structures dominant.",
                complexStructures: foundStructures
            },
            p: { 
                score: Math.round(pScore * 2) / 2, 
                feedback: "Estimated based on fluency metrics."
            }
        },
        mistakes
    };
};