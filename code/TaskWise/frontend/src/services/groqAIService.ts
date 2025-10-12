// 🚀 Groq AI Service - FREE & LIGHTNING FAST!
// Groq provides ultra-fast AI inference (30x faster than OpenAI!)
// Free Tier: 30 requests/min, 14,400 requests/day - Perfect for TaskWise!

interface AITaskBreakdown {
  subtasks: string[];
  estimatedTime?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface AITaskPriority {
  priority: 'high' | 'medium' | 'low';
  reasoning: string;
  urgencyScore: number;
}

interface AIProductivityInsight {
  insight: string;
  suggestions: string[];
  productivityScore: number;
}

// Groq Configuration
const GROQ_API_KEY = (import.meta.env?.VITE_GROQ_API_KEY as string) || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Available Groq models (all FREE on free tier!)
const GROQ_MODELS = {
  FAST: 'llama-3.1-8b-instant',        // Fastest - perfect for quick responses
  SMART: 'mixtral-8x7b-32768',         // Best balance of speed & intelligence  
  POWERFUL: 'llama-3.1-70b-versatile', // Most capable - for complex tasks
};

class GroqAIService {
  private useRealAI: boolean;
  private model: string;

  constructor() {
    this.useRealAI = !!GROQ_API_KEY;
    this.model = GROQ_MODELS.SMART; // Default to best balance
    
    if (!this.useRealAI) {
      console.log('💡 Running in Demo Mode. Get FREE Groq API key at: https://console.groq.com');
    } else {
      console.log('🚀 Groq AI activated! Lightning-fast responses enabled.');
    }
  }

  // Generic Groq API call
  private async callGroq(systemPrompt: string, userPrompt: string): Promise<string> {
    if (!this.useRealAI) {
      return this.getMockResponse(userPrompt);
    }

    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500,
          top_p: 1,
          stream: false,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Groq API error: ${response.statusText} - ${error}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Groq API error:', error);
      // Graceful fallback to mock
      return this.getMockResponse(userPrompt);
    }
  }

  // 1. AI Task Breakdown - Break complex tasks into subtasks
  async breakdownTask(title: string, description: string): Promise<AITaskBreakdown> {
    const systemPrompt = `You are an expert task breakdown assistant. Break down tasks into clear, actionable subtasks. 
Each subtask should be specific and completable in one sitting. Return ONLY a JSON object with this structure:
{
  "subtasks": ["step 1", "step 2", ...],
  "estimatedTime": "X hours",
  "difficulty": "easy|medium|hard"
}`;

    const userPrompt = `Break down this task:
Title: ${title}
Description: ${description}

Provide 5-8 concrete, actionable subtasks.`;

    try {
      const response = await this.callGroq(systemPrompt, userPrompt);
      
      // Parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // If real AI returns invalid JSON, use mock
      return this.getMockBreakdown(title, description);
    } catch (error) {
      console.error('Error parsing breakdown:', error);
      return this.getMockBreakdown(title, description);
    }
  }

  // 2. AI Task Prioritization - Intelligently prioritize tasks
  async prioritizeTask(
    title: string, 
    description: string, 
    dueDate?: string,
    dependencies?: string[]
  ): Promise<AITaskPriority> {
    const systemPrompt = `You are a productivity expert. Analyze tasks and provide intelligent priority recommendations.
Return ONLY a JSON object with this structure:
{
  "priority": "high|medium|low",
  "reasoning": "brief explanation",
  "urgencyScore": 1-10
}`;

    const userPrompt = `Analyze this task:
Title: ${title}
Description: ${description}
Due Date: ${dueDate || 'Not set'}
Dependencies: ${dependencies?.join(', ') || 'None'}

Determine priority based on urgency, importance, and impact.`;

    try {
      const response = await this.callGroq(systemPrompt, userPrompt);
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return this.getMockPriority(title);
    } catch (error) {
      console.error('Error parsing priority:', error);
      return this.getMockPriority(title);
    }
  }

  // 3. AI Productivity Insights - Analyze patterns and give advice
  async getProductivityInsights(
    completedTasks: number,
    averageCompletionTime: number,
    missedDeadlines: number
  ): Promise<AIProductivityInsight> {
    const systemPrompt = `You are a productivity coach. Analyze user performance and provide actionable insights.
Return ONLY a JSON object with this structure:
{
  "insight": "main insight in 1-2 sentences",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "productivityScore": 1-100
}`;

    const userPrompt = `Analyze this productivity data:
- Completed Tasks: ${completedTasks}
- Average Completion Time: ${averageCompletionTime} minutes
- Missed Deadlines: ${missedDeadlines}

Provide insights and actionable suggestions to improve.`;

    try {
      const response = await this.callGroq(systemPrompt, userPrompt);
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return this.getMockInsights(completedTasks, missedDeadlines);
    } catch (error) {
      console.error('Error parsing insights:', error);
      return this.getMockInsights(completedTasks, missedDeadlines);
    }
  }

