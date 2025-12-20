/**
 * Text Tokenizer (v3.4.0)
 * Phase 4 Task 9.1: Tokenization for full-text search
 */

/**
 * Tokenizer options
 */
export interface TokenizerOptions {
  /**
   * Convert to lowercase
   */
  lowercase: boolean;

  /**
   * Remove stop words
   */
  removeStopWords: boolean;

  /**
   * Apply stemming
   */
  enableStemming: boolean;

  /**
   * Minimum token length
   */
  minLength: number;

  /**
   * Maximum token length
   */
  maxLength: number;
}

/**
 * Default tokenizer options
 */
export const DEFAULT_TOKENIZER_OPTIONS: TokenizerOptions = {
  lowercase: true,
  removeStopWords: true,
  enableStemming: true,
  minLength: 2,
  maxLength: 50,
};

/**
 * Common English stop words
 */
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'will', 'with', 'but', 'or', 'not', 'this', 'can',
  'have', 'had', 'been', 'were', 'what', 'when', 'where', 'who',
  'which', 'their', 'would', 'there', 'could', 'should'
]);

/**
 * Text tokenizer for full-text search
 */
export class Tokenizer {
  private options: TokenizerOptions;

  constructor(options: Partial<TokenizerOptions> = {}) {
    this.options = { ...DEFAULT_TOKENIZER_OPTIONS, ...options };
  }

  /**
   * Tokenize text into words
   */
  tokenize(text: string): string[] {
    if (!text || text.trim() === '') {
      return [];
    }

    // Convert to lowercase if enabled
    const processed = this.options.lowercase ? text.toLowerCase() : text;

    // Split on word boundaries
    const tokens = processed.match(/\b\w+\b/g) || [];

    // Apply filters
    return tokens
      .filter(token => {
        // Length filter
        if (token.length < this.options.minLength || token.length > this.options.maxLength) {
          return false;
        }

        // Stop words filter
        if (this.options.removeStopWords && STOP_WORDS.has(token)) {
          return false;
        }

        return true;
      })
      .map(token => {
        // Apply stemming if enabled
        return this.options.enableStemming ? this.stem(token) : token;
      });
  }

  /**
   * Simple Porter stemmer (simplified version)
   */
  private stem(word: string): string {
    // Very simplified stemming rules
    let stemmed = word;

    // Remove common suffixes
    if (stemmed.endsWith('ing') && stemmed.length > 5) {
      stemmed = stemmed.slice(0, -3);
    } else if (stemmed.endsWith('ed') && stemmed.length > 4) {
      stemmed = stemmed.slice(0, -2);
    } else if (stemmed.endsWith('ly') && stemmed.length > 4) {
      stemmed = stemmed.slice(0, -2);
    } else if (stemmed.endsWith('ies') && stemmed.length > 5) {
      stemmed = stemmed.slice(0, -3) + 'y';
    } else if (stemmed.endsWith('es') && stemmed.length > 4) {
      stemmed = stemmed.slice(0, -2);
    } else if (stemmed.endsWith('s') && stemmed.length > 3 && !stemmed.endsWith('ss')) {
      stemmed = stemmed.slice(0, -1);
    }

    return stemmed;
  }

  /**
   * Get token frequency from text
   */
  getTokenFrequency(text: string): Map<string, number> {
    const tokens = this.tokenize(text);
    const frequency = new Map<string, number>();

    for (const token of tokens) {
      frequency.set(token, (frequency.get(token) || 0) + 1);
    }

    return frequency;
  }

  /**
   * Get unique tokens from text
   */
  getUniqueTokens(text: string): Set<string> {
    return new Set(this.tokenize(text));
  }
}
