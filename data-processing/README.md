# CCL Data Processing Module

This directory contains advanced data processing tools for analyzing vocabulary-conversation relationships in the CCL Pronunciation Trainer.

## Directory Structure

```
data-processing/
├── analyzers/           # Main analysis tools
│   └── vocabulary-conversation-analyzer.js
├── matchers/           # Matching algorithms  
│   └── vocabulary-matcher.js
├── extractors/         # Data extraction tools (future)
├── utils/              # Shared utilities
│   └── text-utils.js
├── config/             # Configuration files
│   └── matching-config.js
└── README.md
```

## Available Tools

### 🔍 Advanced Vocabulary Analysis
**Command**: `npm run analyze-vocabulary`

**Purpose**: Analyzes overlap between vocabulary terms and conversation sentences using multiple matching strategies.

**Features**:
- **Multiple Matching Strategies**: Exact phrase, keyword overlap, partial match, semantic similarity
- **Confidence Scoring**: Each match gets a confidence score (0.0-1.0)
- **Smart Text Processing**: Keyword extraction, stop word filtering, normalization
- **Comprehensive Reporting**: JSON, Markdown, and CSV outputs

**Outputs**:
- `reports/advanced-vocabulary-analysis.json` - Detailed data for programmatic use
- `reports/advanced-vocabulary-analysis.md` - Human-readable summary report  
- `reports/vocabulary-matches.csv` - Spreadsheet-compatible export

### 📊 Analysis Results Summary

**Latest Results** (vs. previous simple matching):
- **Coverage**: 14.3% (232/1,618 terms) - up from 12.9%
- **Total Matches**: 790 - up from 672
- **Sentence Utilization**: 26.1% - up from 23.2%
- **Processing**: Advanced multi-strategy analysis with confidence scoring

## Configuration

### Matching Strategies
Edit `config/matching-config.js` to adjust:
- Strategy weights and thresholds
- Stop words list
- Semantic equivalence mappings
- Minimum confidence levels

### Text Processing
The `utils/text-utils.js` module handles:
- Text normalization and cleaning
- Keyword extraction
- Similarity calculations
- Match highlighting

## Usage Examples

### Basic Analysis
```bash
npm run analyze-vocabulary
```

### Programmatic Usage
```javascript
const VocabularyConversationAnalyzer = require('./data-processing/analyzers/vocabulary-conversation-analyzer');

const analyzer = new VocabularyConversationAnalyzer();
await analyzer.analyze();
```

### Custom Matching
```javascript
const VocabularyMatcher = require('./data-processing/matchers/vocabulary-matcher');
const matcher = new VocabularyMatcher();

const matches = matcher.findMatches(vocabularyTerms, conversationSentences);
```

## Integration with Main App

The processed data can be used to:
1. **Enhanced Vocabulary Mode**: Show conversation examples for each term
2. **Contextual Pronunciation**: Practice terms within natural sentence flow
3. **Progressive Learning**: Start with high-confidence matches, progress to contextual usage
4. **Smart Recommendations**: Suggest related terms based on conversation context

## Future Enhancements

- **Semantic Analysis**: NLP-based semantic similarity matching
- **Domain-Specific Models**: Specialized matching for medical/legal/business terms
- **Interactive Analysis**: Web interface for exploring matches
- **Machine Learning**: Learn from user feedback to improve matching accuracy
- **Real-time Processing**: Live analysis as new conversations are added

## Performance

- **Processing Speed**: ~18 matches/second on 1,618 × 2,018 matrix
- **Memory Usage**: Efficient text processing with minimal memory overhead
- **Scalability**: Designed to handle larger vocabulary and conversation datasets