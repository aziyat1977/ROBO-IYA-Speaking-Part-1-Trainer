
// Utility to calculate similarity between two strings (0-100%)
// Enhanced with Phonetic Approximation and Levenshtein Distance

// simplified Metaphone-like generator
const getPhoneticCode = (word: string): string => {
    if (!word) return '';
    let code = word.toLowerCase().trim();
    
    // Transliterations for common sounds
    code = code.replace(/^kn/, 'n');
    code = code.replace(/^pn/, 'n');
    code = code.replace(/^wr/, 'r');
    code = code.replace(/ph/g, 'f');
    code = code.replace(/gh/g, 'f'); 
    code = code.replace(/th/g, '0'); // 0 represents 'th'
    code = code.replace(/sh/g, 'x'); // x represents 'sh'
    code = code.replace(/ch/g, 'x');
    code = code.replace(/ck/g, 'k');
    code = code.replace(/c/g, 'k');
    code = code.replace(/z/g, 's');
    code = code.replace(/q/g, 'k');
    
    // Remove vowels inside (keep first letter)
    if (code.length > 1) {
        const first = code.charAt(0);
        const rest = code.slice(1).replace(/[aeiouy]/g, '');
        code = first + rest;
    }
    
    // Remove duplicate adjacent consonants
    code = code.replace(/(.)\1+/g, '$1');

    return code;
};

// Levenshtein distance
const stringDistance = (a: string, b: string): number => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
                );
            }
        }
    }
    return matrix[b.length][a.length];
};

// Core matching logic
// Returns an array of booleans indicating if each word in target was found in input sequence
export const getWordMatchStatus = (target: string, input: string): boolean[] => {
    if (!target) return [];
    if (!input) return target.trim().split(/\s+/).map(() => false);

    const clean = (s: string) => s.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const tWords = clean(target).split(/\s+/).filter(w => w.length > 0);
    const iWords = clean(input).split(/\s+/).filter(w => w.length > 0);

    const results: boolean[] = new Array(tWords.length).fill(false);
    let inputIndex = 0;

    for (let t = 0; t < tWords.length; t++) {
        const targetWord = tWords[t];
        let matchFound = false;
        let bestMatchIndex = -1;

        // Search window: Look ahead up to 6 words
        const horizon = 6;
        
        for (let offset = 0; offset < horizon; offset++) {
            const currentInputIdx = inputIndex + offset;
            if (currentInputIdx >= iWords.length) break;

            const inputWord = iWords[currentInputIdx];

            // 1. Exact Match
            if (targetWord === inputWord) {
                matchFound = true;
                bestMatchIndex = currentInputIdx;
                break; 
            }

            // 2. Phonetic Match
            if (getPhoneticCode(targetWord) === getPhoneticCode(inputWord)) {
                 matchFound = true;
                 bestMatchIndex = currentInputIdx;
                 break;
            }

            // 3. Fuzzy Match (Levenshtein)
            const dist = stringDistance(targetWord, inputWord);
            const tolerance = targetWord.length > 5 ? 2 : 1;
            if (targetWord.length > 3 && dist <= tolerance) {
                matchFound = true;
                bestMatchIndex = currentInputIdx;
                break;
            }
        }

        if (matchFound) {
            results[t] = true;
            inputIndex = bestMatchIndex + 1; // Advance past this match
        }
    }

    return results;
};

export const calculateSimilarity = (target: string, input: string): number => {
    const matches = getWordMatchStatus(target, input);
    if (matches.length === 0) return 0;
    
    const matchCount = matches.filter(m => m).length;
    return Math.round((matchCount / matches.length) * 100);
};
