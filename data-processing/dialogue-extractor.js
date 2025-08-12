#!/usr/bin/env node

/**
 * Dialogue Extractor for CCL Pronunciation Trainer
 * Extracts structured dialogue data from conversation markdown files
 */

const fs = require('fs');
const path = require('path');

class DialogueExtractor {
    constructor() {
        this.conversations = [];
        this.stats = {
            totalFiles: 0,
            totalConversations: 0,
            totalDialogues: 0,
            totalEnglishSentences: 0,
            totalChineseSentences: 0,
            domains: new Set(),
            processingErrors: []
        };
    }

    /**
     * Extract dialogues from a markdown file
     */
    extractFromFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const fileName = path.basename(filePath);
            
            // Split content into conversation sections (marked by #70XXX. pattern at start of line)
            // Note: Some entries in TOC have dots, actual conversations don't always have them
            const conversationPattern = /^#(70\d{3})\.\s+([^\n]+?)(?:\s*[-–]\s*([^\n]+))?$/gm;
            const conversations = [];
            let matches = [];
            let match;
            
            // First collect all matches
            while ((match = conversationPattern.exec(content)) !== null) {
                matches.push({
                    id: match[1],
                    title: match[2].trim().replace(/\.+$/, ''), // Remove trailing dots
                    domain: match[3] ? match[3].trim() : null,
                    index: match.index,
                    fullMatch: match[0]
                });
            }
            
            // Now extract content between matches
            for (let i = 0; i < matches.length; i++) {
                const current = matches[i];
                const next = matches[i + 1];
                
                // Skip if this looks like a TOC entry (has many dots or page numbers)
                if (current.title.includes('...') || /\d{2,}$/.test(current.title)) {
                    continue;
                }
                
                // Extract content from current match to next match (or end of file)
                const startIndex = current.index;
                const endIndex = next ? next.index : content.length;
                const convContent = content.substring(startIndex, endIndex);
                
                // Check if this has actual dialogue content (not just a TOC entry)
                if (convContent.includes('Briefing:') || /\d+\.\s*\n?[A-Za-z]+:/.test(convContent)) {
                    conversations.push({
                        id: current.id,
                        title: current.title,
                        domain: current.domain,
                        content: convContent
                    });
                }
            }
            
            // Process each conversation
            conversations.forEach(conv => {
                const processedConv = this.processConversation(conv, fileName);
                if (processedConv) {
                    this.conversations.push(processedConv);
                }
            });
            
