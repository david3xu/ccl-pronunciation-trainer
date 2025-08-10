/**
 * Intelligent Term Quality Analyzer for CCL Vocabulary
 * Uses multiple scoring criteria to identify high-quality, CCL-relevant terms
 */

class TermQualityAnalyzer {
    constructor() {
        // CCL-specific domain indicators (weighted by importance)
        this.cclDomainIndicators = {
            // Government & Legal
            'government': 3.0, 'legal': 3.0, 'court': 3.0, 'tribunal': 3.0, 'legislation': 3.0,
            'immigration': 3.0, 'visa': 3.0, 'citizenship': 3.0, 'residency': 3.0,
            
            // Healthcare System
            'medicare': 3.0, 'hospital': 2.5, 'medical': 2.5, 'health': 2.0, 'doctor': 2.0,
            'appointment': 2.5, 'treatment': 2.5, 'prescription': 2.5,
            
            // Education System  
            'school': 2.5, 'university': 2.5, 'education': 2.5, 'student': 2.0, 'course': 2.5,
            'qualification': 3.0, 'certificate': 3.0, 'degree': 2.5,
            
            // Business & Finance
            'business': 2.0, 'finance': 2.5, 'bank': 2.5, 'loan': 2.5, 'tax': 2.5,
            'insurance': 2.5, 'investment': 2.5, 'superannuation': 3.0,
            
            // Social Services
            'welfare': 3.0, 'centrelink': 3.0, 'pension': 3.0, 'disability': 2.5,
            'support': 2.0, 'service': 2.0, 'benefit': 2.5,
            
            // Housing & Property
            'housing': 2.5, 'rent': 2.5, 'lease': 2.5, 'property': 2.5, 'mortgage': 2.5
        };
        
        // Australian-specific terms get higher scores
        this.australianIndicators = [
            'centrelink', 'medicare', 'atar', 'tafe', 'fairwork', 'accc', 'ato',
            'superannuation', 'tribunal', 'ombudsman', 'commonwealth', 'council'
        ];
        
        // Professional/formal language patterns
        this.professionalPatterns = [
            /\b(application|assessment|eligibility|documentation|procedure|regulation|compliance|authorization|notification|verification)\b/i,
            /\b(consultation|appointment|referral|evaluation|examination|investigation|recommendation)\b/i,
            /\b(certificate|qualification|accreditation|registration|license|permit)\b/i,
            /\b(tribunal|court|hearing|appeal|review|decision|ruling|judgment)\b/i
        ];
        
        // Common words that are rarely CCL-relevant (dynamic scoring)
        this.commonWordPenalty = 0.3;
    }
    
    /**
     * Calculate comprehensive quality score for a term
     */
    calculateQualityScore(term, contextData) {
        const { english, frequency, domains, examples, type } = term;
        let score = 0;
        let factors = [];
        
        // 1. CCL Domain Relevance (40% weight)
        const domainScore = this.calculateDomainRelevance(english, domains);
        score += domainScore * 0.4;
        factors.push(`Domain: ${domainScore.toFixed(2)}`);
        
        // 2. Professional Language Complexity (25% weight)  
        const complexityScore = this.calculateComplexity(english);
        score += complexityScore * 0.25;
        factors.push(`Complexity: ${complexityScore.toFixed(2)}`);
        
        // 3. Contextual Usage Quality (20% weight)
        const contextScore = this.calculateContextQuality(examples, english);
        score += contextScore * 0.2;
        factors.push(`Context: ${contextScore.toFixed(2)}`);
        
        // 4. Australian Specificity (10% weight)
        const australianScore = this.calculateAustralianRelevance(english);
        score += australianScore * 0.1;
        factors.push(`Australian: ${australianScore.toFixed(2)}`);
        
        // 5. Frequency Balance (5% weight) - not too common, not too rare
        const frequencyScore = this.calculateFrequencyBalance(frequency, contextData.totalFrequency);
        score += frequencyScore * 0.05;
        factors.push(`Frequency: ${frequencyScore.toFixed(2)}`);
        
        return {
            score: Math.max(0, Math.min(10, score)),
            factors: factors,
            recommendation: this.getRecommendation(score)
        };
    }
    
    /**
     * Calculate domain relevance based on CCL contexts
     */
    calculateDomainRelevance(english, domains) {
        const text = english.toLowerCase();
        let maxScore = 0;
        
        // Check for direct domain indicators
        for (const [indicator, weight] of Object.entries(this.cclDomainIndicators)) {
            if (text.includes(indicator)) {
                maxScore = Math.max(maxScore, weight);
            }
        }
        
        // Boost for multi-domain terms (useful across contexts)
        if (domains && domains.length > 3) {
            maxScore += 0.5;
        }
        
        // Penalty for very generic terms
        if (['your', 'this', 'that', 'there', 'here', 'when', 'where', 'what', 'how'].some(w => text === w)) {
            maxScore = 0;
        }
        
        return Math.min(10, maxScore);
    }
    
