#!/usr/bin/env node

/**
 * Interview Sentence Pipeline
 * Extracts sentences from interview practice content for pronunciation training
 * Processes: data/source/temp.md → data/processed/interview-sentences.json
 */

const fs = require('fs');
const path = require('path');

// Paths
const SOURCE_FILE = path.join(__dirname, '../data/source/temp.md');
const OUTPUT_DIR = path.join(__dirname, '../data/processed');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'interview-sentences.json');
const REPORT_DIR = path.join(__dirname, '../data/reports');
const REPORT_FILE = path.join(REPORT_DIR, 'interview-sentence-processing.txt');

// Ensure directories exist
[OUTPUT_DIR, REPORT_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

/**
 * Extract sentences from markdown content
 * Preserves document order, skips headers/metadata
 */
function extractSentences(content) {
    const lines = content.split('\n');
    const sentences = [];
    let sentenceId = 1;

    for (const line of lines) {
        const trimmed = line.trim();

        // Skip empty lines, headers, horizontal rules, metadata
        if (!trimmed ||
            trimmed.startsWith('#') ||
            trimmed.startsWith('---') ||
            trimmed.startsWith('**') && trimmed.endsWith('**') ||
            trimmed.startsWith('##') ||
            trimmed.includes('→')) {
            continue;
        }

        // Extract sentence content (remove line number prefix if present)
        let sentence = trimmed.replace(/^\s*\d+→/, '').trim();

        // Skip if empty after cleanup
        if (!sentence) continue;

        // Remove bold markers but keep the text
        sentence = sentence.replace(/\*\*/g, '');

        // Only include sentences with actual content (not just section markers)
        if (sentence.length > 5) {
            sentences.push({
                id: `sentence-${sentenceId}`,
                text: sentence,
                order: sentenceId
            });
            sentenceId++;
        }
    }

    return sentences;
}

/**
 * Generate processing report
 */
function generateReport(sentences, processingTime) {
    const report = [
        '='.repeat(70),
        'INTERVIEW SENTENCE PROCESSING REPORT',
        '='.repeat(70),
        '',
        `Generated: ${new Date().toISOString()}`,
        `Processing Time: ${processingTime}ms`,
        `Source: ${SOURCE_FILE}`,
        '',
        '--- STATISTICS ---',
        `Total Sentences Extracted: ${sentences.length}`,
        '',
        '--- SAMPLE SENTENCES (First 10) ---',
        ...sentences.slice(0, 10).map((s, i) => `${i + 1}. ${s.text}`),
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
    console.log('\n🎤 Interview Sentence Pipeline Starting...\n');
    const startTime = Date.now();

    try {
        // Read source file
        console.log(`📖 Reading: ${SOURCE_FILE}`);
        if (!fs.existsSync(SOURCE_FILE)) {
            throw new Error(`Source file not found: ${SOURCE_FILE}`);
        }
        const content = fs.readFileSync(SOURCE_FILE, 'utf8');

        // Extract sentences
        console.log('🔍 Extracting sentences...');
        const sentences = extractSentences(content);
        console.log(`✅ Extracted ${sentences.length} sentences`);

        // Create output data structure
        const output = {
            metadata: {
                generated: new Date().toISOString(),
                totalSentences: sentences.length,
                source: 'interview-sentence-pipeline',
                version: '1.0',
                description: 'Interview practice sentences for pronunciation training'
            },
            sentences: sentences
        };

        // Write output file
        console.log(`💾 Writing: ${OUTPUT_FILE}`);
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf8');

        // Generate report
        const processingTime = Date.now() - startTime;
        generateReport(sentences, processingTime);

        // Success summary
        console.log('\n✅ Interview Sentence Pipeline Complete!');
        console.log(`   Sentences: ${sentences.length}`);
        console.log(`   Output: ${OUTPUT_FILE}`);
        console.log(`   Time: ${processingTime}ms\n`);

    } catch (error) {
        console.error('\n❌ Pipeline Error:', error.message);
        process.exit(1);
    }
}

// Execute pipeline
main();
