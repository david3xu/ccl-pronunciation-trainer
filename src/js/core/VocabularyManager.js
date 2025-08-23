// VocabularyManager - Handles conversation vocabulary loading, filtering, and navigation
class VocabularyManager {
    constructor() {
        this.currentCategory = 'all-categories';
        this.currentDifficulty = 'all';
        this.currentWords = [];
        this.allWords = []; // Store unfiltered words
        this.categoryCounts = {}; // Store counts per category per difficulty
        this.currentIndex = 0;
        
        // Category labels for conversation vocabulary
        this.categoryLabels = {
            'all-categories': '🌟 All Categories',
            'social-welfare': '🤝 Social Welfare',
            'education': '🎓 Education', 
            'legal-government': '⚖️ Legal & Government',
            'business-finance': '💼 Business & Finance',
            'medical-healthcare': '🏥 Medical & Healthcare',
            'travel-immigration': '✈️ Travel & Immigration'
        };
    }

    calculateCategoryCounts() {
        const data = this.getVocabularyData();
        if (!data || !data.vocabulary) return;
        
        // Initialize categories with zero counts
        this.categoryCounts = {
            'all-categories': { all: 0, easy: 0, normal: 0, hard: 0 }
        };
        
        // Count items by category and difficulty
        data.vocabulary.forEach(item => {
            const category = item.category || 'uncategorized';
            if (!this.categoryCounts[category]) {
                this.categoryCounts[category] = { all: 0, easy: 0, normal: 0, hard: 0 };
            }
            this.categoryCounts[category].all++;
            this.categoryCounts[category][item.difficulty]++;
            this.categoryCounts['all-categories'].all++;
            this.categoryCounts['all-categories'][item.difficulty]++;
        });
        
        console.log('Category counts calculated:', this.categoryCounts);
    }

    getVocabularyData() {
        const available = typeof conversationVocabularyData !== 'undefined';
        if (available) {
            console.log('Conversation vocabulary loaded:', conversationVocabularyData.totalTerms, 'terms');
        } else {
            console.error('Conversation vocabulary not loaded!');
        }
        return available ? conversationVocabularyData : null;
    }

    updateCategoryOptions() {
        const categorySelect = document.getElementById('categorySelect');
        if (!categorySelect) return;
        
        // Clear existing options
        categorySelect.innerHTML = '';
        
        // Add options based on available categories
        Object.entries(this.categoryLabels).forEach(([value, label]) => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = label;
            if (value === this.currentCategory) {
                option.selected = true;
            }
            categorySelect.appendChild(option);
        });
    }

    loadCategory(category) {
        const data = this.getVocabularyData();
        if (!data || !data.vocabulary) {
            console.error('No vocabulary data available');
            return;
        }

        this.currentCategory = category;
        
        // Filter vocabulary by category
        if (category === 'all-categories') {
            this.allWords = [...data.vocabulary];
        } else {
            this.allWords = data.vocabulary.filter(item => item.category === category);
        }

        // Apply difficulty filter
        this.applyDifficultyFilter();

        // Emit event
        window.eventBus.emit('vocabulary:categoryLoaded', {
            category: category,
            count: this.currentWords.length,
            totalCount: this.allWords.length
        });

        console.log(`Loaded category: ${category} with ${this.currentWords.length} words`);
    }

    setDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        this.applyDifficultyFilter();

        // Emit event
        window.eventBus.emit('vocabulary:difficultyFiltered', {
            difficulty: difficulty,
            count: this.currentWords.length
        });

        console.log(`Applied difficulty filter: ${difficulty} (${this.currentWords.length} words)`);
    }

    applyDifficultyFilter() {
        if (this.currentDifficulty === 'all') {
            this.currentWords = [...this.allWords];
        } else {
            this.currentWords = this.allWords.filter(word => word.difficulty === this.currentDifficulty);
        }

        // Preserve original order from raw conversation data
        // No shuffling - maintain sequence as extracted
    }

    shuffleWords() {
        // Fisher-Yates shuffle algorithm
        for (let i = this.currentWords.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.currentWords[i], this.currentWords[j]] = [this.currentWords[j], this.currentWords[i]];
        }
    }

    getCurrentWord(index = null) {
        if (index !== null) {
            this.currentIndex = index;
        }
        
        if (this.currentWords.length === 0) {
            return null;
        }
        
        // Ensure index is within bounds
        this.currentIndex = Math.max(0, Math.min(this.currentIndex, this.currentWords.length - 1));
        
        return this.currentWords[this.currentIndex];
    }

    getNextWord() {
        this.currentIndex = (this.currentIndex + 1) % this.currentWords.length;
        return this.getCurrentWord();
    }

    getPreviousWord() {
        this.currentIndex = (this.currentIndex - 1 + this.currentWords.length) % this.currentWords.length;
        return this.getCurrentWord();
    }

    getTotalWords() {
        return this.currentWords.length;
    }

    getCategoryLabel(category) {
        return this.categoryLabels[category] || category;
    }

    getCategoryCounts() {
        return this.categoryCounts;
    }

    getAllCategories() {
        return Object.keys(this.categoryLabels);
    }

    resetToFirstWord() {
        this.currentIndex = 0;
    }

    // Initialize vocabulary on load
    initialize() {
        this.calculateCategoryCounts();
        this.updateCategoryOptions();
        this.loadCategory(this.currentCategory);
        
        // Emit initialization complete
        window.eventBus.emit('vocabulary:initialized', {
            totalTerms: this.categoryCounts['all-categories']?.all || 0,
            categories: Object.keys(this.categoryLabels)
        });
    }
}

// Create and expose global instance
window.vocabularyManager = new VocabularyManager();