import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { LifeCategory } from '@/types/database'

export async function GET() {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: assessment, error } = await supabase
      .from('life_assessments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching assessment:', error)
      return NextResponse.json({ error: 'Failed to fetch assessment' }, { status: 500 })
    }

    return NextResponse.json({ assessment: assessment || null })
  } catch (error) {
    console.error('Error in GET /api/assessment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { scores } = body

    // Validate scores
    const requiredCategories: LifeCategory[] = ['health', 'career', 'relationships', 'finances', 'personal_growth', 'leisure']
    for (const category of requiredCategories) {
      if (!scores[category] || scores[category] < 1 || scores[category] > 10) {
        return NextResponse.json(
          { error: `Invalid score for ${category}. Must be between 1 and 10.` }, 
          { status: 400 }
        )
      }
    }

    // Create new assessment
    const { data: assessment, error } = await supabase
      .from('life_assessments')
      .insert({
        user_id: user.id,
        health_score: scores.health,
        career_score: scores.career,
        relationships_score: scores.relationships,
        finances_score: scores.finances,
        personal_growth_score: scores.personal_growth,
        leisure_score: scores.leisure,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating assessment:', error)
      return NextResponse.json({ error: 'Failed to create assessment' }, { status: 500 })
    }

    // Mark onboarding as completed
    await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', user.id)

    return NextResponse.json({ assessment })
  } catch (error) {
    console.error('Error in POST /api/assessment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 