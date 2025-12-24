
// The "Brain" of the offline examiner.
// Based on official band descriptors for FC, LR, GRA, and P.
// FULLY OFFLINE. NO AI. STATIC ALGORITHMS.

export interface FeedbackResult {
    overallBand: string;
    transcript: string;
    criteria: {
        fc: { score: number; feedback: string; wpm: number; fillers: number };
        lr: { score: number; feedback: string; advancedWordsUsed: string[]; topicWordsUsed: string[]; repeatedWords: string[] };
        gra: { score: number; feedback: string; complexStructures: string[] };
        p: { score: number; feedback: string };
    };
    mistakes: { text: string; issue: string; type: 'grammar' | 'vocab' | 'fluency' }[];
}

// 1. TOPIC SPECIFIC DICTIONARY (The "Knowledge Base")
const TOPIC_VOCAB: Record<string, string[]> = {
    'Hometown': ['historic', 'district', 'landmark', 'skyscraper', 'contrast', 'infrastructure', 'bustling', 'serene', 'suburb', 'metropolis', 'commute', 'heritage', 'renovation', 'pedestrian'],
    'Mirrors': ['reflection', 'appearance', 'grooming', 'vain', 'vanity', 'functionality', 'confidence', 'image', 'distorted', 'perceive', 'aesthetic', 'scrutinize'],
    'Sitting': ['sedentary', 'lifestyle', 'posture', 'stationary', 'stiffness', 'active', 'ergonomic', 'circulation', 'lethargic', 'inactivity', 'prolonged'],
    'Work/Studies': ['deadline', 'simultaneously', 'demanding', 'prioritize', 'organizational', 'pressure', 'career', 'profession', 'curriculum', 'assignment', 'colleague', 'collaboration'],
    'Old Buildings': ['preserve', 'demolish', 'architectural', 'heritage', 'cultural', 'identity', 'restoration', 'maintenance', 'construct', 'modernization', 'facade'],
    'Coffee & Tea': ['enthusiast', 'caffeine', 'boost', 'productivity', 'aroma', 'ritual', 'brew', 'stimulant', 'beverage', 'consumption', 'habit', 'energize'],
    'Small Businesses': ['corporation', 'boutique', 'artisanal', 'unique', 'personalized', 'chain', 'franchise', 'entrepreneur', 'local', 'economy', 'customer', 'service'],
    'Making Lists': ['digital', 'synchronization', 'device', 'cloud', 'organize', 'memory', 'productive', 'schedule', 'checklist', 'reminder', 'efficiency', 'handwritten'],
    'Stories': ['captivated', 'narrate', 'imagination', 'language', 'folk', 'tale', 'plot', 'character', 'fictional', 'genre', 'moral', 'creativity'],
    'Machines': ['indispensable', 'equipment', 'multi-functional', 'facilitates', 'leisure', 'automation', 'device', 'appliance', 'technology', 'efficiency', 'mechanism']
};

// 2. UNIVERSAL ADVANCED VOCABULARY (Band 7+)
const ADVANCED_VOCAB = new Set([
    'captivating', 'stark', 'indispensable', 'facilitates', 'tangible', 'consequently', 'furthermore', 
    'nevertheless', 'predominantly', 'substantially', 'aesthetic', 'pragmatic', 'tedious', 'monotonous', 
    'invigorating', 'nostalgic', 'reminiscent', 'impeccable', 'meticulous', 'spontaneous', 'deliberate',
    'crucial', 'significant', 'aspect', 'perspective', 'notion', 'controversial', 'hypothesis', 
    'implementation', 'comprehensive', 'integration', 'phenomenon', 'unprecedented', 'ambiguous', 
    'arbitrary', 'coherent', 'exquisite', 'vibrant', 'bustling', 'harrowing', 'compelling', 'exhilarating', 
    'daunting', 'lucrative', 'detrimental', 'inevitable', 'fundamental'
]);

// 3. WEAK/OVERUSED WORDS (Band 4-5)
const BASIC_VOCAB = new Set([
    'good', 'bad', 'nice', 'happy', 'sad', 'big', 'small', 'thing', 'stuff', 'very', 'really', 'like', 'lot', 'lots', 'get', 'got'
]);

