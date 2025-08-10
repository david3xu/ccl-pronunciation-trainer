/**
 * Text processing utilities for vocabulary-conversation matching
 */

const matchingConfig = require('../config/matching-config');

class TextUtils {
    /**
     * Normalize text for matching
     */
    static normalize(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
            .replace(/\s+/g, ' ') // Collapse multiple spaces
            .trim();
    }

    /**
     * Extract meaningful keywords from text
     */
    static extractKeywords(text) {
        const normalized = this.normalize(text);
        const words = normalized.split(' ').filter(word => 
            word.length > 2 && !matchingConfig.stopWords.has(word)
        );
        return [...new Set(words)]; // Remove duplicates
    }

    /**
     * Calculate keyword overlap ratio between two texts
     */
    static calculateKeywordOverlap(text1, text2) {
        const keywords1 = new Set(this.extractKeywords(text1));
        const keywords2 = new Set(this.extractKeywords(text2));
        
        if (keywords1.size === 0 && keywords2.size === 0) return 1;
        if (keywords1.size === 0 || keywords2.size === 0) return 0;
        
        const intersection = new Set([...keywords1].filter(x => keywords2.has(x)));
        const union = new Set([...keywords1, ...keywords2]);
        
        return intersection.size / union.size;
    }

    /**
     * Calculate Jaccard similarity for keyword sets
     */
    static calculateJaccardSimilarity(keywords1, keywords2) {
        const set1 = new Set(keywords1);
        const set2 = new Set(keywords2);
        
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        
        return union.size > 0 ? intersection.size / union.size : 0;
    }

    /**
     * Check if text contains semantic equivalents
     */
    static findSemanticMatches(termText, sentenceText) {
        const termKeywords = this.extractKeywords(termText);
        const sentenceKeywords = this.extractKeywords(sentenceText);
        const matches = [];
        
        termKeywords.forEach(termKeyword => {
            // Check direct mappings
            const mappings = matchingConfig.semanticMappings[termKeyword];
            if (mappings) {
                mappings.forEach(equivalent => {
                    if (sentenceKeywords.some(sk => sk.includes(equivalent) || equivalent.includes(sk))) {
                        matches.push({
                            termKeyword,
                            equivalent,
                            type: 'semantic'
                        });
                    }
                });
            }
            
            // Check reverse mappings
            sentenceKeywords.forEach(sentenceKeyword => {
                const reverseMappings = matchingConfig.semanticMappings[sentenceKeyword];
                if (reverseMappings && reverseMappings.includes(termKeyword)) {
                    matches.push({
                        termKeyword,
                        equivalent: sentenceKeyword,
                        type: 'semantic_reverse'
                    });
                }
            });
        });
        
        return matches;
    }

    /**
     * Highlight matched words in text
     */
    static highlightMatches(text, matchedWords) {
        let highlighted = text;
        matchedWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            highlighted = highlighted.replace(regex, `**${word}**`);
        });
        return highlighted;
    }

    /**
     * Clean and format term for display
     */
    static formatTerm(term) {
        return term.replace(/["""'']/g, '"').trim();
    }

    /**
     * Extract term components (useful for compound terms)
     */
    static extractTermComponents(term) {
        const normalized = this.normalize(term);
        const components = {
            full: normalized,
            keywords: this.extractKeywords(term),
            words: normalized.split(' ').filter(w => w.length > 0),
            length: normalized.split(' ').length
        };
        
        // Identify key components (non-stop words)
        components.keyComponents = components.words.filter(word => 
            !matchingConfig.stopWords.has(word) && word.length > 2
        );
        
        return components;
    }
}

module.exports = TextUtils;