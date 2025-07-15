import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { generateDailyTasks } from '@/lib/openai'
import { LifeCategory } from '@/types/database'

export async function POST() {
  try {
    const supabase = await createClient()
    
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
        { error: 'No life assessment found. Please complete your assessment first.' },
        { status: 400 }
      )
    }

    // Find the 2 weakest categories
    const categoryScores = [
      { category: 'health' as LifeCategory, score: assessment.health_score },
      { category: 'career' as LifeCategory, score: assessment.career_score },
      { category: 'relationships' as LifeCategory, score: assessment.relationships_score },
      { category: 'finances' as LifeCategory, score: assessment.finances_score },
      { category: 'personal_growth' as LifeCategory, score: assessment.personal_growth_score },
      { category: 'leisure' as LifeCategory, score: assessment.leisure_score },
    ]

    const weakestCategories = categoryScores
      .sort((a, b) => a.score - b.score)
      .slice(0, 2)
      .map(item => item.category)

    // Generate tasks using OpenAI
    const generatedTasks = await generateDailyTasks({
      assessment,
      weakestCategories,
      userProfile: {
        name: user.user_metadata?.full_name || user.user_metadata?.name,
      }
    })

    // Delete existing tasks for today
    const today = new Date().toISOString().split('T')[0]
    await supabase
      .from('daily_tasks')
      .delete()
      .eq('user_id', user.id)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`)

    // Insert new tasks
    const tasksToInsert = generatedTasks.map(task => ({
      user_id: user.id,
      title: task.title,
      description: task.description,
      category: task.category,
      estimated_minutes: task.estimatedMinutes,
      completed: false,
    }))

    const { data: insertedTasks, error: insertError } = await supabase
      .from('daily_tasks')
      .insert(tasksToInsert)
      .select()

    if (insertError) {
      console.error('Error inserting tasks:', insertError)
      return NextResponse.json({ error: 'Failed to save generated tasks' }, { status: 500 })
    }

    return NextResponse.json({ 
      tasks: insertedTasks,
      message: `Generated ${insertedTasks.length} personalized tasks for you! 🎯`
    })
  } catch (error) {
    console.error('Error in POST /api/tasks/generate:', error)
    return NextResponse.json({ error: 'Failed to generate tasks' }, { status: 500 })
  }
} 