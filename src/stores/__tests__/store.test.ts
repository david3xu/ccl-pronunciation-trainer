/**
 * Tests for Zustand App Store
 *
 * Validates store slices: audio, tts, settings, vocabulary, progress, ui
 */

import { describe, expect, it, beforeEach } from 'vitest';
import { useAppStore } from '../index';
import type { VocabularyTerm } from '../../types/dataset.types';

const mockVocabItem: VocabularyTerm = {
  word: 'test',
  ipa: { british: '/test/', american: '/test/' },
  phonetic: { british: 'test', american: 'test' },
  difficulty: 'normal',
  category: 'pte-fib-listening',
};

const mockVocabItems: VocabularyTerm[] = [
  mockVocabItem,
  { ...mockVocabItem, word: 'hello', difficulty: 'easy' },
  { ...mockVocabItem, word: 'ubiquitous', difficulty: 'hard' },
];

describe('App Store', () => {
  beforeEach(() => {
    // Reset store to initial state
    const state = useAppStore.getState();
    state.vocabulary.clearDataset();
    state.progress.resetProgress();
    state.settings.resetSettings();
  });

  describe('Audio Slice', () => {
    it('should have correct initial state', () => {
      const { audio } = useAppStore.getState();
      expect(audio.isPlaying).toBe(false);
      expect(audio.isAutoPlaying).toBe(false);
      expect(audio.currentIndex).toBe(0);
      expect(audio.volume).toBe(1.0);
    });

    it('should start and stop auto-play', () => {
      const { audio } = useAppStore.getState();
      audio.startAutoPlay();
      expect(useAppStore.getState().audio.isAutoPlaying).toBe(true);
      expect(useAppStore.getState().audio.isPaused).toBe(false);

      audio.stopAutoPlay();
      expect(useAppStore.getState().audio.isAutoPlaying).toBe(false);
    });

    it('should pause and resume auto-play', () => {
      const { audio } = useAppStore.getState();
      audio.startAutoPlay();
      audio.pauseAutoPlay();
      expect(useAppStore.getState().audio.isPaused).toBe(true);

      audio.resumeAutoPlay();
      expect(useAppStore.getState().audio.isPaused).toBe(false);
    });

    it('should navigate next and previous', () => {
      const { audio } = useAppStore.getState();
      audio.navigateNext();
      expect(useAppStore.getState().audio.currentIndex).toBe(1);

      audio.navigateNext();
      expect(useAppStore.getState().audio.currentIndex).toBe(2);

      audio.navigatePrev();
      expect(useAppStore.getState().audio.currentIndex).toBe(1);
    });

    it('should not go below index 0', () => {
      const { audio } = useAppStore.getState();
      audio.navigatePrev();
      expect(useAppStore.getState().audio.currentIndex).toBe(0);
    });

    it('should toggle repeat mode', () => {
      const { audio } = useAppStore.getState();
      const initial = audio.repeatMode;
      audio.toggleRepeat();
      expect(useAppStore.getState().audio.repeatMode).toBe(!initial);
    });

    it('should clamp volume between 0 and 1', () => {
      const { audio } = useAppStore.getState();
      audio.setVolume(1.5);
      expect(useAppStore.getState().audio.volume).toBe(1.0);

      audio.setVolume(-0.5);
      expect(useAppStore.getState().audio.volume).toBe(0);
    });
  });

  describe('Settings Slice', () => {
    it('should have correct initial state', () => {
      const { settings } = useAppStore.getState();
      expect(settings.practiceType).toBe('vocabulary');
      expect(settings.vocabularyBook).toBe('pte-fib-listening');
      expect(settings.difficultyFilter).toBe('all');
      expect(settings.ttsRate).toBe(1.0);
    });

    it('should update individual settings', () => {
      const { settings } = useAppStore.getState();
      settings.updateSetting('ttsRate', 1.5);
      expect(useAppStore.getState().settings.ttsRate).toBe(1.5);

      settings.updateSetting('vocabularyBook', 'pte-advanced');
      expect(useAppStore.getState().settings.vocabularyBook).toBe('pte-advanced');
    });

    it('should reset settings to defaults', () => {
      const { settings } = useAppStore.getState();
      settings.updateSetting('ttsRate', 2.0);
      settings.updateSetting('vocabularyBook', 'pte-advanced');
      settings.resetSettings();

      const reset = useAppStore.getState().settings;
      expect(reset.ttsRate).toBe(1.0);
      expect(reset.vocabularyBook).toBe('pte-fib-listening');
    });

    it('should toggle panel open/close', () => {
      const { settings } = useAppStore.getState();
      expect(settings.isPanelOpen).toBe(false);
      settings.togglePanel();
      expect(useAppStore.getState().settings.isPanelOpen).toBe(true);
      settings.togglePanel();
      expect(useAppStore.getState().settings.isPanelOpen).toBe(false);
    });
  });

  describe('Vocabulary Slice', () => {
    it('should set dataset and auto-select first item', () => {
      const { vocabulary } = useAppStore.getState();
      vocabulary.setDataset(mockVocabItems, 'pte-fib-listening');

      const state = useAppStore.getState().vocabulary;
      expect(state.currentDataset).toHaveLength(3);
      expect(state.filteredDataset).toHaveLength(3);
      expect(state.currentItem).toEqual(mockVocabItems[0]);
      expect(state.mode).toBe('pte-fib-listening');
      expect(state.totalCount).toBe(3);
    });

    it('should filter by difficulty', () => {
      const { vocabulary } = useAppStore.getState();
      vocabulary.setDataset(mockVocabItems, 'test');
      vocabulary.filterByDifficulty('easy');

      const state = useAppStore.getState().vocabulary;
      expect(state.filteredDataset).toHaveLength(1);
      expect(state.filteredDataset[0]).toEqual(mockVocabItems[1]);
    });

    it('should show all when filter is "all"', () => {
      const { vocabulary } = useAppStore.getState();
      vocabulary.setDataset(mockVocabItems, 'test');
      vocabulary.filterByDifficulty('hard');
      vocabulary.filterByDifficulty('all');

      expect(useAppStore.getState().vocabulary.filteredDataset).toHaveLength(3);
    });

    it('should clear dataset', () => {
      const { vocabulary } = useAppStore.getState();
      vocabulary.setDataset(mockVocabItems, 'test');
      vocabulary.clearDataset();

      const state = useAppStore.getState().vocabulary;
      expect(state.currentDataset).toHaveLength(0);
      expect(state.currentItem).toBeNull();
      expect(state.mode).toBe('');
    });
  });

  describe('Progress Slice', () => {
    it('should mark items completed and track accuracy', () => {
      const { progress } = useAppStore.getState();
      progress.markItemCompleted('item-1', true);
      progress.markItemCompleted('item-2', false);
      progress.markItemCompleted('item-3', true);

      const state = useAppStore.getState().progress;
      expect(state.completedItems.size).toBe(3);
      expect(state.itemsCompleted).toBe(3);
      expect(state.itemsCorrect).toBe(2);
      expect(state.accuracy).toBeCloseTo(66.67, 1);
    });

    it('should start and end sessions', () => {
      const { progress } = useAppStore.getState();
      progress.startSession();
      expect(useAppStore.getState().progress.sessionStartTime).not.toBeNull();

      progress.endSession();
      expect(useAppStore.getState().progress.sessionStartTime).toBeNull();
    });

    it('should reset progress', () => {
      const { progress } = useAppStore.getState();
      progress.markItemCompleted('item-1', true);
      progress.resetProgress();

      const state = useAppStore.getState().progress;
      expect(state.completedItems.size).toBe(0);
      expect(state.itemsCompleted).toBe(0);
      expect(state.accuracy).toBe(0);
    });
  });

  describe('UI Slice', () => {
    it('should show and hide notifications', () => {
      const { ui } = useAppStore.getState();
      ui.showNotification('Test message', 'success');

      const notif = useAppStore.getState().ui.notification;
      expect(notif?.message).toBe('Test message');
      expect(notif?.type).toBe('success');

      ui.hideNotification();
      expect(useAppStore.getState().ui.notification).toBeNull();
    });

    it('should toggle content visibility', () => {
      const { ui } = useAppStore.getState();
      ui.setContentVisible(false);
      expect(useAppStore.getState().ui.isContentVisible).toBe(false);
    });
  });
});