// 4. COMPLEX GRAMMAR PATTERNS (Regex)
const GRAMMAR_PATTERNS = [
    { name: 'Conditional (If/Unless)', regex: /\b(if|unless|provided that|as long as)\b/i },
    { name: 'Passive Voice', regex: /\b(is|are|was|were|been|be)\s+\w+(ed|en)\b/i },
    { name: 'Relative Clause', regex: /\b(which|who|that|where|whose)\b/i },
    { name: 'Perfect Tense', regex: /\b(have|has|had)\s+\w+(ed|en|ne)\b/i },
    { name: 'Concessive Clause', regex: /\b(although|even though|despite|in spite of|however)\b/i },
    { name: 'Cleft Sentence', regex: /\b(what\s+i\s+|it\s+is\s+|it\s+was\s+)/i }, 
    { name: 'Modal of Deduction', regex: /\b(must|might|could|may)\s+have\b/i },
    { name: 'Inversion', regex: /\b(never|rarely|seldom|little)\s+(do|did|have|has)\s+i\b/i },
    { name: 'Advanced Connectors', regex: /\b(moreover|furthermore|consequently|subsequently|nevertheless)\b/i }
];

// 5. COMMON GRAMMAR SLIPS
const GRAMMAR_ERRORS = [
    { regex: /\b(a)\s+[aeiou]/i, issue: "Incorrect article 'a' before vowel sound", fix: "an" },
    { regex: /\b(an)\s+[bcdfghjklmnpqrstvwxyz]/i, issue: "Incorrect article 'an' before consonant", fix: "a" },
    { regex: /\b(I|you|we|they)\s+is\b/i, issue: "Subject-verb agreement error", fix: "are/am" },
    { regex: /\b(he|she|it)\s+have\b/i, issue: "Subject-verb agreement error", fix: "has" },
    { regex: /\b(much)\s+(people|cars|books)\b/i, issue: "Quantifier error with countable noun", fix: "many" },
    { regex: /\b(less)\s+(people|cars|books)\b/i, issue: "Quantifier error with countable noun", fix: "fewer" },
    { regex: /\b(to)\s+\w+ing\b/i, issue: "Possible infinitive error", fix: "to + base verb" }
];

