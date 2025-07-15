import OpenAI from 'openai'
import { LifeAssessment, LifeCategory, LIFE_CATEGORIES } from '@/types/database'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface TaskGenerationRequest {
  assessment: LifeAssessment
  weakestCategories: LifeCategory[]
  userProfile?: {
    name?: string
    previousTasks?: string[]
  }
}

interface GeneratedTask {
  title: string
  description: string
  category: LifeCategory
  estimatedMinutes: number
  motivationalNote: string
}

export async function generateDailyTasks(request: TaskGenerationRequest): Promise<GeneratedTask[]> {
  const { assessment, weakestCategories, userProfile } = request
  
  const categoryScores = weakestCategories.map(category => {
    const score = assessment[`${category}_score` as keyof LifeAssessment] as number
    return {
      category,
      score,
      label: LIFE_CATEGORIES[category].label,
      description: LIFE_CATEGORIES[category].description
    }
  })

  const prompt = `
You are an AI life coach helping someone on their journey of personal rebirth and growth. 

USER CONTEXT:
- Life Assessment Scores (1-10 scale):
${categoryScores.map(c => `  • ${c.label}: ${c.score}/10 - ${c.description}`).join('\n')}

TASK: Generate exactly 3 micro-tasks (5-10 minutes each) for today that will help improve the lowest-scoring areas. 

GUIDELINES:
- Tasks must be SIMPLE, SPECIFIC, and ACHIEVABLE in 5-10 minutes
- Focus on the two weakest areas: ${categoryScores.map(c => c.label).join(' and ')}
- Make tasks actionable and concrete (not vague like "exercise more")
- Include a brief motivational note for each task
- Consider that this person is rebuilding their life - be encouraging and realistic

RESPONSE FORMAT (JSON):
[
  {
    "title": "Clear, actionable task title",
    "description": "Specific steps to complete this task",
    "category": "category_slug",
    "estimatedMinutes": 5-10,
    "motivationalNote": "Brief, encouraging message"
  }
]

Generate 3 tasks focusing primarily on: ${categoryScores.map(c => c.label).join(' and ')}.
Make sure at least 2 tasks target these weakest areas specifically.
`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a compassionate AI life coach specializing in helping people rebuild their lives through small, achievable daily actions. Always respond with valid JSON array format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    const tasks = JSON.parse(response) as GeneratedTask[]
    
    // Validate that we have exactly 3 tasks
    if (!Array.isArray(tasks) || tasks.length !== 3) {
      throw new Error('Invalid task format from OpenAI')
    }

    // Validate task structure
    tasks.forEach((task, index) => {
      if (!task.title || !task.description || !task.category || !task.estimatedMinutes || !task.motivationalNote) {
        throw new Error(`Invalid task structure at index ${index}`)
      }
    })

    return tasks
  } catch (error) {
    console.error('Error generating tasks:', error)
    
    // Fallback tasks if OpenAI fails
    return generateFallbackTasks(weakestCategories)
  }
}

function generateFallbackTasks(weakestCategories: LifeCategory[]): GeneratedTask[] {
  const fallbackTasks: Record<LifeCategory, GeneratedTask[]> = {
    health: [
      {
        title: "5-Minute Morning Stretch",
        description: "Do simple stretches: neck rolls, shoulder shrugs, touch your toes, and take 5 deep breaths.",
        category: "health",
        estimatedMinutes: 5,
        motivationalNote: "Small movements create big changes. Your body will thank you!"
      },
      {
        title: "Drink a Large Glass of Water",
        description: "Fill a large glass with water and drink it slowly. Add lemon if you have it.",
        category: "health",
        estimatedMinutes: 2,
        motivationalNote: "Hydration is the foundation of energy. You're taking care of yourself!"
      }
    ],
    career: [
      {
        title: "Update One Line on LinkedIn",
        description: "Log into LinkedIn and update your headline or add one new skill to your profile.",
        category: "career",
        estimatedMinutes: 5,
        motivationalNote: "Small steps forward are still progress. You're investing in your future!"
      },
      {
        title: "Read One Industry Article",
        description: "Find and read one short article related to your field or dream career.",
        category: "career",
        estimatedMinutes: 8,
        motivationalNote: "Knowledge is power. Every article makes you stronger!"
      }
    ],
    relationships: [
      {
        title: "Send One Thoughtful Message",
        description: "Text, call, or message one person you care about. Ask how they're doing or share something positive.",
        category: "relationships",
        estimatedMinutes: 5,
        motivationalNote: "Connection heals. Someone will smile because of your message today!"
      },
      {
        title: "Practice Active Listening",
        description: "In your next conversation, focus completely on the other person without thinking about your response.",
        category: "relationships",
        estimatedMinutes: 10,
        motivationalNote: "Being fully present is a gift to others and yourself!"
      }
    ],
    finances: [
      {
        title: "Check One Bank Account",
        description: "Log into one bank account and review your recent transactions. Just observe, no judgment.",
        category: "finances",
        estimatedMinutes: 5,
        motivationalNote: "Awareness is the first step to financial freedom. You're being brave!"
      },
      {
        title: "Track Today's Expenses",
        description: "Write down every purchase you make today, no matter how small.",
        category: "finances",
        estimatedMinutes: 8,
        motivationalNote: "Every dollar tracked is a dollar mastered. You're taking control!"
      }
    ],
    personal_growth: [
      {
        title: "Write Three Things You're Grateful For",
        description: "Write down three specific things you're grateful for today, no matter how small.",
        category: "personal_growth",
        estimatedMinutes: 5,
        motivationalNote: "Gratitude transforms perspective. You're choosing to see the light!"
      },
      {
        title: "Learn One New Word",
        description: "Look up one new word, understand its meaning, and try to use it in conversation today.",
        category: "personal_growth",
        estimatedMinutes: 7,
        motivationalNote: "Your mind is growing every day. Knowledge is your superpower!"
      }
    ],
    leisure: [
      {
        title: "Take 5 Photos of Beautiful Things",
        description: "Look for beauty around you and take 5 photos of things that catch your eye.",
        category: "leisure",
        estimatedMinutes: 10,
        motivationalNote: "Beauty is everywhere when you look for it. You deserve joy!"
      },
      {
        title: "Listen to One Favorite Song",
        description: "Play one song that makes you feel good and really listen to it - no multitasking.",
        category: "leisure",
        estimatedMinutes: 5,
        motivationalNote: "Music feeds the soul. Let yourself feel the rhythm of life!"
      }
    ]
  }

  const tasks: GeneratedTask[] = []
  
  // Get 2 tasks from the weakest categories
  weakestCategories.slice(0, 2).forEach(category => {
    const categoryTasks = fallbackTasks[category]
    tasks.push(categoryTasks[Math.floor(Math.random() * categoryTasks.length)])
  })

  // Add one random task from any category
  const allCategories = Object.keys(fallbackTasks) as LifeCategory[]
  const randomCategory = allCategories[Math.floor(Math.random() * allCategories.length)]
  const randomCategoryTasks = fallbackTasks[randomCategory]
  tasks.push(randomCategoryTasks[Math.floor(Math.random() * randomCategoryTasks.length)])

  return tasks.slice(0, 3)
} 