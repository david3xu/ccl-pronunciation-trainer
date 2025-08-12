#!/usr/bin/env node

/**
 * Individual Conversation Processor for CCL Pronunciation Trainer
 * Processes single conversation markdown content pasted by user
 */

const fs = require('fs');
const path = require('path');

class ConversationProcessor {
    constructor() {
        this.outputDir = path.join(__dirname, '../../data/generated');
        this.conversations = [];
    }

    /**
     * Process a single conversation from markdown content
     */
    processContent(content, filename = 'conversation.md') {
        try {
            // Extract conversation header
            const headerMatch = content.match(/^#(70\d{3})\.\s+([^-\n]+?)(?:\s*[-–]\s*([^\n]+))?$/m);
            if (!headerMatch) {
                throw new Error('No conversation header found (expected format: #70XXX. Title - Domain)');
            }

            const id = headerMatch[1];
            const title = headerMatch[2].trim();
            const domain = headerMatch[3] ? headerMatch[3].trim() : this.extractDomainFromTitle(title);

            console.log(`Processing: ${id}. ${title} - ${domain}`);

            // Extract briefing
            const briefingMatch = content.match(/Briefing:\s*([^\n]+(?:\n(?![\d]+\.).*)*)/);
            const briefing = briefingMatch ? briefingMatch[1].trim() : '';

            // Extract dialogues
            const dialogues = this.extractDialogues(content);

            // Extract tips
            const tips = this.extractTips(content);

            const conversation = {
                id: id,
                title: title,
                domain: domain,
                briefing: briefing,
                dialogues: dialogues,
                tips: tips,
                sourceFile: filename,
                dialogueCount: dialogues.length,
                extractedAt: new Date().toISOString()
            };

            this.conversations.push(conversation);

            console.log(`✅ Extracted ${dialogues.length} dialogues and ${tips.length} tips`);
            return conversation;

        } catch (error) {
            console.error(`❌ Error processing content: ${error.message}`);
            throw error;
        }
    }

    /**
     * Extract dialogue exchanges from content
     */
    extractDialogues(content) {
        const dialogues = [];
        
        // Pattern for numbered dialogue exchanges
        // Format: "1.\nSpeaker: text\n(translation)"
        const dialoguePattern = /(\d+)\.\s*\n?([A-Za-z][^:]*?):\s*([^\n]+)\n?\(([^)]+)\)/g;
        let match;

        while ((match = dialoguePattern.exec(content)) !== null) {
            const [, number, speaker, original, translation] = match;
            
            // Clean up speaker name
            const cleanSpeaker = speaker.trim();
            
            // Determine language based on content
            const isChineseOriginal = /[\u4e00-\u9fa5]/.test(original);
            
            dialogues.push({
                number: parseInt(number),
                speaker: cleanSpeaker,
                english: isChineseOriginal ? translation.trim() : original.trim(),
                chinese: isChineseOriginal ? original.trim() : translation.trim(),
                originalLanguage: isChineseOriginal ? 'chinese' : 'english'
            });
        }

        return dialogues;
    }

    /**
     * Extract tips from content
     */
    extractTips(content) {
        const tips = [];
        
        // Extract teacher tips
        const tipsPattern = /【萤火虫老师Tips】\s*\n((?:(?!【萤火虫老师Tips】)[\s\S])*?)(?=\n\d+\.|【萤火虫老师Tips】|$)/g;
        let match;

        while ((match = tipsPattern.exec(content)) !== null) {
            const tip = match[1].trim();
            if (tip) {
                tips.push(tip);
            }
        }

        // Also extract standalone tips without the header
        const standaloneTipsPattern = /引申词组：([^\n]+)|拓展词汇：([^\n]+)/g;
        while ((match = standaloneTipsPattern.exec(content)) !== null) {
            const tip = (match[1] || match[2]).trim();
            if (tip && !tips.some(t => t.includes(tip))) {
                tips.push(tip);
            }
        }

        return tips;
    }

    /**
     * Extract domain from title if not provided
     */
    extractDomainFromTitle(title) {
        const domainPatterns = {
            'Housing': /housing|house|property|rent|accommodation|building|construction/i,
            'Medical': /medical|health|doctor|hospital|medicine|prescription|fever|rash|asthma|examination/i,
            'Legal': /legal|law|court|police|fine|claim|insurance|accident|domestic violence|separation|probation/i,
            'Education': /education|school|tafe|university|student|teacher|course|childcare|camp/i,
            'Immigration': /immigration|visa|citizenship|migrant|passport|parent visa/i,
            'Business': /business|bank|insurance|company|restaurant|shop|store|export|investment|complaint/i,
            'Social Welfare': /social|welfare|centrelink|pension|allowance|support|aged care|cleaning support/i,
            'Tourism': /tourism|travel|hotel|reservation|trip/i
        };
        
        for (const [domain, pattern] of Object.entries(domainPatterns)) {
            if (pattern.test(title)) {
                return domain;
            }
        }
        
        return 'General';
    }

