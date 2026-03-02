/**
 * AI Recommendation Service
 *
 * Calls the server-side /api/ai-recommendations endpoint which holds the
 * Gemini API key. No API keys are exposed to the browser.
 */

export interface UserProgress {
  completedItems: number;
  totalItems: number;
  accuracy: number;
  weakAreas: {
    word: string;
    attempts: number;
    correctAttempts: number;
    difficulty: string;
    category: string;
  }[];
  recentActivity: {
    practiceMode: string;
    itemsCompleted: number;
    date: string;
  }[];
}

export interface Recommendation {
  type: 'vocabulary' | 'practice';
  priority: 'high' | 'medium' | 'low';
  category: string;
  practiceMode?: string;
  reason: string;
  specificItems?: string[];
  estimatedTime?: string;
}

function mapDifficultyToPriority(difficulty: string | undefined): 'high' | 'medium' | 'low' {
  switch (difficulty) {
    case 'hard': return 'high';
    case 'easy': return 'low';
    default: return 'medium';
  }
}

/**
 * Generate personalized recommendations via the server-side API.
 * The server holds the Gemini API key — nothing is exposed to the client.
 */
export async function generateRecommendations(
  userProgress: UserProgress,
): Promise<Recommendation[]> {
  try {
    const response = await fetch('/api/ai-recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'current',
        currentAccuracy: userProgress.accuracy,
        completedItems: Array.from({ length: userProgress.completedItems }, (_, i) => `item-${i}`),
        currentMode: 'vocabulary',
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.success && Array.isArray(result.data)) {
      return result.data.map((item: Record<string, unknown>) => ({
        type: (item['type'] as string) || 'vocabulary',
        priority: mapDifficultyToPriority(item['difficulty'] as string),
        category: (item['category'] as string) || 'pte-intermediate',
        practiceMode: item['practiceMode'] as string | undefined,
        reason: (item['reason'] as string) || 'Recommended for your progress level',
        specificItems: item['word'] ? [item['word'] as string] : (item['specificItems'] as string[] | undefined),
        estimatedTime: (item['estimatedTime'] as string) || '10 minutes',
      }));
    }

    return getFallbackRecommendations(userProgress);
  } catch {
    return getFallbackRecommendations(userProgress);
  }
}

function getFallbackRecommendations(userProgress: UserProgress): Recommendation[] {
  const recommendations: Recommendation[] = [];

  if (userProgress.accuracy < 0.6) {
    recommendations.push({
      type: 'vocabulary',
      priority: 'high',
      category: 'pte-beginner',
      reason: 'Your current accuracy is below 60%. Build a strong foundation with beginner vocabulary.',
      estimatedTime: '10-15 minutes',
    });
  }

  recommendations.push({
    type: 'vocabulary',
    priority: 'medium',
    category: 'pte-intermediate',
    reason: 'Continue building your vocabulary with intermediate-level words.',
    estimatedTime: '10 minutes',
  });

  recommendations.push({
    type: 'practice',
    priority: 'medium',
    category: 'pte-rs',
    practiceMode: 'rs',
    reason: 'Try Repeat Sentence practice to improve listening and speaking.',
    estimatedTime: '10 minutes',
  });

  return recommendations.slice(0, 5);
}
