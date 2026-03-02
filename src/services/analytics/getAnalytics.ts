/**
 * Typed accessor for the global analytics service.
 * Returns null when analytics is not initialized, avoiding `(window as any)` casts.
 */

import type { AnalyticsService } from './analyticsService';

export function getAnalytics(): AnalyticsService | null {
  if (typeof window !== 'undefined' && 'analyticsService' in window) {
    return (window as unknown as { analyticsService: AnalyticsService }).analyticsService;
  }
  return null;
}