    /**
     * Save conversation to file
     */
    saveConversation(conversation, format = 'json') {
        // Ensure output directory exists
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }

        const filename = `conversation-${conversation.id}.${format}`;
        const filepath = path.join(this.outputDir, filename);

        if (format === 'json') {
            fs.writeFileSync(filepath, JSON.stringify(conversation, null, 2));
        } else if (format === 'md') {
            const markdown = this.generateMarkdown(conversation);
            fs.writeFileSync(filepath, markdown);
        }

        console.log(`💾 Saved to: ${filepath}`);
        return filepath;
    }

    /**
     * Generate markdown output for conversation
     */
    generateMarkdown(conversation) {
        let md = `# ${conversation.id}. ${conversation.title}\n\n`;
        md += `**Domain:** ${conversation.domain}\n\n`;
        
        if (conversation.briefing) {
            md += `**Briefing:** ${conversation.briefing}\n\n`;
        }

        md += `## Dialogues (${conversation.dialogueCount})\n\n`;
        
        conversation.dialogues.forEach(dialogue => {
            md += `### ${dialogue.number}. ${dialogue.speaker}\n\n`;
            md += `**English:** ${dialogue.english}\n\n`;
            md += `**Chinese:** ${dialogue.chinese}\n\n`;
            md += `*Original: ${dialogue.originalLanguage}*\n\n---\n\n`;
        });

        if (conversation.tips && conversation.tips.length > 0) {
            md += `## Tips (${conversation.tips.length})\n\n`;
            conversation.tips.forEach((tip, index) => {
                md += `${index + 1}. ${tip}\n\n`;
            });
        }

        md += `---\n*Extracted: ${conversation.extractedAt}*\n`;
        
        return md;
    }

    /**
     * Save all conversations to combined files
     */
    saveAllConversations() {
        if (this.conversations.length === 0) {
            console.log('No conversations to save');
            return;
        }

        // Save as JSON
        const jsonData = {
            metadata: {
                extractionDate: new Date().toISOString(),
                totalConversations: this.conversations.length,
                totalDialogues: this.conversations.reduce((sum, c) => sum + c.dialogueCount, 0),
                domains: [...new Set(this.conversations.map(c => c.domain))]
            },
            conversations: this.conversations
        };

        const jsonPath = path.join(this.outputDir, 'processed-conversations.json');
        fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
        console.log(`📦 All conversations saved to: ${jsonPath}`);

        // Save as JavaScript module
        const jsContent = `/**
 * Processed Conversations
 * Generated: ${new Date().toISOString()}
 * Total: ${this.conversations.length} conversations
 */

window.processedConversations = ${JSON.stringify(jsonData, null, 2)};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.processedConversations;
}
`;
        
        const jsPath = path.join(this.outputDir, 'processed-conversations.js');
        fs.writeFileSync(jsPath, jsContent);
        console.log(`🚀 JavaScript module saved to: ${jsPath}`);

        return { jsonPath, jsPath };
    }

    /**
     * Print summary
     */
    printSummary() {
        if (this.conversations.length === 0) {
            console.log('No conversations processed yet.');
            return;
        }

        console.log('\n📊 Summary:');
        console.log(`Total Conversations: ${this.conversations.length}`);
        console.log(`Total Dialogues: ${this.conversations.reduce((sum, c) => sum + c.dialogueCount, 0)}`);
        console.log(`Domains: ${[...new Set(this.conversations.map(c => c.domain))].join(', ')}`);
    }
}

// Export for use in other scripts
module.exports = { ConversationProcessor };

// CLI usage
if (require.main === module) {
    const processor = new ConversationProcessor();
    
    if (process.argv.length < 3) {
        console.log('Usage: node conversation-processor.js <markdown-file>');
        console.log('Or use as a module for processing pasted content');
        process.exit(1);
    }
    
    const inputFile = process.argv[2];
    if (!fs.existsSync(inputFile)) {
        console.error(`File not found: ${inputFile}`);
        process.exit(1);
    }
    
    const content = fs.readFileSync(inputFile, 'utf-8');
    const conversation = processor.processContent(content, path.basename(inputFile));
    
    processor.saveConversation(conversation, 'json');
    processor.saveConversation(conversation, 'md');
    processor.printSummary();
}