/**
 * Advanced vocabulary-conversation matcher with multiple strategies
 */

const TextUtils = require('../utils/text-utils');
const matchingConfig = require('../config/matching-config');

class VocabularyMatcher {
    constructor() {
        this.strategies = matchingConfig.strategies;
        this.matches = [];
        this.stats = {
            totalTerms: 0,
            totalSentences: 0,
            matchesByStrategy: {},
            processingTime: 0
        };
    }

    /**
     * Find matches between vocabulary terms and conversation sentences
     */
    findMatches(vocabularyTerms, conversationSentences) {
        console.log('🔍 Starting advanced vocabulary-conversation matching...');
        const startTime = Date.now();
        
        this.stats.totalTerms = vocabularyTerms.length;
        this.stats.totalSentences = conversationSentences.length;
        
        // Initialize strategy stats
        Object.keys(this.strategies).forEach(strategy => {
            this.stats.matchesByStrategy[strategy] = 0;
        });
        
        vocabularyTerms.forEach((term, termIndex) => {
            if (termIndex % 100 === 0) {
                console.log(`   Processing term ${termIndex + 1}/${vocabularyTerms.length}...`);
            }
            
            conversationSentences.forEach((sentence, sentenceIndex) => {
                const matches = this.matchTermWithSentence(term, sentence);
                matches.forEach(match => {
                    this.matches.push({
                        ...match,
                        termIndex,
                        sentenceIndex
                    });
                    this.stats.matchesByStrategy[match.strategy]++;
                });
            });
        });
        
        this.stats.processingTime = Date.now() - startTime;
        
        // Sort matches by confidence (highest first)
        this.matches.sort((a, b) => b.confidence - a.confidence);
        
        // Limit matches per term to avoid noise
        this.matches = this.limitMatchesPerTerm();
        
        console.log(`✅ Found ${this.matches.length} matches in ${this.stats.processingTime}ms`);
        return this.matches;
    }

    /**
     * Match a single term with a single sentence using multiple strategies
     */
    matchTermWithSentence(term, sentence) {
        const matches = [];
        const termComponents = TextUtils.extractTermComponents(term.english);
        const sentenceText = TextUtils.normalize(sentence.english);
        
        // Strategy 1: Exact Phrase Match
        if (this.strategies.EXACT_PHRASE.enabled) {
            if (sentenceText.includes(termComponents.full)) {
                matches.push({
                    term,
                    sentence,
                    strategy: 'EXACT_PHRASE',
                    confidence: this.strategies.EXACT_PHRASE.weight,
                    matchDetails: {
                        type: 'exact',
                        matchedText: termComponents.full,
                        highlightedSentence: TextUtils.highlightMatches(sentence.english, [term.english])
                    }
                });
            }
        }

        // Strategy 2: Keyword Overlap
        if (this.strategies.KEYWORD_OVERLAP.enabled) {
            const sentenceKeywords = TextUtils.extractKeywords(sentence.english);
            const overlapRatio = TextUtils.calculateJaccardSimilarity(termComponents.keywords, sentenceKeywords);
            
            if (overlapRatio >= this.strategies.KEYWORD_OVERLAP.minKeywordRatio) {
                const matchedKeywords = termComponents.keywords.filter(kw => sentenceKeywords.includes(kw));
                matches.push({
                    term,
                    sentence,
                    strategy: 'KEYWORD_OVERLAP',
                    confidence: this.strategies.KEYWORD_OVERLAP.weight * overlapRatio,
                    matchDetails: {
                        type: 'keyword',
                        overlapRatio,
                        matchedKeywords,
                        totalKeywords: termComponents.keywords.length,
                        highlightedSentence: TextUtils.highlightMatches(sentence.english, matchedKeywords)
                    }
                });
            }
        }

        // Strategy 3: Partial Match
        if (this.strategies.PARTIAL_MATCH.enabled && matches.length === 0) {
            const sentenceKeywords = TextUtils.extractKeywords(sentence.english);
            const overlapRatio = TextUtils.calculateJaccardSimilarity(termComponents.keywords, sentenceKeywords);
            
            if (overlapRatio >= this.strategies.PARTIAL_MATCH.minKeywordRatio) {
                const matchedKeywords = termComponents.keywords.filter(kw => sentenceKeywords.includes(kw));
                matches.push({
                    term,
                    sentence,
                    strategy: 'PARTIAL_MATCH',
                    confidence: this.strategies.PARTIAL_MATCH.weight * overlapRatio,
                    matchDetails: {
                        type: 'partial',
                        overlapRatio,
                        matchedKeywords,
                        totalKeywords: termComponents.keywords.length,
                        highlightedSentence: TextUtils.highlightMatches(sentence.english, matchedKeywords)
                    }
                });
            }
        }

        // Strategy 4: Semantic Similarity (if enabled)
        if (this.strategies.SEMANTIC_SIMILARITY.enabled) {
            const semanticMatches = TextUtils.findSemanticMatches(term.english, sentence.english);
            if (semanticMatches.length > 0) {
                matches.push({
                    term,
                    sentence,
                    strategy: 'SEMANTIC_SIMILARITY',
                    confidence: this.strategies.SEMANTIC_SIMILARITY.weight,
                    matchDetails: {
                        type: 'semantic',
                        semanticMatches,
                        highlightedSentence: sentence.english
                    }
                });
            }
        }

        // Filter by minimum confidence
        return matches.filter(match => match.confidence >= matchingConfig.minMatchConfidence);
    }

