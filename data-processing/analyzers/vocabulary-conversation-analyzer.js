#!/usr/bin/env node

/**
 * Advanced Vocabulary-Conversation Analyzer
 * 
 * Analyzes overlap between vocabulary terms and conversation sentences
 * using multiple matching strategies and detailed reporting.
 */

const fs = require('fs');
const path = require('path');
const VocabularyMatcher = require('../matchers/vocabulary-matcher');
const TextUtils = require('../utils/text-utils');

class VocabularyConversationAnalyzer {
    constructor() {
        this.vocabularyData = null;
        this.conversationData = null;
        this.vocabTerms = [];
        this.conversationSentences = [];
        this.matcher = new VocabularyMatcher();
        this.results = null;
        
        // Paths
        this.basePath = path.join(__dirname, '../..');
        this.outputDir = path.join(this.basePath, 'reports');
        this.dataDir = path.join(this.basePath, 'data/generated');
        
        this.ensureDirectories();
    }
    
    ensureDirectories() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    /**
     * Run complete analysis
     */
    async analyze() {
        console.log('🚀 Starting Advanced Vocabulary-Conversation Analysis...\n');
        
        try {
            await this.loadData();
            await this.extractTermsAndSentences();
            await this.runMatching();
            await this.generateReports();
            
            console.log('\n✅ Advanced analysis completed successfully!');
            this.printSummary();
            
        } catch (error) {
            console.error('❌ Analysis failed:', error.message);
            throw error;
        }
    }

    /**
     * Load vocabulary and conversation data
     */
    async loadData() {
        console.log('📚 Loading vocabulary and conversation data...');
        
        // Load vocabulary data
        const vocabPath = path.join(this.dataDir, 'vocabulary-data.js');
        if (fs.existsSync(vocabPath)) {
            const vocabContent = fs.readFileSync(vocabPath, 'utf8');
            const dataMatch = vocabContent.match(/const vocabularyData = ({[\s\S]*?});/);
            if (dataMatch) {
                this.vocabularyData = eval('(' + dataMatch[1] + ')');
            }
        }
        
        // Load conversation data
        const convPath = path.join(this.dataDir, 'conversation-data.json');
        if (fs.existsSync(convPath)) {
            this.conversationData = JSON.parse(fs.readFileSync(convPath, 'utf8'));
        }
        
        if (!this.vocabularyData) {
            throw new Error('Vocabulary data not found. Run: npm run convert');
        }
        
        if (!this.conversationData) {
            throw new Error('Conversation data not found. Run: npm run extract-conversations');
        }
        
        console.log(`   ✓ Loaded ${Object.keys(this.vocabularyData).length} vocabulary categories`);
        console.log(`   ✓ Loaded ${this.conversationData.totalConversations} conversations`);
    }

    /**
     * Extract terms and sentences for analysis
     */
    async extractTermsAndSentences() {
        console.log('🔤 Extracting and preprocessing data...');
        
        // Extract all vocabulary terms
        Object.entries(this.vocabularyData).forEach(([categoryKey, words]) => {
            words.forEach(word => {
                this.vocabTerms.push({
                    english: TextUtils.formatTerm(word.english),
                    chinese: word.chinese,
                    category: categoryKey,
                    difficulty: word.difficulty,
                    type: word.type || 'unknown'
                });
            });
        });
        
        // Extract all conversation sentences
        this.conversationData.conversations.forEach(conversation => {
            conversation.dialogues.forEach((dialogue, dialogueIndex) => {
                this.conversationSentences.push({
                    english: dialogue.english,
                    chinese: dialogue.chinese,
                    conversationId: conversation.id,
                    conversationTitle: conversation.title,
                    domain: conversation.domainCategory,
                    difficulty: dialogue.difficulty,
                    dialogueNumber: dialogue.number || dialogueIndex + 1,
                    wordCount: dialogue.wordCount || dialogue.english.split(' ').length
                });
            });
        });
        
        console.log(`   ✓ Extracted ${this.vocabTerms.length} vocabulary terms`);
        console.log(`   ✓ Extracted ${this.conversationSentences.length} conversation sentences`);
    }

