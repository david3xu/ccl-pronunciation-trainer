#!/usr/bin/env node

/**
 * Speaking Terms Pipeline
 * Extracts speaking practice content from speaking-terms.md for pronunciation training
 * Processes: data/source/speaking-terms.md → data/processed/speaking-terms-dataset.json
 */

const fs = require('fs');
const path = require('path');

// Paths
const SOURCE_FILE = path.join(__dirname, '../data/source/speaking-terms.md');
const OUTPUT_DIR = path.join(__dirname, '../data/processed');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'speaking-terms-dataset.json');
const REPORT_DIR = path.join(__dirname, '../data/reports');
const REPORT_FILE = path.join(REPORT_DIR, 'speaking-terms-processing.txt');

// Ensure directories exist
[OUTPUT_DIR, REPORT_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

/**
 * Extract speaking content from markdown
 * Organizes by sections and preserves document structure
 */
function extractSpeakingContent(content) {
    const lines = content.split('\n');
    const sections = [];
    let currentSection = null;
    let currentSubsection = null;
    let sentenceId = 1;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Skip empty lines and main title
        if (!trimmed || trimmed.startsWith('# Speaking Terms')) {
            continue;
        }

        // Main sections (## Section Name)
        if (trimmed.startsWith('## ')) {
            const sectionTitle = trimmed.replace('## ', '').trim();
            currentSection = {
                section: sectionTitle,
                subsections: [],
                sentences: []
            };
            sections.push(currentSection);
            currentSubsection = null;
            continue;
        }

        // Subsections (### Subsection Name)
        if (trimmed.startsWith('### ')) {
            const subsectionTitle = trimmed.replace('### ', '').trim();
            if (currentSection) {
                currentSubsection = {
                    subsection: subsectionTitle,
                    sentences: []
                };
                currentSection.subsections.push(currentSubsection);
            }
            continue;
        }

        // Skip other headers
        if (trimmed.startsWith('#')) {
            continue;
        }

        // Extract sentences (non-empty lines that are actual content)
        if (trimmed.length > 0) {
            // Skip lines that are just formatting or metadata
            if (trimmed.startsWith('---') || 
                trimmed.startsWith('**') && trimmed.endsWith('**') ||
                trimmed.startsWith('•')) {
                continue;
            }

            // Clean up sentence
            let sentence = trimmed;

            // Determine category and difficulty
            let category = currentSection ? currentSection.section : 'General';
            if (currentSubsection) {
                category = `${category} - ${currentSubsection.subsection}`;
            }

            // Infer difficulty based on sentence characteristics
            const difficulty = inferDifficulty(sentence);

            const sentenceData = {
                id: `speaking-${sentenceId}`,
                text: sentence,
                category: category,
                section: currentSection ? currentSection.section : 'General',
                subsection: currentSubsection ? currentSubsection.subsection : null,
                difficulty: difficulty,
                order: sentenceId
            };

            // Add to appropriate collection
            if (currentSubsection) {
                currentSubsection.sentences.push(sentenceData);
            } else if (currentSection) {
                currentSection.sentences.push(sentenceData);
            }

            sentenceId++;
        }
    }

    // Flatten all sentences into a single array for the vocabulary trainer
    const allSentences = [];
    for (const section of sections) {
        // Add sentences directly under section
        allSentences.push(...section.sentences);
        
        // Add sentences from subsections
        for (const subsection of section.subsections) {
            allSentences.push(...subsection.sentences);
        }
    }

    return { sections, allSentences };
}

/**
 * Infer difficulty based on sentence characteristics
 */
function inferDifficulty(sentence) {
    const wordCount = sentence.split(/\s+/).length;
    const length = sentence.length;
    
    // Complex technical terms or long sentences
    if (wordCount > 15 || length > 100 || 
        sentence.includes('sophisticated') || 
        sentence.includes('architecture') ||
        sentence.includes('multi-agent') ||
        sentence.includes('relationship mapping')) {
        return 'hard';
    }
    
    // Short, simple sentences
    if (wordCount < 6 && length < 40) {
        return 'easy';
    }
    
    // Everything else
    return 'normal';
}

/**
 * Get category statistics
 */
