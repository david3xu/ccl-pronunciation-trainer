// AudioControls - Play/pause/repeat functionality and timing
class AudioControls {
    constructor() {
        this.isPlaying = false;
        this.delay = 2000; // Default 2 seconds pause between words
        this.repeatMode = 'individual';
        this.currentIndex = 0;
        this.autoPlayTimeout = null;
    }

    async startAutoPlay() {
        if (this.isPlaying) return;
        
        const totalWords = window.vocabularyManager.getTotalWords();
        if (totalWords === 0) {
            window.progressTracker.showError('No words available to play');
            return;
        }

        this.isPlaying = true;
        this.showPlayingUI();
        
        // Update status based on repeat mode
        if (this.repeatMode === 'individual' || this.repeatMode === 'intensive') {
            window.progressTracker.updateStatus(`Playing... (1/${window.ttsEngine.getTargetRepeats()})`);
        } else {
            window.progressTracker.updateStatus('Playing...');
        }
        
        console.log(`Starting auto-play from index ${this.currentIndex}`);
        
        // Emit auto-play start event
        window.eventBus.emit('audioControls:autoPlayStarted', {
            startIndex: this.currentIndex,
            totalWords
        });
        
        await this.playCurrentWord();
    }

    pauseAutoPlay() {
        if (!this.isPlaying) return;
        
        this.isPlaying = false;
        this.showPausedUI();
        
        if (this.autoPlayTimeout) {
            clearTimeout(this.autoPlayTimeout);
            this.autoPlayTimeout = null;
        }
        
        // Stop any ongoing speech
        window.ttsEngine.stopSpeaking();
        
        window.progressTracker.updateStatus('Paused');
        console.log('Auto-play paused');
        
        // Emit auto-play pause event
        window.eventBus.emit('audioControls:autoPlayPaused', {
            currentIndex: this.currentIndex
        });
    }

    async playCurrentWord() {
        if (!this.isPlaying) return;
        
        const currentWord = window.vocabularyManager.getCurrentWord(this.currentIndex);
        if (!currentWord) {
            this.handlePlaybackEnd();
            return;
        }

        try {
            // Emit word play start event
            window.eventBus.emit('audioControls:wordPlayStarted', {
                word: currentWord,
                index: this.currentIndex
            });

            // Update display for current word
            window.eventBus.emit('word:display', {
                word: currentWord,
                index: this.currentIndex
            });

            await this.handleWordRepetition(currentWord);
            
            if (this.isPlaying) {
                await this.scheduleNextWord();
            }
            
        } catch (error) {
            console.error('Error playing word:', error);
            window.progressTracker.showError('Error playing word');
        }
    }

    async handleWordRepetition(word) {
        const targetRepeats = window.ttsEngine.getTargetRepeats();
        
        for (let repeatCount = 0; repeatCount < targetRepeats; repeatCount++) {
            if (!this.isPlaying) break;
            
            // Update status to show current repetition
            if (targetRepeats > 1) {
                const statusMessage = `Playing... (${repeatCount + 1}/${targetRepeats})`;
                window.progressTracker.updateStatus(statusMessage);
            }
            
            await window.ttsEngine.pronounceWord(word, repeatCount);
            
            // Add delay between repetitions (except after last repetition)
            if (repeatCount < targetRepeats - 1 && this.isPlaying) {
                await this.wait(this.delay / 2); // Shorter delay between repetitions
            }
        }
    }

    async scheduleNextWord() {
        if (!this.isPlaying) return;
        
        // Wait for the configured delay before next word
        this.autoPlayTimeout = setTimeout(async () => {
            if (this.isPlaying) {
                this.advanceToNextWord();
                await this.playCurrentWord();
            }
        }, this.delay);
    }

    advanceToNextWord() {
        const totalWords = window.vocabularyManager.getTotalWords();
        
        this.currentIndex++;
        
        if (this.currentIndex >= totalWords) {
            if (this.repeatMode === 'loop') {
                // Loop back to beginning
                this.currentIndex = 0;
                window.progressTracker.updateStatus('🔄 All words completed! Starting over...');
            } else {
                // Check for auto-progression to next category
                this.handleCategoryCompletion();
                return;
            }
        }
    }

    handleCategoryCompletion() {
        const nextCategory = window.vocabularyManager.getNextCategory();
        
        if (nextCategory) {
            // Auto-advance to next category
            this.advanceToNextCategory(nextCategory);
        } else {
            // All categories completed
            this.handleAllCategoriesCompleted();
        }
    }

