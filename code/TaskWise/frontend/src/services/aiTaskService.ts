// AI Task Intelligence Service
import axios from 'axios';

// Get API key from environment variable
const OPENAI_API_KEY = import.meta.env?.VITE_OPENAI_API_KEY || '';

interface Task {
  title: string;
  description: string;
  priority: string;
  dueDate?: string;
  status: string;
  estimatedTime?: number;
}

interface AIRecommendation {
  taskId: string;
  urgencyScore: number;
  suggestedTime: string;
  reasoning: string;
  estimatedDuration: number;
}

export const aiTaskService = {
  // Analyze tasks and provide intelligent recommendations
  analyzeAndPrioritize: async (tasks: Task[]): Promise<AIRecommendation[]> => {
    try {
      // You can use OpenAI, Google Gemini, or any other AI API
      const prompt = `
You are an AI productivity assistant. Analyze these tasks and provide intelligent recommendations.

Tasks:
${tasks.map((t, i) => `
${i + 1}. ${t.title}
   Description: ${t.description}
   Priority: ${t.priority}
   Due Date: ${t.dueDate || 'None'}
   Status: ${t.status}
`).join('\n')}

Provide:
1. Urgency score (1-10) for each task
2. Best time to work on it (morning/afternoon/evening)
3. Estimated time to complete (in minutes)
4. Brief reasoning

Format as JSON array with: taskId, urgencyScore, suggestedTime, reasoning, estimatedDuration
      `;

      // Example using OpenAI (you'll need API key)
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a productivity expert AI assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const aiResponse = response.data.choices[0].message.content;
      return JSON.parse(aiResponse);
    } catch (error) {
      console.error('AI analysis error:', error);
      throw error;
    }
  },

  // Generate task breakdown using AI
  breakdownTask: async (taskTitle: string, taskDescription: string) => {
    const prompt = `
Break down this complex task into smaller, actionable subtasks:

Task: ${taskTitle}
Description: ${taskDescription}

Provide 3-5 concrete subtasks with estimated time for each.
Format as JSON array with: subtask (string), estimatedMinutes (number)
    `;

    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.VITE_OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
      console.error('Task breakdown error:', error);
      throw error;
    }
  },

  // AI-powered task suggestions based on context
  suggestNextTask: async (completedTasks: Task[], currentTime: string, userEnergy: string) => {
    const prompt = `
Based on these completed tasks and current context, suggest the best next task:

Recently Completed:
${completedTasks.slice(-5).map(t => `- ${t.title}`).join('\n')}

Current Time: ${currentTime}
User Energy Level: ${userEnergy}

Suggest what type of task would be most productive now and why.
    `;

    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }]
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.VITE_OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Suggestion error:', error);
      throw error;
    }
  },

  // Smart task title and description generation
  generateTaskDetails: async (roughIdea: string) => {
    const prompt = `
Given this rough task idea, generate a clear title and detailed description:

Rough Idea: "${roughIdea}"

Provide:
1. A clear, actionable task title (max 50 chars)
2. A detailed description with acceptance criteria
3. Suggested priority (low/medium/high)
4. Estimated time to complete

Format as JSON: { title, description, suggestedPriority, estimatedMinutes }
    `;

    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }]
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.VITE_OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
      console.error('Generation error:', error);
      throw error;
    }
  }
};