export const analyzeSpeech = (transcript: string, durationSeconds: number, currentTopic: string): FeedbackResult => {
    // Basic cleanup
    const cleanTranscript = transcript.trim();
    const lowerTranscript = cleanTranscript.toLowerCase();
    const words = lowerTranscript.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const wpm = Math.round((wordCount / (durationSeconds || 1)) * 60);

    const mistakes: { text: string; issue: string; type: 'grammar' | 'vocab' | 'fluency' }[] = [];

    // --- 1. FLUENCY & COHERENCE (FC) ---
    let fcScore = 5.0;
    const fillers = words.filter(w => ['um', 'uh', 'ah', 'like', 'you know', 'sort of', 'kind of'].includes(w)).length;
    
    // WPM Scoring
    if (wpm > 140) fcScore += 2.5; 
    else if (wpm > 120) fcScore += 2.0;
    else if (wpm > 100) fcScore += 1.5;
    else if (wpm > 80) fcScore += 0.5;
    
    // Penalty for fillers
    const fillerRatio = fillers / wordCount;
    if (fillerRatio > 0.15) fcScore -= 2.0; 
    else if (fillerRatio > 0.10) fcScore -= 1.0;
    else if (fillerRatio > 0.05) fcScore -= 0.5;

    // Sentence length variance (simple proxy for coherence/flow)
    const sentences = cleanTranscript.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = wordCount / (sentences.length || 1);
    if (avgSentenceLength > 15) fcScore += 0.5; // Good flow

    fcScore = Math.min(9, Math.max(3, fcScore));

    // --- 2. LEXICAL RESOURCE (LR) ---
    let lrScore = 5.0;
    const usedAdvanced = words.filter(w => ADVANCED_VOCAB.has(w));
    const usedBasic = words.filter(w => BASIC_VOCAB.has(w));
    
    // Topic Specific Check
    const topicKeywords = TOPIC_VOCAB[currentTopic] || [];
    const usedTopicWords = words.filter(w => topicKeywords.some(k => w.includes(k))); // Partial match for plurals

    if (usedAdvanced.length > 5) lrScore += 2.0;
    else if (usedAdvanced.length > 2) lrScore += 1.0;
    
    if (usedTopicWords.length > 3) lrScore += 1.0; // Bonus for relevance
    else if (usedTopicWords.length > 1) lrScore += 0.5;

    if (usedBasic.length > 10) lrScore -= 1.0;

    // Repetition Check
    const wordFreq: Record<string, number> = {};
    words.forEach(w => { if(w.length > 4) wordFreq[w] = (wordFreq[w] || 0) + 1; });
    const repeated = Object.keys(wordFreq).filter(w => wordFreq[w] > 2);
    if (repeated.length > 2) lrScore -= 0.5;

    lrScore = Math.min(9, Math.max(3, lrScore));

    // --- 3. GRAMMATICAL RANGE & ACCURACY (GRA) ---
    let graScore = 5.0;
    const foundStructures = new Set<string>();
    
    GRAMMAR_PATTERNS.forEach(p => {
        if (p.regex.test(transcript)) {
            foundStructures.add(p.name);
        }
    });
    
    const structureCount = foundStructures.size;
    
    // Check specific errors
    GRAMMAR_ERRORS.forEach(err => {
        const match = transcript.match(err.regex);
        if (match) {
            // Filter false positives for "to + ing" like "look forward to meeting"
            if (err.regex.source.includes("ing")) {
                if (!match[0].includes("look forward to") && !match[0].includes("committed to") && !match[0].includes("object to")) {
                     mistakes.push({ text: match[0], issue: err.issue, type: 'grammar' });
                     graScore -= 0.5;
                }
            } else {
                mistakes.push({ text: match[0], issue: `${err.issue}. Try '${err.fix}'.`, type: 'grammar' });
                graScore -= 0.5;
            }
        }
    });

    if (structureCount >= 6) graScore += 3.0;
    else if (structureCount >= 4) graScore += 2.0;
    else if (structureCount >= 2) graScore += 1.0;

    graScore = Math.min(9, Math.max(3, graScore));

    // --- 4. PRONUNCIATION (P) ---
    // Heuristics:
    // 1. Fluidity (WPM)
    // 2. Lack of short, choppy sentences (Sentence Length)
    // 3. Complexity (Longer words often imply better articulation effort)
    const avgWordLen = cleanTranscript.length / (words.length || 1);
    
    let pScore = 5.0;
    if (wpm > 110) pScore += 1.5;
    if (avgWordLen > 5) pScore += 1.0;
    if (fcScore > 7) pScore += 1.0; // Correlation
    
    pScore = Math.min(9, Math.max(3, pScore));


    // --- FEEDBACK GENERATION ---
    const overallBand = ((fcScore + lrScore + graScore + pScore) / 4).toFixed(1);

    // Populate mistakes list further
    if (fillerRatio > 0.08) {
        mistakes.push({ text: "Hesitation", issue: "Try to pause silently instead of saying 'um' or 'uh'.", type: 'fluency' });
    }
    if (wpm < 90) {
        mistakes.push({ text: "Slow Pace", issue: "Try to speak more fluidly. Connect your ideas.", type: 'fluency' });
    }
    usedBasic.forEach(word => {
        if (!mistakes.some(m => m.text === word) && mistakes.length < 10) {
             mistakes.push({ text: word, issue: "Basic word. Try a more precise synonym.", type: 'vocab' });
        }
    });
    if (usedTopicWords.length === 0) {
        mistakes.push({ text: "Relevance", issue: `No specific vocabulary detected for '${currentTopic}'.`, type: 'vocab' });
    }

    return {
        overallBand,
        transcript: cleanTranscript,
        criteria: {
            fc: { 
                score: Math.round(fcScore * 2) / 2, 
                feedback: wpm > 120 ? "Excellent natural flow." : "Good, but try to minimize hesitation.",
                wpm,
                fillers
            },
            lr: { 
                score: Math.round(lrScore * 2) / 2, 
                feedback: usedTopicWords.length > 0 ? `Great use of "${currentTopic}" vocabulary.` : "Vocabulary is generic. Be more specific.",
                advancedWordsUsed: [...new Set(usedAdvanced)],
                topicWordsUsed: [...new Set(usedTopicWords)],
                repeatedWords: repeated
            },
            gra: { 
                score: Math.round(graScore * 2) / 2, 
                feedback: structureCount > 4 ? "Impressive grammatical variety." : "Try using more complex sentence structures.",
                complexStructures: Array.from(foundStructures)
            },
            p: { 
                score: Math.round(pScore * 2) / 2, 
                feedback: "Clarity estimated from fluency and flow."
            }
        },
        mistakes: mistakes.slice(0, 8) // Cap mistakes to avoid overwhelming
    };
};