    advanceToNextCategory(nextCategory) {
        const currentCategoryName = window.vocabularyManager.getCategoryLabel(window.vocabularyManager.currentCategory);
        const nextCategoryName = window.vocabularyManager.getCategoryLabel(nextCategory);
        
        // Check for circular progression
        const isCircular = (window.vocabularyManager.currentCategory === 'travel-immigration' && nextCategory === 'social-welfare');
        
        if (isCircular) {
            window.progressTracker.updateStatus(`🔄 Full circle complete! Starting over with ${nextCategoryName}...`);
        } else {
            window.progressTracker.updateStatus(`🎉 ${currentCategoryName} completed! Moving to ${nextCategoryName}...`);
        }
        
        // Load next category and reset index
        window.vocabularyManager.loadCategory(nextCategory);
        this.currentIndex = 0;
        
        // Continue playing with new category
        setTimeout(async () => {
            if (this.isPlaying) {
                await this.playCurrentWord();
            }
        }, 2000);
    }

    handleAllCategoriesCompleted() {
        const totalWords = window.vocabularyManager.getTotalWords();
        window.progressTracker.updateStatus(`🏆 All topics completed! ${totalWords} words mastered!`);
        this.isPlaying = false;
        this.showPausedUI();
        
        // Emit completion event
        window.eventBus.emit('audioControls:allCategoriesCompleted', {
            totalWords
        });
    }

    nextWord() {
        const totalWords = window.vocabularyManager.getTotalWords();
        if (totalWords === 0) return;

        // Reset repeat count when manually navigating
        window.ttsEngine.currentRepeatCount = 0;

        this.currentIndex++;
        if (this.currentIndex >= totalWords) {
            // At end of current category - check if we can advance to next topic
            const nextCategory = window.vocabularyManager.getNextCategory();
            if (nextCategory) {
                this.advanceToNextCategory(nextCategory);
            } else {
                // Only "all-categories" reaches here - loop within same category
                this.currentIndex = 0;
            }
            return;
        }
        
        this.updateCurrentDisplay();
    }

    previousWord() {
        const totalWords = window.vocabularyManager.getTotalWords();
        if (totalWords === 0) return;

        // Reset repeat count when manually navigating
        window.ttsEngine.currentRepeatCount = 0;

        this.currentIndex--;
        if (this.currentIndex < 0) {
            // At beginning of current category - check if we can go to previous topic
            const prevCategory = window.vocabularyManager.getPreviousCategory();
            if (prevCategory) {
                this.advanceToPreviousCategory(prevCategory);
            } else {
                // Only "all-categories" reaches here - loop within same category
                this.currentIndex = totalWords - 1;
            }
            return;
        }
        
        this.updateCurrentDisplay();
    }

    advanceToPreviousCategory(prevCategory) {
        const currentCategoryName = window.vocabularyManager.getCategoryLabel(window.vocabularyManager.currentCategory);
        const prevCategoryName = window.vocabularyManager.getCategoryLabel(prevCategory);
        
        // Check for circular progression (reverse)
        const isCircular = (window.vocabularyManager.currentCategory === 'social-welfare' && prevCategory === 'travel-immigration');
        
        if (isCircular) {
            window.progressTracker.updateStatus(`🔄 Reverse circle complete! Going back to ${prevCategoryName}...`);
        } else {
            window.progressTracker.updateStatus(`⬅️ Moving back from ${currentCategoryName} to ${prevCategoryName}...`);
        }
        
        // Load previous category and set to last word
        window.vocabularyManager.loadCategory(prevCategory);
        this.currentIndex = window.vocabularyManager.getTotalWords() - 1;
        
        this.updateCurrentDisplay();
    }

    updateCurrentDisplay() {
        const currentWord = window.vocabularyManager.getCurrentWord(this.currentIndex);
        if (currentWord) {
            window.eventBus.emit('word:display', {
                word: currentWord,
                index: this.currentIndex
            });
        }
    }

    showPlayingUI() {
        document.getElementById('startBtn').style.display = 'none';
        document.getElementById('pauseBtn').style.display = 'inline-block';
    }

    showPausedUI() {
        document.getElementById('startBtn').style.display = 'inline-block';
        document.getElementById('pauseBtn').style.display = 'none';
    }

    setDelay(delay) {
        this.delay = parseInt(delay) || 2000;
        
        // Emit delay change event
        window.eventBus.emit('audioControls:delayChanged', {
            delay: this.delay
        });
    }

    setRepeatMode(mode) {
        this.repeatMode = mode;
        
        // Update TTS engine repeat settings
        const targetRepeats = {
            'once': 1,
            'individual': 2,
            'intensive': 3,
            'loop': 1
        }[mode] || 1;
        
        window.ttsEngine.setRepeatMode(targetRepeats);
        
        // Emit repeat mode change event
        window.eventBus.emit('audioControls:repeatModeChanged', {
            mode: this.repeatMode,
            targetRepeats
        });
    }

    getCurrentIndex() {
        return this.currentIndex;
    }

    setCurrentIndex(index) {
        this.currentIndex = Math.max(0, Math.min(index, window.vocabularyManager.getTotalWords() - 1));
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Global audio controls instance
window.audioControls = new AudioControls();