            this.stats.totalFiles++;
            
        } catch (error) {
            this.stats.processingErrors.push({
                file: filePath,
                error: error.message
            });
        }
    }

    /**
     * Process a single conversation
     */
    processConversation(conv, fileName) {
        try {
            const dialogues = [];
            // Use provided domain or try to extract from title
            const domain = conv.domain || this.extractDomain(conv.title);
            
            // Extract briefing if present
            const briefingMatch = conv.content.match(/Briefing:\s*([^\n]+(?:\n(?![\d]+\.).*)*)/);
            const briefing = briefingMatch ? briefingMatch[1].trim() : '';
            
            // Extract dialogue exchanges (numbered format)
            const dialoguePattern = /(\d+)\.\s*\n?([A-Za-z]+):\s*([^\n]+)\n?\(([^)]+)\)/g;
            let dialogueMatch;
            
            while ((dialogueMatch = dialoguePattern.exec(conv.content)) !== null) {
                const [, number, speaker, original, translation] = dialogueMatch;
                
                // Determine language based on content characteristics
                const isChineseOriginal = /[\u4e00-\u9fa5]/.test(original);
                
                dialogues.push({
                    number: parseInt(number),
                    speaker: speaker,
                    english: isChineseOriginal ? translation : original,
                    chinese: isChineseOriginal ? original : translation,
                    originalLanguage: isChineseOriginal ? 'chinese' : 'english'
                });
                
                if (isChineseOriginal) {
                    this.stats.totalChineseSentences++;
                } else {
                    this.stats.totalEnglishSentences++;
                }
                this.stats.totalDialogues++;
            }
            
            // Also try to extract tips/notes
            const tipsPattern = /【萤火虫老师Tips】([^【]+)/g;
            const tips = [];
            let tipMatch;
            
            while ((tipMatch = tipsPattern.exec(conv.content)) !== null) {
                tips.push(tipMatch[1].trim());
            }
            
            if (dialogues.length > 0) {
                this.stats.totalConversations++;
                if (domain) {
                    this.stats.domains.add(domain);
                }
                
                return {
                    id: conv.id,
                    title: conv.title,
                    domain: domain || 'General',
                    briefing: briefing,
                    dialogues: dialogues,
                    tips: tips,
                    sourceFile: fileName,
                    dialogueCount: dialogues.length
                };
            }
            
        } catch (error) {
            this.stats.processingErrors.push({
                conversation: conv.id,
                error: error.message
            });
        }
        
        return null;
    }

    /**
     * Extract domain from title
     */
    extractDomain(title) {
        const domainPatterns = {
            'Housing': /housing|house|property|rent|accommodation/i,
            'Medical': /medical|health|doctor|hospital|medicine|prescription|fever|rash/i,
            'Legal': /legal|law|court|police|fine|claim|insurance|accident/i,
            'Education': /education|school|tafe|university|student|teacher|course/i,
            'Immigration': /immigration|visa|citizenship|migrant|passport/i,
            'Business': /business|bank|insurance|company|restaurant|shop|store/i,
            'Social Welfare': /social|welfare|centrelink|pension|allowance|support/i,
            'Tourism': /tourism|travel|hotel|reservation|trip/i
        };
        
        for (const [domain, pattern] of Object.entries(domainPatterns)) {
            if (pattern.test(title)) {
                return domain;
            }
        }
        
        return null;
    }

    /**
     * Process all markdown files in a directory
     */
    processDirectory(dirPath) {
        const files = fs.readdirSync(dirPath);
        
        files.forEach(file => {
            if (file.endsWith('.md')) {
                const filePath = path.join(dirPath, file);
                const stats = fs.statSync(filePath);
                
                if (stats.isFile()) {
                    console.log(`Processing: ${file}`);
                    this.extractFromFile(filePath);
                } else if (stats.isDirectory()) {
                    // Recursively process subdirectories
                    this.processDirectory(filePath);
                }
            }
        });
    }

    /**
     * Generate output files
     */
    generateOutput(outputDir) {
        // Ensure output directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Generate JSON output
        const jsonOutput = {
            metadata: {
                extractionDate: new Date().toISOString(),
                totalConversations: this.stats.totalConversations,
                totalDialogues: this.stats.totalDialogues,
                domains: Array.from(this.stats.domains),
                statistics: {
                    filesProcessed: this.stats.totalFiles,
                    englishSentences: this.stats.totalEnglishSentences,
                    chineseSentences: this.stats.totalChineseSentences,
                    errors: this.stats.processingErrors.length
                }
            },
            conversations: this.conversations
        };
        
        const jsonPath = path.join(outputDir, 'extracted-dialogues.json');
        fs.writeFileSync(jsonPath, JSON.stringify(jsonOutput, null, 2));
        console.log(`✅ JSON output saved to: ${jsonPath}`);
        
        // Generate JavaScript module
        const jsContent = `/**
 * Extracted Dialogue Data
 * Generated: ${new Date().toISOString()}
 * Total Conversations: ${this.stats.totalConversations}
 * Total Dialogues: ${this.stats.totalDialogues}
 */

window.dialogueData = ${JSON.stringify(jsonOutput, null, 2)};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.dialogueData;
}
`;
        
        const jsPath = path.join(outputDir, 'dialogue-data.js');
        fs.writeFileSync(jsPath, jsContent);
        console.log(`✅ JavaScript module saved to: ${jsPath}`);
        
        // Generate markdown report
        const reportContent = this.generateReport();
        const reportPath = path.join(outputDir, 'dialogue-extraction-report.md');
        fs.writeFileSync(reportPath, reportContent);
        console.log(`✅ Report saved to: ${reportPath}`);
        
        return {
            jsonPath,
            jsPath,
            reportPath
        };
    }

    /**
     * Generate extraction report
     */
    generateReport() {
        const domainStats = {};
        this.conversations.forEach(conv => {
            const domain = conv.domain;
            if (!domainStats[domain]) {
                domainStats[domain] = {
                    conversations: 0,
                    dialogues: 0,
                    tips: 0
                };
            }
            domainStats[domain].conversations++;
            domainStats[domain].dialogues += conv.dialogueCount;
            domainStats[domain].tips += conv.tips.length;
        });
        
        let report = `# Dialogue Extraction Report

## Summary
- **Extraction Date**: ${new Date().toISOString()}
- **Files Processed**: ${this.stats.totalFiles}
- **Conversations Extracted**: ${this.stats.totalConversations}
- **Total Dialogues**: ${this.stats.totalDialogues}
- **English Sentences**: ${this.stats.totalEnglishSentences}
- **Chinese Sentences**: ${this.stats.totalChineseSentences}
- **Domains Identified**: ${this.stats.domains.size}

## Domain Breakdown
| Domain | Conversations | Dialogues | Tips |
|--------|--------------|-----------|------|
`;
        
        Object.entries(domainStats)
            .sort((a, b) => b[1].conversations - a[1].conversations)
            .forEach(([domain, stats]) => {
                report += `| ${domain} | ${stats.conversations} | ${stats.dialogues} | ${stats.tips} |\n`;
            });
        
        // Add top conversations by dialogue count
        report += `\n## Top 10 Conversations by Dialogue Count\n`;
        report += `| ID | Title | Domain | Dialogues |\n`;
        report += `|----|-------|--------|----------|\n`;
        
        this.conversations
            .sort((a, b) => b.dialogueCount - a.dialogueCount)
            .slice(0, 10)
            .forEach(conv => {
                report += `| ${conv.id} | ${conv.title} | ${conv.domain} | ${conv.dialogueCount} |\n`;
            });
        
        // Add errors if any
        if (this.stats.processingErrors.length > 0) {
            report += `\n## Processing Errors\n`;
            this.stats.processingErrors.forEach(error => {
                report += `- **${error.file || error.conversation}**: ${error.error}\n`;
            });
        }
        
        return report;
    }
}

