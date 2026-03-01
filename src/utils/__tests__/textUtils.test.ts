/**
 * Tests for Text Utilities
 */

import { describe, expect, it } from 'vitest';
import { cleanText } from '../textUtils';

describe('cleanText', () => {
  it('should remove markdown bold syntax', () => {
    expect(cleanText('**bold** text')).toBe('bold text');
  });

  it('should remove markdown italic syntax', () => {
    expect(cleanText('*italic* text')).toBe('italic text');
  });

  it('should handle empty string', () => {
    expect(cleanText('')).toBe('');
  });

  it('should return plain text unchanged', () => {
    expect(cleanText('hello world')).toBe('hello world');
  });

  it('should handle multiple markdown patterns', () => {
    const result = cleanText('**bold** and *italic* and __underline__');
    expect(result).not.toContain('**');
    expect(result).not.toContain('__');
  });
});
