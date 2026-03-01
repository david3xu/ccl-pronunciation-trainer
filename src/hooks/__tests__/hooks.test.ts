/**
 * Tests for Custom Hooks
 *
 * Tests useBreakpoint and useSwipeGesture hooks.
 */

import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSwipeGesture } from '../useSwipeGesture';

describe('useSwipeGesture', () => {
  it('should return touch event handlers', () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();

    const { result } = renderHook(() =>
      useSwipeGesture({ onSwipeLeft, onSwipeRight, threshold: 50 })
    );

    expect(result.current.handlers).toBeDefined();
    expect(result.current.handlers.onTouchStart).toBeDefined();
    expect(result.current.handlers.onTouchEnd).toBeDefined();
  });
});