function getCategoryStats(sentences) {
    const stats = {};
    for (const sentence of sentences) {
        const category = sentence.category || 'Uncategorized';
        stats[category] = (stats[category] || 0) + 1;
    }
    return stats;
}

/**
 * Generate processing report
 */
function generateReport(sections, allSentences, processingTime) {
    const categoryStats = getCategoryStats(allSentences);
    const difficultyStats = {
        easy: allSentences.filter(s => s.difficulty === 'easy').length,
        normal: allSentences.filter(s => s.difficulty === 'normal').length,
        hard: allSentences.filter(s => s.difficulty === 'hard').length
    };

    const report = [
        '='.repeat(70),
        'SPEAKING TERMS PROCESSING REPORT',
        '='.repeat(70),
        '',
        `Generated: ${new Date().toISOString()}`,
        `Processing Time: ${processingTime}ms`,
        `Source: ${SOURCE_FILE}`,
        '',
        '--- STATISTICS ---',
        `Total Sentences: ${allSentences.length}`,
        `Total Sections: ${sections.length}`,
        '',
        '--- DIFFICULTY BREAKDOWN ---',
        `Easy: ${difficultyStats.easy}`,
        `Normal: ${difficultyStats.normal}`,
        `Hard: ${difficultyStats.hard}`,
        '',
        '--- CATEGORY BREAKDOWN ---',
        ...Object.entries(categoryStats).map(([cat, count]) => `${cat}: ${count}`),
        '',
        '--- SECTIONS ---',
        ...sections.map(section => {
            const subsectionCount = section.subsections.length;
            const sentenceCount = section.sentences.length + 
                section.subsections.reduce((sum, sub) => sum + sub.sentences.length, 0);
            return `${section.section}: ${sentenceCount} sentences, ${subsectionCount} subsections`;
        }),
        '',
        '--- SAMPLE SENTENCES (First 10) ---',
        ...allSentences.slice(0, 10).map((s, i) => `${i + 1}. [${s.difficulty}] ${s.text.substring(0, 80)}${s.text.length > 80 ? '...' : ''}`),
        '',
        '='.repeat(70),
    ].join('\n');

    fs.writeFileSync(REPORT_FILE, report, 'utf8');
    console.log(`\n📄 Report saved: ${REPORT_FILE}`);
}

/**
 * Main pipeline execution
 */
function main() {
    console.log('\n🎯 Speaking Terms Pipeline Starting...\n');
    const startTime = Date.now();

    try {
        // Read source file
        console.log(`📖 Reading: ${SOURCE_FILE}`);
        if (!fs.existsSync(SOURCE_FILE)) {
            throw new Error(`Source file not found: ${SOURCE_FILE}`);
        }
        const content = fs.readFileSync(SOURCE_FILE, 'utf8');

        // Extract speaking content
        console.log('🔍 Extracting speaking content...');
        const { sections, allSentences } = extractSpeakingContent(content);
        console.log(`✅ Extracted ${allSentences.length} sentences from ${sections.length} sections`);

        // Create output data structure
        const output = {
            metadata: {
                generated: new Date().toISOString(),
                totalSentences: allSentences.length,
                totalSections: sections.length,
                source: 'speaking-terms-pipeline',
                version: '1.0',
                description: 'Interview speaking practice content for pronunciation training'
            },
            sections: sections,
            vocabulary: allSentences // Using 'vocabulary' key to match other datasets
        };

        // Write output file
        console.log(`💾 Writing: ${OUTPUT_FILE}`);
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf8');

        // Generate report
        const processingTime = Date.now() - startTime;
        generateReport(sections, allSentences, processingTime);

        // Success summary
        console.log('\n✅ Speaking Terms Pipeline Complete!');
        console.log(`   Sentences: ${allSentences.length}`);
        console.log(`   Sections: ${sections.length}`);
        console.log(`   Output: ${OUTPUT_FILE}`);
        console.log(`   Time: ${processingTime}ms\n`);

    } catch (error) {
        console.error('\n❌ Pipeline Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Execute pipeline
if (require.main === module) {
    main();
}

module.exports = { extractSpeakingContent, inferDifficulty };
