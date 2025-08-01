import type { Goals, TinyGoal } from '../types/goal';
import type { DailyTasks } from '../types/task';

export interface AIInsight {
  type: 'pattern' | 'recommendation' | 'motivation';
  title: string;
  content: string;
  confidence: number;
}

export interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
}

class AIService {
  private apiKey: string = '';
  private baseUrl = 'https://api.openai.com/v1';

  setApiKey(key: string): void {
    this.apiKey = key;
  }

  private async makeRequest(endpoint: string, data: any): Promise<AIResponse> {
    if (!this.apiKey) {
      return { success: false, error: 'API key not configured' };
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('AI Service Error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async synthesizeFocusFromBrainDump(brainDump: string): Promise<string> {
    const prompt = `From the following brain dump of tasks and thoughts, identify and phrase the single most important priority for today. Be concise and actionable. Focus on what would have the biggest impact.

Brain dump: "${brainDump}"

Respond with just the prioritized task, nothing else.`;

    const response = await this.makeRequest('/chat/completions', {
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a productivity coach that helps people identify their most important daily priority. Be concise and actionable.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    if (response.success && response.data?.choices?.[0]?.message?.content) {
      return response.data.choices[0].message.content.trim();
    }

    // Fallback suggestions if AI fails
    const fallbackSuggestions = [
      "Focus on the most urgent deadline today",
      "Work on the task that moves your biggest goal forward",
      "Complete the task you've been avoiding",
      "Tackle the most important item from your list",
    ];
    
    return fallbackSuggestions[Math.floor(Math.random() * fallbackSuggestions.length)];
  }

  async analyzePatterns(dailyTasks: DailyTasks, goals: Goals): Promise<AIInsight[]> {
    const completedTasks = Object.entries(dailyTasks)
      .filter(([_, task]) => task.completed)
      .map(([date, task]) => ({ date, task: task.text }));

    const prompt = `Analyze this user's task completion history and goals to provide insights:

Completed Tasks:
${completedTasks.map(t => `${t.date}: ${t.task}`).join('\n')}

Current Goals:
Personal: ${goals.personal.map(g => g.text).join(', ')}
Professional: ${goals.professional.map(g => g.text).join(', ')}

Provide 2-3 insights in JSON format with this structure:
[
  {
    "type": "pattern|recommendation|motivation",
    "title": "Brief title",
    "content": "Actionable insight",
    "confidence": 0.8
  }
]`;

    const response = await this.makeRequest('/chat/completions', {
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a productivity analyst. Provide insights in valid JSON format only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.5,
    });

    if (response.success && response.data?.choices?.[0]?.message?.content) {
      try {
        const insights = JSON.parse(response.data.choices[0].message.content);
        return Array.isArray(insights) ? insights : [];
      } catch {
        // JSON parsing failed, return fallback
      }
    }

    // Fallback insights
    return [
      {
        type: 'motivation',
        title: 'Keep Building Momentum',
        content: 'You\'re making progress! Focus on consistency to build lasting habits.',
        confidence: 0.7
      }
    ];
  }

  async breakdownGoal(goalText: string, targetDate?: string): Promise<string[]> {
    const prompt = `Break down this goal into 5-7 specific, actionable daily tasks:

Goal: ${goalText}
${targetDate ? `Target Date: ${targetDate}` : ''}

Provide tasks that are:
- Specific and measurable
- Can be completed in 1-2 hours
- Build progressively toward the goal

Respond with a JSON array of task strings only.`;

    const response = await this.makeRequest('/chat/completions', {
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a goal-setting expert. Provide responses in valid JSON array format only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.6,
    });

    if (response.success && response.data?.choices?.[0]?.message?.content) {
      try {
        const tasks = JSON.parse(response.data.choices[0].message.content);
        return Array.isArray(tasks) ? tasks : [];
      } catch {
        // JSON parsing failed, return fallback
      }
    }

    // Fallback breakdown
    return [
      "Research and plan the first steps",
      "Set up the necessary tools and resources",
      "Create a detailed timeline",
      "Start with the smallest actionable task",
      "Review progress and adjust approach"
    ];
  }

  async recommendPriority(
    goals: Goals, 
    recentTasks: DailyTasks, 
    tinyGoals: TinyGoal[]
  ): Promise<string> {
    const incompleteTinyGoals = tinyGoals.filter(g => !g.completedAt);
    const activeGoals = [
      ...goals.personal.filter(g => !g.completedAt),
      ...goals.professional.filter(g => !g.completedAt)
    ];

    const prompt = `Given this user's context, recommend the most important task for today:

Active Goals:
${activeGoals.map(g => `- ${g.text} (${g.progress}% complete)`).join('\n')}

Pending Tiny Goals:
${incompleteTinyGoals.map(g => `- ${g.text}`).join('\n')}

Recent Task Pattern:
${Object.entries(recentTasks).slice(-3).map(([date, task]) => 
  `${date}: ${task.text} (${task.completed ? 'completed' : 'incomplete'})`
).join('\n')}

Recommend ONE specific task that would have the biggest impact today. Be concise and actionable.`;

    const response = await this.makeRequest('/chat/completions', {
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a productivity coach. Recommend the single most impactful task for today.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 80,
      temperature: 0.7,
    });

    if (response.success && response.data?.choices?.[0]?.message?.content) {
      return response.data.choices[0].message.content.trim();
    }

    // Fallback recommendation
    if (activeGoals.length > 0) {
      const lowestProgress = activeGoals.reduce((min, goal) => 
        goal.progress < min.progress ? goal : min
      );
      return `Work on: ${lowestProgress.text}`;
    }

    return "Focus on your most important goal today";
  }
}

export const aiService = new AIService();
