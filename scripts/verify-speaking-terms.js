#!/usr/bin/env node

/**
 * Verification script for speaking-terms mode integration
 * Tests that all components are properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Speaking Terms Mode Integration...\n');

let hasErrors = false;

// Test 1: Check if dataset exists
console.log('1️⃣ Checking dataset file...');
const datasetPath = path.join(__dirname, '../data/processed/speaking-terms-dataset.json');
if (fs.existsSync(datasetPath)) {
    const data = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
    console.log(`   ✅ Dataset exists with ${data.vocabulary.length} items`);
    console.log(`   ✅ Sections: ${data.metadata.totalSections}`);
} else {
    console.log('   ❌ Dataset file not found!');
    hasErrors = true;
}

// Test 2: Check Config.js
console.log('\n2️⃣ Checking Config.js...');
const configPath = path.join(__dirname, '../src/js/shared/Config.js');
const configContent = fs.readFileSync(configPath, 'utf8');
if (configContent.includes('SPEAKING_TERMS') && 
    configContent.includes('speaking-terms-dataset.json') &&
    configContent.includes('speakingTerms')) {
    console.log('   ✅ Config.js properly configured');
} else {
    console.log('   ❌ Config.js missing speaking-terms configuration!');
    hasErrors = true;
}

// Test 3: Check Constants.js
console.log('\n3️⃣ Checking Constants.js...');
const constantsPath = path.join(__dirname, '../src/js/shared/Constants.js');
const constantsContent = fs.readFileSync(constantsPath, 'utf8');
if (constantsContent.includes("SPEAKING_TERMS: 'speaking-terms'")) {
    console.log('   ✅ Constants.js properly configured');
} else {
    console.log('   ❌ Constants.js missing SPEAKING_TERMS constant!');
    hasErrors = true;
}

// Test 4: Check ResumeVocabularyManager.js
console.log('\n4️⃣ Checking ResumeVocabularyManager.js...');
const managerPath = path.join(__dirname, '../src/js/core/ResumeVocabularyManager.js');
const managerContent = fs.readFileSync(managerPath, 'utf8');
if (managerContent.includes('speakingTermsDataset') && 
    managerContent.includes("case 'speaking-terms':")) {
    console.log('   ✅ VocabularyManager properly configured');
} else {
    console.log('   ❌ VocabularyManager missing speaking-terms support!');
    hasErrors = true;
}

// Test 5: Check index.html
console.log('\n5️⃣ Checking index.html...');
const htmlPath = path.join(__dirname, '../index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');
if (htmlContent.includes('value="speaking-terms"') && 
    htmlContent.includes('🎯 Speaking Terms')) {
    console.log('   ✅ HTML dropdown includes speaking-terms option');
} else {
    console.log('   ❌ HTML missing speaking-terms option!');
    hasErrors = true;
}

// Test 6: Check report file
console.log('\n6️⃣ Checking processing report...');
const reportPath = path.join(__dirname, '../data/reports/speaking-terms-processing.txt');
if (fs.existsSync(reportPath)) {
    console.log('   ✅ Processing report exists');
} else {
    console.log('   ⚠️ Processing report not found (optional)');
}

// Summary
console.log('\n' + '='.repeat(60));
if (hasErrors) {
    console.log('❌ VERIFICATION FAILED - Some components are missing!');
    process.exit(1);
} else {
    console.log('✅ VERIFICATION PASSED - All components properly integrated!');
    console.log('\n📝 Summary:');
    console.log('   - Dataset: speaking-terms-dataset.json (270 sentences)');
    console.log('   - Mode: 🎯 Speaking Terms');
    console.log('   - Integration: Complete');
    console.log('\n🎉 Ready to use!');
}