// Main execution
function main() {
    console.log('🚀 CCL Dialogue Extractor');
    console.log('========================\n');
    
    const extractor = new DialogueExtractor();
    
    // Define paths
    const conversationDir = path.join(__dirname, '../../data/conversation/萤火虫CCL真题机经 (25.8.8更新）_output');
    const outputDir = path.join(__dirname, '../../data/generated');
    
    // Check if conversation directory exists
    if (!fs.existsSync(conversationDir)) {
        console.error(`❌ Conversation directory not found: ${conversationDir}`);
        process.exit(1);
    }
    
    // Process files
    console.log(`📁 Processing directory: ${conversationDir}\n`);
    extractor.processDirectory(conversationDir);
    
    // Generate output
    console.log('\n📝 Generating output files...\n');
    const output = extractor.generateOutput(outputDir);
    
    // Print summary
    console.log('\n✨ Extraction Complete!');
    console.log('======================');
    console.log(`📊 Conversations: ${extractor.stats.totalConversations}`);
    console.log(`💬 Dialogues: ${extractor.stats.totalDialogues}`);
    console.log(`🌏 Domains: ${extractor.stats.domains.size}`);
    console.log(`📁 Files: ${extractor.stats.totalFiles}`);
    
    if (extractor.stats.processingErrors.length > 0) {
        console.log(`\n⚠️ Errors encountered: ${extractor.stats.processingErrors.length}`);
    }
    
    return output;
}

// Run if executed directly
if (require.main === module) {
    main();
}

module.exports = { DialogueExtractor, main };