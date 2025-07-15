import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { generateDailyTasks } from '@/lib/openai'
import { LifeCategory } from '@/types/database'

export async function POST() {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's latest assessment
    const { data: assessment, error: assessmentError } = await supabase
      .from('life_assessments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (assessmentError || !assessment) {
      return NextResponse.json(
        { error: 'No assessment found. Please complete your life assessment first.' }, 
        { status: 400 }
      )
    }

    // Check if user already has tasks for today
    const today = new Date().toISOString().split('T')[0]
    const { data: existingTasks } = await supabase
      .from('daily_tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('assessment_id', assessment.id)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`)

    if (existingTasks && existingTasks.length > 0) {
      return NextResponse.json({ 
        message: 'Tasks already generated for today',
        tasks: existingTasks 
      })
    }

    // Find the two weakest categories
    const categoryScores: Array<{ category: LifeCategory; score: number }> = [
      { category: 'health', score: assessment.health_score },
      { category: 'career', score: assessment.career_score },
      { category: 'relationships', score: assessment.relationships_score },
      { category: 'finances', score: assessment.finances_score },
      { category: 'personal_growth', score: assessment.personal_growth_score },
      { category: 'leisure', score: assessment.leisure_score },
    ]

    const sortedCategories = categoryScores.sort((a, b) => a.score - b.score)
    const weakestCategories = sortedCategories.slice(0, 2).map(c => c.category)

    // Get user profile for personalization
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    // Generate tasks using OpenAI
    const generatedTasks = await generateDailyTasks({
      assessment,
      weakestCategories,
      userProfile: {
        name: profile?.full_name || undefined
      }
    })

    // Save tasks to database
    const tasksToInsert = generatedTasks.map(task => ({
      user_id: user.id,
      assessment_id: assessment.id,
      title: task.title,
      description: task.description,
      category: task.category,
      estimated_minutes: task.estimatedMinutes,
    }))

    const { data: savedTasks, error: tasksError } = await supabase
      .from('daily_tasks')
      .insert(tasksToInsert)
      .select()

    if (tasksError) {
      console.error('Error saving tasks:', tasksError)
      return NextResponse.json({ error: 'Failed to save tasks' }, { status: 500 })
    }

    return NextResponse.json({ 
      tasks: savedTasks,
      weakestCategories,
      message: 'Daily tasks generated successfully!'
    })
  } catch (error) {
    console.error('Error in POST /api/tasks/generate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 