    /**
     * Calculate professional language complexity
     */
    calculateComplexity(english) {
        const text = english.toLowerCase();
        let score = 0;
        
        // Length-based complexity (professional terms are usually longer)
        if (english.length >= 8) score += 2;
        if (english.length >= 12) score += 1;
        if (english.length >= 16) score += 1;
        
        // Multi-word terms (phrases are often more professional)
        const wordCount = english.split(/\s+/).length;
        if (wordCount >= 2) score += 1.5;
        if (wordCount >= 3) score += 1;
        
        // Professional language patterns
        for (const pattern of this.professionalPatterns) {
            if (pattern.test(english)) {
                score += 2;
                break;
            }
        }
        
        // Technical suffixes/prefixes
        if (/\b\w+(tion|sion|ment|ance|ence|ity|ness|ship|hood)\b/i.test(text)) {
            score += 1;
        }
        
        // Penalty for very simple words
        if (text.length <= 3 && wordCount === 1) {
            score -= 2;
        }
        
        return Math.max(0, Math.min(10, score));
    }
    
    /**
     * Calculate context quality from conversation examples
     */
    calculateContextQuality(examples, english) {
        if (!examples || examples.length === 0) return 0;
        
        let score = 0;
        const sampleSize = Math.min(5, examples.length);
        
        for (let i = 0; i < sampleSize; i++) {
            const example = examples[i];
            const text = example.text || '';
            
            // Professional conversation context
            if (/\b(appointment|application|form|document|information|service|office|department)\b/i.test(text)) {
                score += 1;
            }
            
            // Question-answer patterns (typical CCL scenarios)
            if (text.includes('?') || /\b(what|how|when|where|can|could|would|should)\b/i.test(text)) {
                score += 0.5;
            }
            
            // Formal language indicators
            if (/\b(please|thank you|certainly|however|therefore|regarding|concerning)\b/i.test(text)) {
                score += 0.5;
            }
        }
        
        return Math.min(10, score);
    }
    
    /**
     * Calculate Australian-specific relevance
     */
    calculateAustralianRelevance(english) {
        const text = english.toLowerCase();
        let score = 0;
        
        // Direct Australian terms
        for (const indicator of this.australianIndicators) {
            if (text.includes(indicator)) {
                score += 3;
                break;
            }
        }
        
        // Australian spelling patterns
        if (/\w+our\b/.test(text)) score += 0.5; // colour, honour, etc.
        if (/\bcentre\b/.test(text)) score += 0.5; // centre vs center
        
        return Math.min(10, score);
    }
    
    /**
     * Calculate frequency balance (Goldilocks principle)
     */
    calculateFrequencyBalance(frequency, totalFrequency) {
        if (!frequency || !totalFrequency) return 5;
        
        const relativeFreq = frequency / totalFrequency;
        
        // Too common (likely basic words)
        if (relativeFreq > 0.01) return 2;
        
        // Too rare (might be errors/noise)
        if (relativeFreq < 0.0001) return 3;
        
        // Sweet spot for professional terms
        if (relativeFreq >= 0.001 && relativeFreq <= 0.005) return 8;
        if (relativeFreq >= 0.0005 && relativeFreq <= 0.01) return 6;
        
        return 5;
    }
    
    /**
     * Get recommendation based on score
     */
    getRecommendation(score) {
        if (score >= 7) return 'EXCELLENT - High CCL relevance';
        if (score >= 5.5) return 'GOOD - CCL relevant';  
        if (score >= 4) return 'MARGINAL - Consider context';
        if (score >= 2.5) return 'POOR - Low CCL value';
        return 'REJECT - Not suitable for CCL';
    }
    
    /**
     * Analyze entire vocabulary set and provide quality insights
     */
    analyzeVocabularySet(vocabularyData) {
        const results = {
            totalTerms: 0,
            qualityDistribution: {},
            topTerms: [],
            bottomTerms: [],
            recommendations: []
        };
        
        let allTerms = [];
        let totalFreq = 0;
        
        // Collect all terms and calculate total frequency
        Object.keys(vocabularyData).forEach(category => {
            vocabularyData[category].forEach(term => {
                totalFreq += term.frequency || 0;
                allTerms.push({...term, category});
            });
        });
        
        // Score all terms
        allTerms.forEach(term => {
            const quality = this.calculateQualityScore(term, {totalFrequency: totalFreq});
            term.qualityScore = quality.score;
            term.qualityFactors = quality.factors;
            term.recommendation = quality.recommendation;
        });
        
        // Sort by quality
        allTerms.sort((a, b) => b.qualityScore - a.qualityScore);
        
        results.totalTerms = allTerms.length;
        results.topTerms = allTerms.slice(0, 50);
        results.bottomTerms = allTerms.slice(-50);
        
        // Quality distribution
        allTerms.forEach(term => {
            const band = Math.floor(term.qualityScore);
            results.qualityDistribution[band] = (results.qualityDistribution[band] || 0) + 1;
        });
        
        // Generate recommendations
        const excellent = allTerms.filter(t => t.qualityScore >= 7).length;
        const good = allTerms.filter(t => t.qualityScore >= 5.5 && t.qualityScore < 7).length;
        const poor = allTerms.filter(t => t.qualityScore < 4).length;
        
        results.recommendations = [
            `${excellent} terms (${(excellent/allTerms.length*100).toFixed(1)}%) are EXCELLENT quality`,
            `${good} terms (${(good/allTerms.length*100).toFixed(1)}%) are GOOD quality`, 
            `${poor} terms (${(poor/allTerms.length*100).toFixed(1)}%) should be considered for removal`,
            `Recommend filtering threshold: ${poor > allTerms.length * 0.3 ? '4.0' : '3.0'} for optimal quality`
        ];
        
        return results;
    }
}

module.exports = TermQualityAnalyzer;