    /**
     * Limit matches per term to avoid noise
     */
    limitMatchesPerTerm() {
        const matchesByTerm = {};
        
        this.matches.forEach(match => {
            const termKey = match.term.english;
            if (!matchesByTerm[termKey]) {
                matchesByTerm[termKey] = [];
            }
            matchesByTerm[termKey].push(match);
        });
        
        const limitedMatches = [];
        Object.values(matchesByTerm).forEach(termMatches => {
            // Sort by confidence and take top N
            termMatches.sort((a, b) => b.confidence - a.confidence);
            limitedMatches.push(...termMatches.slice(0, matchingConfig.maxMatchesPerTerm));
        });
        
        return limitedMatches;
    }

    /**
     * Get unique terms that have matches
     */
    getMatchedTerms() {
        const uniqueTerms = new Set();
        this.matches.forEach(match => {
            uniqueTerms.add(match.term.english);
        });
        return uniqueTerms;
    }

    /**
     * Get unique sentences that contain vocabulary
     */
    getMatchedSentences() {
        const uniqueSentences = new Set();
        this.matches.forEach(match => {
            uniqueSentences.add(match.sentence.english);
        });
        return uniqueSentences;
    }

    /**
     * Get statistics about matches
     */
    getStatistics() {
        const matchedTerms = this.getMatchedTerms();
        const matchedSentences = this.getMatchedSentences();
        
        return {
            ...this.stats,
            totalMatches: this.matches.length,
            uniqueMatchedTerms: matchedTerms.size,
            uniqueMatchedSentences: matchedSentences.size,
            coveragePercentage: Math.round((matchedTerms.size / this.stats.totalTerms) * 1000) / 10,
            sentenceUtilizationPercentage: Math.round((matchedSentences.size / this.stats.totalSentences) * 1000) / 10
        };
    }

    /**
     * Get matches grouped by category
     */
    getMatchesByCategory() {
        const categorizedMatches = {};
        
        this.matches.forEach(match => {
            const category = match.term.category;
            if (!categorizedMatches[category]) {
                categorizedMatches[category] = [];
            }
            categorizedMatches[category].push(match);
        });
        
        return categorizedMatches;
    }

    /**
     * Get best matches (highest confidence)
     */
    getBestMatches(count = 50) {
        return this.matches.slice(0, count);
    }
}

module.exports = VocabularyMatcher;