import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get today's tasks
    const today = new Date().toISOString().split('T')[0]
    const { data: tasks, error } = await supabase
      .from('daily_tasks')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching tasks:', error)
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
    }

    return NextResponse.json({ tasks: tasks || [] })
  } catch (error) {
    console.error('Error in GET /api/tasks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { taskId, completed } = body

    if (!taskId || typeof completed !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request. taskId and completed (boolean) are required.' }, 
        { status: 400 }
      )
    }

    // Verify the task belongs to the user
    const { data: task, error: taskError } = await supabase
      .from('daily_tasks')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', user.id)
      .single()

    if (taskError || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Update task completion status
    const updateData: any = {
      completed,
      updated_at: new Date().toISOString()
    }

    if (completed) {
      updateData.completed_at = new Date().toISOString()
    } else {
      updateData.completed_at = null
    }

    const { data: updatedTask, error: updateError } = await supabase
      .from('daily_tasks')
      .update(updateData)
      .eq('id', taskId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating task:', updateError)
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
    }

    return NextResponse.json({ 
      task: updatedTask,
      message: completed ? 'Task completed! Great job! 🎉' : 'Task marked as incomplete'
    })
  } catch (error) {
    console.error('Error in PATCH /api/tasks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 