    /**
     * Run advanced matching analysis
     */
    async runMatching() {
        console.log('🎯 Running advanced matching analysis...');
        
        const matches = this.matcher.findMatches(this.vocabTerms, this.conversationSentences);
        this.results = {
            matches,
            statistics: this.matcher.getStatistics(),
            matchesByCategory: this.matcher.getMatchesByCategory(),
            bestMatches: this.matcher.getBestMatches(100),
            analysisDate: new Date().toISOString()
        };
        
        console.log(`   ✓ Generated ${this.results.matches.length} total matches`);
        console.log(`   ✓ Coverage: ${this.results.statistics.coveragePercentage}% of vocabulary terms`);
    }

    /**
     * Generate comprehensive reports
     */
    async generateReports() {
        console.log('📊 Generating comprehensive reports...');
        
        // Generate detailed JSON report
        const jsonReport = this.generateDetailedReport();
        const jsonPath = path.join(this.outputDir, 'advanced-vocabulary-analysis.json');
        fs.writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2));
        
        // Generate readable markdown report
        const markdownReport = this.generateMarkdownReport(jsonReport);
        const mdPath = path.join(this.outputDir, 'advanced-vocabulary-analysis.md');
        fs.writeFileSync(mdPath, markdownReport);
        
        // Generate CSV for spreadsheet analysis
        const csvReport = this.generateCSVReport();
        const csvPath = path.join(this.outputDir, 'vocabulary-matches.csv');
        fs.writeFileSync(csvPath, csvReport);
        
        console.log('   ✓ Generated detailed JSON report');
        console.log('   ✓ Generated readable markdown report');
        console.log('   ✓ Generated CSV export');
    }

    /**
     * Generate detailed JSON report
     */
    generateDetailedReport() {
        const stats = this.results.statistics;
        const matchesByCategory = {};
        const unmatchedTermsByCategory = {};
        
        // Calculate category-specific statistics
        Object.entries(this.vocabularyData).forEach(([categoryKey, words]) => {
            const categoryMatches = this.results.matches.filter(m => m.term.category === categoryKey);
            const uniqueMatchedTerms = new Set(categoryMatches.map(m => m.term.english));
            
            matchesByCategory[categoryKey] = {
                totalTerms: words.length,
                matchedTerms: uniqueMatchedTerms.size,
                totalMatches: categoryMatches.length,
                coveragePercentage: Math.round((uniqueMatchedTerms.size / words.length) * 1000) / 10,
                averageConfidence: categoryMatches.length > 0 ? 
                    Math.round(categoryMatches.reduce((sum, m) => sum + m.confidence, 0) / categoryMatches.length * 1000) / 10 : 0,
                strategiesUsed: this.getStrategiesUsedInCategory(categoryMatches)
            };
            
            // Find unmatched terms
            const matchedTermsSet = new Set(categoryMatches.map(m => m.term.english));
            unmatchedTermsByCategory[categoryKey] = words
                .filter(word => !matchedTermsSet.has(TextUtils.formatTerm(word.english)))
                .map(word => ({
                    english: word.english,
                    chinese: word.chinese,
                    difficulty: word.difficulty
                }));
        });
        
        return {
            summary: {
                totalVocabularyTerms: stats.totalTerms,
                totalConversationSentences: stats.totalSentences,
                totalMatches: stats.totalMatches,
                uniqueMatchedTerms: stats.uniqueMatchedTerms,
                uniqueMatchedSentences: stats.uniqueMatchedSentences,
                overallCoverage: stats.coveragePercentage,
                sentenceUtilization: stats.sentenceUtilizationPercentage,
                processingTime: stats.processingTime
            },
            matchingStrategies: {
                strategiesUsed: stats.matchesByStrategy,
                totalStrategyMatches: Object.values(stats.matchesByStrategy).reduce((a, b) => a + b, 0)
            },
            categoryAnalysis: matchesByCategory,
            unmatchedTerms: unmatchedTermsByCategory,
            bestMatches: this.results.bestMatches.slice(0, 50).map(match => ({
                term: match.term.english,
                category: match.term.category,
                sentence: match.sentence.english.substring(0, 100) + '...',
                conversationTitle: match.sentence.conversationTitle,
                strategy: match.strategy,
                confidence: Math.round(match.confidence * 1000) / 1000,
                matchDetails: match.matchDetails
            })),
            analysisMetadata: {
                analyzedAt: this.results.analysisDate,
                version: '2.0.0',
                improvementsFromV1: [
                    'Multiple matching strategies (exact, keyword, partial, semantic)',
                    'Confidence scoring for each match',
                    'Better text normalization and keyword extraction',
                    'Semantic equivalence mapping',
                    'Detailed match highlighting and explanations'
                ]
            }
        };
    }

    /**
     * Get strategies used in a category
     */
    getStrategiesUsedInCategory(categoryMatches) {
        const strategies = {};
        categoryMatches.forEach(match => {
            strategies[match.strategy] = (strategies[match.strategy] || 0) + 1;
        });
        return strategies;
    }

    /**
     * Generate markdown report
     */
    generateMarkdownReport(report) {
        const s = report.summary;
        
        return `# Advanced Vocabulary-Conversation Analysis Report

*Generated: ${new Date(report.analysisMetadata.analyzedAt).toLocaleString()}*

## 📊 Executive Summary

### Overall Results
- **Total Vocabulary Terms**: ${s.totalVocabularyTerms.toLocaleString()}
- **Total Conversation Sentences**: ${s.totalConversationSentences.toLocaleString()}
- **Terms with Examples**: ${s.uniqueMatchedTerms.toLocaleString()} (**${s.overallCoverage}%** coverage)
- **Terms without Examples**: ${(s.totalVocabularyTerms - s.uniqueMatchedTerms).toLocaleString()} (${Math.round(((s.totalVocabularyTerms - s.uniqueMatchedTerms) / s.totalVocabularyTerms) * 1000) / 10}%)
- **Total Matches Found**: ${s.totalMatches.toLocaleString()}
- **Sentence Utilization**: ${s.sentenceUtilization}% (${s.uniqueMatchedSentences.toLocaleString()}/${s.totalConversationSentences.toLocaleString()} sentences contain vocabulary)

### Processing Performance
- **Analysis Time**: ${s.processingTime.toLocaleString()}ms
- **Matches per Second**: ${Math.round((s.totalMatches / (s.processingTime / 1000)) * 100) / 100}

## 🎯 Matching Strategies Performance

| Strategy | Matches | Percentage |
|----------|---------|------------|
${Object.entries(report.matchingStrategies.strategiesUsed).map(([strategy, count]) => {
    const percentage = Math.round((count / report.matchingStrategies.totalStrategyMatches) * 1000) / 10;
    return `| ${strategy.replace('_', ' ')} | ${count.toLocaleString()} | ${percentage}% |`;
}).join('\n')}

## 📈 Category Analysis

| Category | Total Terms | With Examples | Coverage | Avg Confidence | Top Strategy |
|----------|-------------|---------------|----------|----------------|--------------|
${Object.entries(report.categoryAnalysis).map(([category, stats]) => {
    const topStrategy = Object.entries(stats.strategiesUsed).sort((a, b) => b[1] - a[1])[0];
    return `| ${category.replace('-', ' ')} | ${stats.totalTerms} | ${stats.matchedTerms} | **${stats.coveragePercentage}%** | ${stats.averageConfidence}% | ${topStrategy ? topStrategy[0] : 'None'} |`;
}).join('\n')}

## ✨ Best Quality Matches

*Top 20 highest-confidence matches showing vocabulary terms in natural conversation context:*

${report.bestMatches.slice(0, 20).map((match, i) => `
### ${i + 1}. "${match.term}" (${match.category.replace('-', ' ')})
**Strategy**: ${match.strategy.replace('_', ' ')} | **Confidence**: ${(match.confidence * 100).toFixed(1)}%

**Context**: "${match.sentence}"

**Source**: #${match.conversationTitle}

**Match Details**: ${match.matchDetails.type} match${match.matchDetails.matchedKeywords ? ` - Keywords: ${match.matchDetails.matchedKeywords.join(', ')}` : ''}
`).join('')}

## 🔍 Analysis Insights

### What This Analysis Reveals:

1. **${s.overallCoverage}% vocabulary coverage** - ${s.uniqueMatchedTerms.toLocaleString()} out of ${s.totalVocabularyTerms.toLocaleString()} terms have conversation examples
2. **High precision matching** - Using multiple strategies to find both exact and contextual matches
3. **${s.sentenceUtilization}% sentence utilization** - ${s.uniqueMatchedSentences.toLocaleString()} sentences contain recognizable vocabulary terms
4. **Strategy effectiveness** - ${Object.entries(report.matchingStrategies.strategiesUsed).sort((a, b) => b[1] - a[1])[0][0].replace('_', ' ')} strategy found the most matches

### Improvements from Previous Analysis:

- ✅ **Keyword-based matching** instead of only exact phrase matching
- ✅ **Multiple matching strategies** with confidence scoring  
- ✅ **Semantic equivalence** mapping (GP ↔ General Practitioner)
- ✅ **Better text processing** with stop word filtering
- ✅ **Match quality assessment** with detailed explanations

### Categories Needing Attention:

${Object.entries(report.categoryAnalysis)
    .sort((a, b) => a[1].coveragePercentage - b[1].coveragePercentage)
    .slice(0, 3)
    .map(([category, stats]) => 
        `- **${category.replace('-', ' ')}**: ${stats.coveragePercentage}% coverage (${stats.matchedTerms}/${stats.totalTerms} terms)`
    ).join('\n')}

## 💡 Recommendations

1. **Enhanced Coverage**: ${s.uniqueMatchedTerms.toLocaleString()} terms now have contextual examples (vs. 208 in previous analysis)
2. **Quality Focus**: Use high-confidence matches for pronunciation training
3. **Progressive Learning**: Start with exact phrase matches, progress to contextual usage
4. **Domain-Specific Training**: Focus on categories with lower coverage for additional content

---

*This analysis used advanced text processing and multiple matching strategies to provide more comprehensive vocabulary-conversation correlation than previous analyses.*
`;
    }

    /**
     * Generate CSV report for spreadsheet analysis
     */
    generateCSVReport() {
        const headers = [
            'Term',
            'Category', 
            'Chinese',
            'Sentence',
            'Conversation ID',
            'Conversation Title',
            'Strategy',
            'Confidence',
            'Match Type',
            'Matched Keywords'
        ].join(',');
        
        const rows = this.results.bestMatches.slice(0, 500).map(match => [
            `"${match.term.english}"`,
            match.term.category,
            `"${match.term.chinese}"`,
            `"${match.sentence.english.substring(0, 100).replace(/"/g, '""')}"`,
            match.sentence.conversationId,
            `"${match.sentence.conversationTitle}"`,
            match.strategy,
            Math.round(match.confidence * 1000) / 1000,
            match.matchDetails.type,
            `"${match.matchDetails.matchedKeywords ? match.matchDetails.matchedKeywords.join('; ') : ''}"`
        ].join(','));
        
        return [headers, ...rows].join('\n');
    }

    /**
     * Print summary to console
     */
    printSummary() {
        const stats = this.results.statistics;
        
        console.log('\n🎉 ANALYSIS RESULTS:');
        console.log(`   📚 Vocabulary Terms: ${stats.totalTerms.toLocaleString()}`);
        console.log(`   💬 Conversation Sentences: ${stats.totalSentences.toLocaleString()}`);
        console.log(`   🎯 Total Matches: ${stats.totalMatches.toLocaleString()}`);
        console.log(`   ✅ Terms with Examples: ${stats.uniqueMatchedTerms.toLocaleString()} (${stats.coveragePercentage}%)`);
        console.log(`   📊 Sentence Utilization: ${stats.sentenceUtilizationPercentage}%`);
        console.log(`   ⚡ Processing Time: ${stats.processingTime}ms`);
        
        console.log('\n📁 Generated Reports:');
        console.log('   - reports/advanced-vocabulary-analysis.json (detailed data)');
        console.log('   - reports/advanced-vocabulary-analysis.md (readable summary)');  
        console.log('   - reports/vocabulary-matches.csv (spreadsheet export)');
    }
}

// Main execution
async function main() {
    try {
        const analyzer = new VocabularyConversationAnalyzer();
        await analyzer.analyze();
    } catch (error) {
        console.error('\n❌ Analysis failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = VocabularyConversationAnalyzer;