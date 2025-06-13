import { VibeScore, SemanticAnalysis } from '@/types/EventGraph';

/**
 * Service for handling semantic analysis of events using LLM
 */
export class SemanticAnalysisService {
  /**
   * Analyze event description to generate semantic vector and vibe score
   */
  static async analyzeEvent(description: string): Promise<SemanticAnalysis> {
    try {
      // TODO: Replace with actual LLM API call
      // This is a placeholder that would be replaced with actual LLM integration
      const prompt = `
        Analyze this event description and provide:
        1. A semantic vector capturing the event's meaning
        2. A vibe score with the following dimensions:
           - energy (0-1): How energetic is the event?
           - formality (0-1): How formal is the event?
           - social (0-1): How social/interactive is the event?
           - artistic (0-1): How artistic/creative is the event?
           - outdoor (0-1): How outdoor-focused is the event?
        3. A confidence score (0-1) in this analysis

        Event description: ${description}
      `;

      // Placeholder response - would be replaced with actual LLM response
      return {
        vector: Array(384).fill(0).map(() => Math.random()), // Placeholder vector
        vibeScore: {
          energy: 0.7,
          formality: 0.3,
          social: 0.8,
          artistic: 0.6,
          outdoor: 0.4
        },
        confidence: 0.9
      };
    } catch (error) {
      console.error('Error in semantic analysis:', error);
      throw error;
    }
  }

  /**
   * Calculate similarity between two events based on semantic analysis
   */
  static calculateEventSimilarity(
    event1: SemanticAnalysis,
    event2: SemanticAnalysis
  ): {
    semanticSimilarity: number;
    vibeSimilarity: number;
    overallSimilarity: number;
  } {
    // Calculate vector similarity using cosine similarity
    const semanticSimilarity = this.cosineSimilarity(event1.vector, event2.vector);

    // Calculate vibe similarity using weighted average of differences
    const vibeSimilarity = this.calculateVibeSimilarity(event1.vibeScore, event2.vibeScore);

    // Combine similarities with weights
    const overallSimilarity = (semanticSimilarity * 0.6) + (vibeSimilarity * 0.4);

    return {
      semanticSimilarity,
      vibeSimilarity,
      overallSimilarity
    };
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private static cosineSimilarity(vec1: number[], vec2: number[]): number {
    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
    const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * Calculate similarity between two vibe scores
   */
  private static calculateVibeSimilarity(vibe1: VibeScore, vibe2: VibeScore): number {
    const weights = {
      energy: 0.3,
      formality: 0.2,
      social: 0.2,
      artistic: 0.15,
      outdoor: 0.15
    };

    const differences = {
      energy: Math.abs(vibe1.energy - vibe2.energy),
      formality: Math.abs(vibe1.formality - vibe2.formality),
      social: Math.abs(vibe1.social - vibe2.social),
      artistic: Math.abs(vibe1.artistic - vibe2.artistic),
      outdoor: Math.abs(vibe1.outdoor - vibe2.outdoor)
    };

    // Convert differences to similarities (1 - difference)
    const similarities = Object.entries(differences).reduce((sum, [key, diff]) => {
      return sum + (1 - diff) * weights[key as keyof VibeScore];
    }, 0);

    return similarities;
  }
} 