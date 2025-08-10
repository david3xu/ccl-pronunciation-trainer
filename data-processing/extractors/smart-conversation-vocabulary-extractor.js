#!/usr/bin/env node

/**
 * Smart Conversation Vocabulary Extractor
 * Uses intelligent quality analysis to generate high-quality CCL vocabulary
 */

const fs = require('fs');
const path = require('path');
const TermQualityAnalyzer = require('../utils/term-quality-analyzer');

class SmartConversationVocabularyExtractor {
    constructor() {
        this.qualityAnalyzer = new TermQualityAnalyzer();
        this.config = {
            minWordFrequency: 3,
            minPhraseFrequency: 2,
            minQualityScore: 3.5,  // Lowered threshold for better term inclusion
            maxTermsPerCategory: 200,
            targetCategories: ['business', 'medical', 'legal', 'education', 'social-welfare', 'housing', 'immigration', 'general']
        };
        
        // Filter out conversation metadata patterns
        this.metadataPatterns = [
            /briefing.*following/i,
            /following.*dialogue/i,
            /dialogue.*starts/i,
            /takes place between/i,
            /- (legal|medical|business|immigration|education) briefing/i
        ];
        this.stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    }

    async extractSmartVocabulary() {
        console.log('🧠 Starting SMART conversation vocabulary extraction...');
        
        // Step 1: Load conversation data
        const conversationData = this.loadConversationData();
        console.log(`📚 Loaded ${conversationData.conversations.length} conversations`);
        
        // Step 2: Extract candidate terms with context
        const candidateTerms = this.extractCandidateTerms(conversationData);
        console.log(`🔍 Found ${candidateTerms.length} candidate terms`);
        
        // Step 3: Apply intelligent quality scoring
        const scoredTerms = this.applyIntelligentScoring(candidateTerms);
        console.log(`⭐ Scored all terms using multi-factor analysis`);
        
        // Step 4: Select highest quality terms per category
        const smartVocabulary = this.selectSmartVocabulary(scoredTerms);
        console.log(`✨ Selected high-quality terms for each category`);
        
        // Step 5: Generate final vocabulary data
        const vocabularyData = this.generateVocabularyData(smartVocabulary);
        
        // Step 6: Save results
        this.saveVocabularyData(vocabularyData);
        this.generateQualityReport(scoredTerms, smartVocabulary);
        
        console.log('🎯 Smart vocabulary extraction completed!');
        return vocabularyData;
    }
    
    loadConversationData() {
        const conversationDataPath = path.join(__dirname, '../../data/generated/conversation-data.js');
        if (!fs.existsSync(conversationDataPath)) {
            throw new Error('Conversation data not found. Run extract-conversations.js first.');
        }
        
        // Create mock window for Node.js
        global.window = {};
        eval(fs.readFileSync(conversationDataPath, 'utf8'));
        return global.window.conversationData;
    }
    
    extractCandidateTerms(conversationData) {
        const termMap = new Map();
        let totalSentences = 0;
        
        conversationData.conversations.forEach(conv => {
            if (conv.dialogues && Array.isArray(conv.dialogues)) {
                conv.dialogues.forEach(dialogue => {
                    totalSentences++;
                    const domain = this.classifyDomain(conv.title, dialogue.english);
                    
                    // Extract words and phrases from English dialogue
                    this.extractWordsFromSentence(dialogue.english, termMap, {
                        conversationId: conv.id,
                        conversationTitle: conv.title,
                        domain: domain,
                        fullSentence: dialogue.english
                    });
                    
                    this.extractPhrasesFromSentence(dialogue.english, termMap, {
                        conversationId: conv.id,
                        conversationTitle: conv.title,
                        domain: domain,
                        fullSentence: dialogue.english
                    });
                });
            }
        });
        
        console.log(`📊 Analyzed ${totalSentences} sentences`);
        
        // Convert to array and filter by frequency
        return Array.from(termMap.values()).filter(term => {
            if (term.type === 'word') return term.frequency >= this.config.minWordFrequency;
            if (term.type === 'phrase') return term.frequency >= this.config.minPhraseFrequency;
            return false;
        });
    }
    