  // 4. Smart Task Generation - Create task from natural language
  async generateTaskFromText(naturalLanguage: string): Promise<{
    title: string;
    description: string;
    priority: string;
    dueDate?: string;
    tags: string[];
  }> {
    const systemPrompt = `You are a task creation assistant. Convert natural language into structured tasks.
Return ONLY a JSON object with this structure:
{
  "title": "clear task title",
  "description": "detailed description",
  "priority": "high|medium|low",
  "dueDate": "YYYY-MM-DD or null",
  "tags": ["tag1", "tag2"]
}`;

    const userPrompt = `Convert this to a structured task:
"${naturalLanguage}"`;

    try {
      const response = await this.callGroq(systemPrompt, userPrompt);
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return this.getMockTask(naturalLanguage);
    } catch (error) {
      console.error('Error parsing task:', error);
      return this.getMockTask(naturalLanguage);
    }
  }

  // Mock Responses (when no API key or AI fails)
  private getMockResponse(_prompt: string): string {
    return 'Demo mode active. Get your FREE Groq API key at https://console.groq.com to enable real AI!';
  }

  private getMockBreakdown(title: string, description: string): AITaskBreakdown {
    // Intelligent keyword-based breakdown
    const lower = (title + ' ' + description).toLowerCase();
    
    if (lower.includes('website') || lower.includes('web app')) {
      return {
        subtasks: [
          'Set up project structure and version control',
          'Design wireframes and user interface mockups',
          'Implement frontend components and styling',
          'Set up backend server and database',
          'Integrate frontend with backend APIs',
          'Write unit and integration tests',
          'Deploy to production environment'
        ],
        estimatedTime: '2-3 weeks',
        difficulty: 'hard'
      };
    }
    
    if (lower.includes('bug') || lower.includes('fix') || lower.includes('error')) {
      return {
        subtasks: [
          'Reproduce the bug in development environment',
          'Debug and identify root cause',
          'Implement fix and verify solution',
          'Write regression tests',
          'Code review and testing',
          'Deploy fix to production'
        ],
        estimatedTime: '4-8 hours',
        difficulty: 'medium'
      };
    }
    
    if (lower.includes('report') || lower.includes('document') || lower.includes('presentation')) {
      return {
        subtasks: [
          'Research and gather required data',
          'Create outline and structure',
          'Write first draft',
          'Create charts and visuals',
          'Edit and proofread content',
          'Get feedback from stakeholders',
          'Finalize and format document'
        ],
        estimatedTime: '1-2 weeks',
        difficulty: 'medium'
      };
    }
    
    if (lower.includes('learn') || lower.includes('study') || lower.includes('course')) {
      return {
        subtasks: [
          'Find quality learning resources',
          'Set up development environment',
          'Complete introductory tutorials',
          'Build practice projects',
          'Review and take notes',
          'Join community forums',
          'Apply knowledge to real project'
        ],
        estimatedTime: '2-4 weeks',
        difficulty: 'medium'
      };
    }
    
    // Generic breakdown
    return {
      subtasks: [
        'Research and plan approach',
        'Break down into smaller components',
        'Start with core functionality',
        'Test and iterate on solution',
        'Review and finalize work'
      ],
      estimatedTime: '1-2 weeks',
      difficulty: 'medium'
    };
  }

  private getMockPriority(title: string): AITaskPriority {
    const lower = title.toLowerCase();
    
    if (lower.includes('urgent') || lower.includes('asap') || lower.includes('critical')) {
      return {
        priority: 'high',
        reasoning: 'Contains urgent keywords and requires immediate attention',
        urgencyScore: 9
      };
    }
    
    if (lower.includes('bug') || lower.includes('fix') || lower.includes('error')) {
      return {
        priority: 'high',
        reasoning: 'Bug fixes should be addressed quickly to prevent user impact',
        urgencyScore: 8
      };
    }
    
    if (lower.includes('feature') || lower.includes('implement') || lower.includes('add')) {
      return {
        priority: 'medium',
        reasoning: 'Feature development is important but can be planned',
        urgencyScore: 5
      };
    }
    
    return {
      priority: 'medium',
      reasoning: 'Standard task that should be completed in normal workflow',
      urgencyScore: 5
    };
  }

  private getMockInsights(completed: number, missed: number): AIProductivityInsight {
    const score = Math.max(0, Math.min(100, (completed * 10) - (missed * 20)));
    
    return {
      insight: `You completed ${completed} tasks with ${missed} missed deadlines. ${score > 70 ? 'Great work!' : 'Room for improvement.'}`,
      suggestions: [
        'Break large tasks into smaller, manageable subtasks',
        'Use the Pomodoro timer to maintain focus',
        'Review and adjust priorities daily',
        'Set realistic deadlines based on your pace'
      ],
      productivityScore: score
    };
  }

  private getMockTask(text: string): any {
    return {
      title: text.slice(0, 50),
      description: text,
      priority: 'medium',
      dueDate: null,
      tags: ['ai-generated']
    };
  }

  // Check if real AI is available
  isRealAIEnabled(): boolean {
    return this.useRealAI;
  }

  // Get API status and info
  getAPIInfo(): {
    provider: string;
    model: string;
    enabled: boolean;
    freeLimit: string;
    speed: string;
  } {
    return {
      provider: 'Groq',
      model: this.model,
      enabled: this.useRealAI,
      freeLimit: '14,400 requests/day (30 per minute)',
      speed: 'Ultra-fast (30x faster than OpenAI!)'
    };
  }
}

// Export singleton instance
export const groqAI = new GroqAIService();
export default groqAI;
