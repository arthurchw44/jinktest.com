// src/services/dictationService.ts

import type { DictationSession, FragmentProgress } from '../types/dictation.types' ;

export interface SessionAnalytics {
  totalTimeSpent: number; // seconds
  averageScore: number; // 0-1
  fragmentsCompleted: number;
  totalFragments: number;
  completionRate: number; // 0-1
  averageAttemptsPerFragment: number;
  difficultFragments: FragmentProgress[]; // fragments with low scores or many attempts
  strengths: string[];
  improvements: string[];
}

export class DictationService {
  /**
   * Calculate comprehensive analytics for a dictation session
   */
  static analyzeSession(session: DictationSession): SessionAnalytics {
    const { progress } = session;
    const totalFragments = progress.length;
    const completedFragments = progress.filter(p => p.status !== 'pending').length;
    
    // Time and score calculations
    const totalTimeSpent = progress.reduce((sum, p) => sum + p.timeSpent, 0);
    const averageScore = totalFragments > 0 
      ? progress.reduce((sum, p) => sum + p.bestScore, 0) / totalFragments 
      : 0;
    
    // Attempt analysis
    const totalAttempts = progress.reduce((sum, p) => sum + p.attempts.length, 0);
    const averageAttemptsPerFragment = completedFragments > 0 
      ? totalAttempts / completedFragments 
      : 0;

    // Identify difficult fragments (score < 0.7 or attempts > 3)
    const difficultFragments = progress.filter(p => 
      p.bestScore < 0.7 || p.attempts.length > 3
    );

    // Generate strengths and improvement suggestions
    const strengths: string[] = [];
    const improvements: string[] = [];

    if (averageScore >= 0.9) {
      strengths.push("Excellent listening comprehension");
    } else if (averageScore >= 0.7) {
      strengths.push("Good overall understanding");
    }

    if (averageAttemptsPerFragment <= 2) {
      strengths.push("Quick learning and adaptation");
    }

    if (averageScore < 0.6) {
      improvements.push("Focus on listening for key words");
    }

    if (averageAttemptsPerFragment > 4) {
      improvements.push("Try slowing down audio playback speed");
    }

    if (difficultFragments.length > totalFragments * 0.3) {
      improvements.push("Consider reviewing vocabulary before practice");
    }

    return {
      totalTimeSpent,
      averageScore,
      fragmentsCompleted: completedFragments,
      totalFragments,
      completionRate: completedFragments / totalFragments,
      averageAttemptsPerFragment,
      difficultFragments,
      strengths,
      improvements
    };
  }

  /**
   * Format time in minutes and seconds
   */
  static formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes === 0) {
      return `${remainingSeconds}s`;
    }
    
    return `${minutes}m ${remainingSeconds}s`;
  }

  /**
   * Get performance level based on score
   */
  static getPerformanceLevel(score: number): {
    level: string;
    color: string;
    description: string;
  } {
    if (score >= 0.95) {
      return {
        level: 'Excellent',
        color: 'text-green-600 bg-green-100',
        description: 'Outstanding performance!'
      };
    } else if (score >= 0.85) {
      return {
        level: 'Very Good',
        color: 'text-blue-600 bg-blue-100',
        description: 'Great job with minor errors'
      };
    } else if (score >= 0.70) {
      return {
        level: 'Good',
        color: 'text-yellow-600 bg-yellow-100',
        description: 'Good understanding, room for improvement'
      };
    } else if (score >= 0.50) {
      return {
        level: 'Fair',
        color: 'text-orange-600 bg-orange-100',
        description: 'Needs more practice'
      };
    } else {
      return {
        level: 'Needs Improvement',
        color: 'text-red-600 bg-red-100',
        description: 'Consider reviewing the material'
      };
    }
  }

  /**
   * Calculate accuracy trend across fragments
   */
  static getAccuracyTrend(progress: FragmentProgress[]): {
    trend: 'improving' | 'declining' | 'stable';
    trendValue: number; // -1 to 1, where positive means improving
  } {
    if (progress.length < 3) {
      return { trend: 'stable', trendValue: 0 };
    }

    const scores = progress
      .filter(p => p.status !== 'pending')
      .map(p => p.bestScore);

    if (scores.length < 3) {
      return { trend: 'stable', trendValue: 0 };
    }

    // Simple trend calculation: compare first half with second half
    const midpoint = Math.floor(scores.length / 2);
    const firstHalf = scores.slice(0, midpoint);
    const secondHalf = scores.slice(midpoint);

    const firstHalfAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;

    const trendValue = secondHalfAvg - firstHalfAvg;

    if (trendValue > 0.1) {
      return { trend: 'improving', trendValue };
    } else if (trendValue < -0.1) {
      return { trend: 'declining', trendValue };
    } else {
      return { trend: 'stable', trendValue };
    }
  }

  /**
   * Generate personalized recommendations
   */
  static getRecommendations(session: DictationSession): string[] {
    const analytics = this.analyzeSession(session);
    const recommendations: string[] = [];

    // Score-based recommendations
    if (analytics.averageScore < 0.6) {
      recommendations.push("Try using a slower playback speed (0.75x) to better catch each word");
      recommendations.push("Focus on listening to one word at a time rather than trying to catch everything");
    }

    // Attempt-based recommendations  
    if (analytics.averageAttemptsPerFragment > 4) {
      recommendations.push("Consider reading the article text first to familiarize yourself with the vocabulary");
      recommendations.push("Practice with shorter fragments to build confidence");
    }

    // Time-based recommendations
    const avgTimePerFragment = analytics.totalTimeSpent / analytics.fragmentsCompleted;
    if (avgTimePerFragment > 120) { // More than 2 minutes per fragment
      recommendations.push("Try to trust your first instinct more - overthinking can sometimes hurt performance");
    }

    // Difficulty-based recommendations
    if (analytics.difficultFragments.length > analytics.totalFragments * 0.4) {
      recommendations.push("This article might be challenging - consider starting with an easier difficulty level");
      recommendations.push("Focus on understanding the main idea rather than every single word");
    }

    // Positive reinforcements
    if (analytics.averageScore >= 0.8) {
      recommendations.push("Great work! Try challenging yourself with faster playback speeds");
    }

    if (analytics.completionRate === 1 && analytics.averageScore >= 0.7) {
      recommendations.push("Excellent persistence! You completed the entire article with good accuracy");
    }

    return recommendations.slice(0, 3); // Return top 3 recommendations
  }
}