    extractWordsFromSentence(sentence, termMap, context) {
        const words = sentence.toLowerCase()
            .replace(/[^\w\s'-]/g, ' ')
            .split(/\s+/)
            .filter(word => 
                word.length >= 3 && 
                word.length <= 20 && 
                !this.stopWords.has(word) &&
                /^[a-z]/.test(word)
            );
            
        words.forEach(word => {
            const key = `word:${word}`;
            if (!termMap.has(key)) {
                termMap.set(key, {
                    english: word,
                    frequency: 0,
                    type: 'word',
                    domains: new Set(),
                    examples: []
                });
            }
            
            const term = termMap.get(key);
            term.frequency++;
            term.domains.add(context.domain);
            if (term.examples.length < 10) {
                term.examples.push({
                    text: context.fullSentence,
                    conversationId: context.conversationId,
                    conversationTitle: context.conversationTitle,
                    domain: context.domain
                });
            }
        });
    }
    
    extractPhrasesFromSentence(sentence, termMap, context) {
        const words = sentence.toLowerCase()
            .replace(/[^\w\s'-]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 0);
            
        // Extract 2-4 word phrases
        for (let len = 2; len <= 4; len++) {
            for (let i = 0; i <= words.length - len; i++) {
                const phrase = words.slice(i, i + len).join(' ');
                
                if (this.isValidPhrase(phrase)) {
                    const key = `phrase:${phrase}`;
                    if (!termMap.has(key)) {
                        termMap.set(key, {
                            english: phrase,
                            frequency: 0,
                            type: 'phrase',
                            domains: new Set(),
                            examples: []
                        });
                    }
                    
                    const term = termMap.get(key);
                    term.frequency++;
                    term.domains.add(context.domain);
                    if (term.examples.length < 10) {
                        term.examples.push({
                            text: context.fullSentence,
                            conversationId: context.conversationId,
                            conversationTitle: context.conversationTitle,
                            domain: context.domain
                        });
                    }
                }
            }
        }
    }
    
    isValidPhrase(phrase) {
        // Filter out conversation metadata patterns
        if (this.metadataPatterns.some(pattern => pattern.test(phrase))) return false;
        
        // Must not be all stop words
        const words = phrase.split(' ');
        if (words.every(word => this.stopWords.has(word))) return false;
        
        // Must contain at least one meaningful word
        if (!words.some(word => word.length >= 4)) return false;
        
        // Must not start or end with stop words
        if (this.stopWords.has(words[0]) || this.stopWords.has(words[words.length - 1])) return false;
        
        return true;
    }
    
    applyIntelligentScoring(candidateTerms) {
        console.log('🧮 Applying intelligent quality scoring...');
        
        const totalFrequency = candidateTerms.reduce((sum, term) => sum + term.frequency, 0);
        
        return candidateTerms.map(term => {
            // Convert Set to Array for domains
            term.domains = Array.from(term.domains);
            
            // Calculate quality score
            const qualityAnalysis = this.qualityAnalyzer.calculateQualityScore(term, {
                totalFrequency: totalFrequency
            });
            
            return {
                ...term,
                qualityScore: qualityAnalysis.score,
                qualityFactors: qualityAnalysis.factors,
                recommendation: qualityAnalysis.recommendation
            };
        }).sort((a, b) => b.qualityScore - a.qualityScore);
    }
    
    selectSmartVocabulary(scoredTerms) {
        console.log('🎯 Selecting highest quality terms per category...');
        
        const vocabulary = {};
        this.config.targetCategories.forEach(category => {
            vocabulary[category] = [];
        });
        
        // Filter by quality threshold first
        const qualityTerms = scoredTerms.filter(term => term.qualityScore >= this.config.minQualityScore);
        console.log(`✅ ${qualityTerms.length}/${scoredTerms.length} terms passed quality threshold (${this.config.minQualityScore})`);
        
        // Distribute terms to categories based on their primary domain
        qualityTerms.forEach(term => {
            const primaryDomain = this.getPrimaryDomain(term.domains);
            if (vocabulary[primaryDomain] && vocabulary[primaryDomain].length < this.config.maxTermsPerCategory) {
                vocabulary[primaryDomain].push({
                    english: this.formatTerm(term.english),
                    frequency: term.frequency,
                    type: term.type,
                    domains: term.domains,
                    primaryDomain: primaryDomain,
                    difficulty: this.calculateDifficulty(term),
                    qualityScore: term.qualityScore,
                    examples: term.examples,
                    isCCLSpecific: term.qualityScore >= 6
                });
            }
        });
        
        // Fill remaining slots with next best terms
        this.balanceCategories(vocabulary, qualityTerms);
        
        return vocabulary;
    }
    
    getPrimaryDomain(domains) {
        if (domains.includes('business')) return 'business';
        if (domains.includes('medical')) return 'medical';
        if (domains.includes('legal')) return 'legal';
        if (domains.includes('education')) return 'education';
        if (domains.includes('social-welfare')) return 'social-welfare';
        if (domains.includes('housing')) return 'housing';
        if (domains.includes('immigration')) return 'immigration';
        return 'general';
    }
    
    balanceCategories(vocabulary, qualityTerms) {
        // Ensure each category has sufficient terms
        this.config.targetCategories.forEach(category => {
            while (vocabulary[category].length < this.config.maxTermsPerCategory && qualityTerms.length > 0) {
                // Find best remaining term that could fit this category
                const termIndex = qualityTerms.findIndex(term => 
                    term.domains.includes(category) &&
                    !Object.values(vocabulary).flat().some(v => v.english === term.english)
                );
                
                if (termIndex !== -1) {
                    const term = qualityTerms.splice(termIndex, 1)[0];
                    vocabulary[category].push({
                        english: this.formatTerm(term.english),
                        frequency: term.frequency,
                        type: term.type,
                        domains: term.domains,
                        primaryDomain: category,
                        difficulty: this.calculateDifficulty(term),
                        qualityScore: term.qualityScore,
                        examples: term.examples,
                        isCCLSpecific: term.qualityScore >= 6
                    });
                } else {
                    break;
                }
            }
        });
    }
    
    formatTerm(term) {
        return term.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    
    calculateDifficulty(term) {
        // Base on quality score and complexity
        if (term.qualityScore >= 8) return 'hard';
        if (term.qualityScore >= 6) return 'normal';  
        return 'easy';
    }
    
    classifyDomain(title, sentence) {
        const text = (title + ' ' + sentence).toLowerCase();
        
        if (/\b(business|company|finance|bank|investment|insurance|tax|trade|commercial)\b/i.test(text)) return 'business';
        if (/\b(medical|health|doctor|hospital|medicare|treatment|prescription|patient)\b/i.test(text)) return 'medical';
        if (/\b(legal|court|law|judge|lawyer|tribunal|police|crime|justice)\b/i.test(text)) return 'legal';
        if (/\b(school|education|student|teacher|university|course|study|learn)\b/i.test(text)) return 'education';
        if (/\b(welfare|centrelink|pension|benefit|support|disability|payment)\b/i.test(text)) return 'social-welfare';
        if (/\b(house|housing|rent|lease|property|real estate|accommodation)\b/i.test(text)) return 'housing';
        if (/\b(immigration|visa|citizen|residency|passport|border|migrant)\b/i.test(text)) return 'immigration';
        
        return 'general';
    }
    
    generateVocabularyData(smartVocabulary) {
        const stats = this.calculateStats(smartVocabulary);
        
        return {
            generatedAt: new Date().toISOString(),
            source: 'smart_conversation_extraction',
            extractionMethod: 'intelligent_quality_analysis',
            qualityThreshold: this.config.minQualityScore,
            totalTerms: stats.totalTerms,
            extractionConfig: this.config,
            statistics: stats,
            vocabulary: smartVocabulary
        };
    }
    
    calculateStats(vocabulary) {
        let totalTerms = 0;
        const difficultyDist = { easy: 0, normal: 0, hard: 0 };
        const typeDist = { word: 0, phrase: 0 };
        const domainDist = {};
        const qualityDist = {};
        let totalQualityScore = 0;
        let cclSpecificCount = 0;
        
        Object.keys(vocabulary).forEach(category => {
            domainDist[category] = vocabulary[category].length;
            vocabulary[category].forEach(term => {
                totalTerms++;
                difficultyDist[term.difficulty]++;
                typeDist[term.type]++;
                
                const qualityBand = Math.floor(term.qualityScore);
                qualityDist[qualityBand] = (qualityDist[qualityBand] || 0) + 1;
                totalQualityScore += term.qualityScore;
                
                if (term.isCCLSpecific) cclSpecificCount++;
            });
        });
        
        return {
            totalTerms,
            domainDistribution: domainDist,
            difficultyDistribution: difficultyDist,
            typeDistribution: typeDist,
            qualityDistribution: qualityDist,
            averageQualityScore: (totalQualityScore / totalTerms).toFixed(2),
            cclSpecificTerms: cclSpecificCount,
            cclSpecificPercentage: ((cclSpecificCount / totalTerms) * 100).toFixed(1),
            averageExamplesPerTerm: Object.values(vocabulary)
                .flat()
                .reduce((sum, term) => sum + term.examples.length, 0) / totalTerms
        };
    }
    
    saveVocabularyData(vocabularyData) {
        // Save JavaScript file for browser
        const jsContent = `// Smart Conversation-Based CCL Vocabulary Data
// Generated: ${vocabularyData.generatedAt}
// Method: ${vocabularyData.extractionMethod}
// Quality Threshold: ${vocabularyData.qualityThreshold}
// Average Quality Score: ${vocabularyData.statistics.averageQualityScore}
// CCL-Specific Terms: ${vocabularyData.statistics.cclSpecificPercentage}%

window.conversationVocabularyData = ${JSON.stringify(vocabularyData, null, 2)};`;
        
        const jsPath = path.join(__dirname, '../../data/generated/conversation-vocabulary-data.js');
        fs.writeFileSync(jsPath, jsContent);
        
        // Save JSON file for analysis
        const jsonPath = path.join(__dirname, '../../data/generated/conversation-vocabulary-data.json');
        fs.writeFileSync(jsonPath, JSON.stringify(vocabularyData, null, 2));
        
        console.log(`💾 Saved smart vocabulary data:`);
        console.log(`   📄 ${jsPath}`);
        console.log(`   📊 ${jsonPath}`);
    }
    
    generateQualityReport(scoredTerms, selectedVocabulary) {
        const report = {
            generatedAt: new Date().toISOString(),
            extractionMethod: 'smart_quality_analysis',
            qualityThreshold: this.config.minQualityScore,
            totalCandidates: scoredTerms.length,
            selectedTerms: Object.values(selectedVocabulary).flat().length,
            qualityAnalysis: this.qualityAnalyzer.analyzeVocabularySet(selectedVocabulary),
            topQualityTerms: scoredTerms.slice(0, 100).map(t => ({
                english: t.english,
                qualityScore: t.qualityScore,
                recommendation: t.recommendation,
                factors: t.qualityFactors
            })),
            rejectedTerms: scoredTerms.filter(t => t.qualityScore < this.config.minQualityScore)
                .slice(0, 100)
                .map(t => ({
                    english: t.english,
                    qualityScore: t.qualityScore,
                    recommendation: t.recommendation,
                    whyRejected: t.qualityScore < this.config.minQualityScore ? 'Below quality threshold' : 'Other'
                }))
        };
        
        const reportPath = path.join(__dirname, '../../reports/smart-vocabulary-quality-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        // Generate markdown summary
        this.generateQualityReportMarkdown(report);
        
        console.log(`📋 Quality report saved: ${reportPath}`);
    }
    
    generateQualityReportMarkdown(report) {
        const md = `# Smart Vocabulary Quality Report

**Generated:** ${report.generatedAt}
**Method:** Intelligent Quality Analysis  
**Quality Threshold:** ${report.qualityThreshold}

## Summary

- **Total Candidates:** ${report.totalCandidates.toLocaleString()}
- **Selected Terms:** ${report.selectedTerms.toLocaleString()}
- **Selection Rate:** ${(report.selectedTerms/report.totalCandidates*100).toFixed(1)}%

## Quality Analysis

${report.qualityAnalysis.recommendations.map(r => `- ${r}`).join('\n')}

## Quality Distribution

${Object.entries(report.qualityAnalysis.qualityDistribution)
    .sort(([a], [b]) => b - a)
    .map(([score, count]) => `- **Score ${score}:** ${count} terms`)
    .join('\n')}

## Top 20 Highest Quality Terms

${report.topQualityTerms.slice(0, 20).map((term, i) => 
    `${i+1}. **${term.english}** (${term.qualityScore.toFixed(2)}) - ${term.recommendation}`
).join('\n')}

## Sample Rejected Terms

${report.rejectedTerms.slice(0, 20).map((term, i) =>
    `${i+1}. "${term.english}" (${term.qualityScore.toFixed(2)}) - ${term.recommendation}`
).join('\n')}

---
*Generated by Smart Conversation Vocabulary Extractor*`;
        
        const mdPath = path.join(__dirname, '../../reports/smart-vocabulary-quality-report.md');
        fs.writeFileSync(mdPath, md);
    }
}

// Run extraction if called directly
if (require.main === module) {
    const extractor = new SmartConversationVocabularyExtractor();
    extractor.extractSmartVocabulary().catch(console.error);
}

module.exports = SmartConversationVocabularyExtractor;