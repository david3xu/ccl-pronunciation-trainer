# CCL Data Processing Module

This directory contains conversation data and extraction tools for the CCL Pronunciation Trainer. The main focus is on processing real CCL conversation dialogues to extract practical vocabulary terms.

## Directory Structure

```
data-processing/
├── extractors/         # CCL conversation files (117 conversations)
│   ├── merged-70241-70158.md    # Main merged conversation file with highlights
│   └── [other conversation files...]
└── README.md
```

## Data Source

### 🗣️ CCL Conversation Collection
**Location**: `extractors/`

**Contents**: 117 real CCL conversation files from actual NAATI test scenarios covering:
- **Business & Finance scenarios** - Banking, insurance, workplace discussions
- **Social Welfare conversations** - Government services, benefit applications  
- **Legal & Government dialogues** - Court procedures, legal consultations
- **Medical & Healthcare interactions** - Doctor visits, medical procedures
- **Education scenarios** - School meetings, academic discussions
- **Travel & Immigration conversations** - Airport, customs, visa applications

### 📝 Vocabulary Extraction Process
**Command**: `npm run extract-vocab`

**Source File**: `extractors/merged-70241-70158.md`
- Main conversation file with manually highlighted vocabulary terms
- Terms marked with `_highlighted_text_` syntax for extraction
- Bilingual context with English sentences and Chinese translations

**Output**: 937 practical vocabulary terms with contextual examples

## Key Features

### 🎯 Real-World Context
- **Authentic Conversations**: Actual NAATI CCL test dialogues
- **Practical Terms**: Vocabulary that appears in real exam scenarios  
- **Contextual Learning**: Each term includes the original conversation context
- **Bilingual Examples**: English sentences with accurate Chinese translations

### 📊 Data Statistics
- **Total Conversations**: 117 dialogue files
- **Extracted Terms**: 937 unique vocabulary items
- **Domain Coverage**: 6 major CCL test areas
- **Context Quality**: 100% of terms include sentence examples

### 🔧 Processing Pipeline
1. **Manual Curation**: Experts review conversations and highlight key terms using `_text_` syntax
2. **Automated Extraction**: Script processes highlighted terms and extracts context
3. **Quality Assurance**: Validation ensures accurate term-context pairing
4. **Category Mapping**: Terms automatically categorized by conversation domain
5. **Difficulty Classification**: Algorithm assigns Easy/Normal/Hard levels based on complexity

## Usage

### Extracting Vocabulary
```bash
# Generate vocabulary from conversation data
npm run extract-vocab
```

This processes the highlighted terms in `merged-70241-70158.md` and generates:
- `data/generated/conversation-vocabulary-data.js` - Browser-ready vocabulary data
- `data/generated/conversation-vocabulary-data.json` - JSON format for tools
- `reports/conversation-vocabulary-report.md` - Human-readable analysis report

### Integration with Main App

The conversation-based vocabulary provides:
1. **Contextual Pronunciation**: Practice terms within natural sentence flow
2. **Real-world Relevance**: Terms that actually appear in CCL exams  
3. **Enhanced Learning**: Bilingual examples for better comprehension
4. **Progressive Difficulty**: Structured learning path from easy to hard terms