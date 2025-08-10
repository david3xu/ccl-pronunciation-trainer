/**
 * Configuration for vocabulary-conversation matching
 */

module.exports = {
    // Matching strategies with weights
    strategies: {
        EXACT_PHRASE: {
            weight: 1.0,
            description: 'Complete phrase match',
            enabled: true
        },
        KEYWORD_OVERLAP: {
            weight: 0.8,
            description: 'Significant keyword overlap',
            minKeywordRatio: 0.6, // At least 60% of keywords must match
            enabled: true
        },
        PARTIAL_MATCH: {
            weight: 0.6,
            description: 'Some keywords match',
            minKeywordRatio: 0.4, // At least 40% of keywords must match
            enabled: true
        },
        SEMANTIC_SIMILARITY: {
            weight: 0.5,
            description: 'Semantic equivalence',
            enabled: false // Disabled for now - would need NLP library
        }
    },

    // Words to ignore when matching (stop words + common words)
    stopWords: new Set([
        'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
        'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
        'before', 'after', 'above', 'below', 'between', 'among', 'under', 'over',
        'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
        'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may',
        'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you',
        'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
    ]),

    // Semantic equivalents (manual mapping for common CCL terms)
    semanticMappings: {
        'gp': ['general practitioner', 'doctor', 'physician'],
        'general practitioner': ['gp', 'doctor', 'physician'],
        'centrelink': ['social services', 'welfare office', 'benefits office'],
        'medicare': ['health insurance', 'medical coverage'],
        'ato': ['tax office', 'taxation office', 'australian taxation office'],
        'dha': ['immigration', 'home affairs', 'department of home affairs'],
        'real estate agent': ['property agent', 'real estate representative'],
        'solicitor': ['lawyer', 'attorney', 'legal representative'],
        'magistrate': ['judge', 'judicial officer'],
        'constable': ['police officer', 'officer']
    },

    // Minimum match confidence threshold
    minMatchConfidence: 0.4,

    // Maximum matches per term (to avoid noise)
    maxMatchesPerTerm: 10
};