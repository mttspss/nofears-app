'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { LifeWheel, LifeWheelSkeleton } from '@/components/ui/life-wheel'
import { DailyTasks, DailyTasksSkeleton } from '@/components/ui/daily-tasks'
import { LifeAssessment, DailyTask } from '@/types/database'
import { LogOut, RefreshCw, Plus, User, Settings } from 'lucide-react'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [assessment, setAssessment] = useState<LifeAssessment | null>(null)
  const [tasks, setTasks] = useState<DailyTask[]>([])
  const [isLoadingAssessment, setIsLoadingAssessment] = useState(true)
  const [isLoadingTasks, setIsLoadingTasks] = useState(true)
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }
      setUser(user)

      // Check if onboarding is completed
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()

      if (!profile?.onboarding_completed) {
        router.push('/onboarding')
        return
      }

      loadDashboardData()
    }

    checkAuth()
  }, [])

  const loadDashboardData = async () => {
    await Promise.all([
      loadAssessment(),
      loadTasks()
    ])
  }

  const loadAssessment = async () => {
    try {
      const response = await fetch('/api/assessment')
      const data = await response.json()
      setAssessment(data.assessment)
    } catch (error) {
      console.error('Error loading assessment:', error)
    } finally {
      setIsLoadingAssessment(false)
    }
  }

  const loadTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      const data = await response.json()
      setTasks(data.tasks)
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setIsLoadingTasks(false)
    }
  }

  const handleTaskComplete = async (taskId: string, completed: boolean) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, completed })
      })

      if (!response.ok) {
        throw new Error('Failed to update task')
      }

      const data = await response.json()
      
      // Update tasks in state
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId 
            ? { ...task, completed, completed_at: data.task.completed_at }
            : task
        )
      )
    } catch (error) {
      console.error('Error updating task:', error)
      throw error
    }
  }

  const handleGenerateNewTasks = async () => {
    setIsGeneratingTasks(true)
    try {
      const response = await fetch('/api/tasks/generate', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to generate tasks')
      }

      const data = await response.json()
      setTasks(data.tasks)
    } catch (error) {
      console.error('Error generating tasks:', error)
      alert('Failed to generate new tasks. Please try again.')
    } finally {
      setIsGeneratingTasks(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const userName = user.user_metadata?.full_name || user.user_metadata?.name || 'Friend'
  const completedTasks = tasks.filter(task => task.completed).length
  const totalTasks = tasks.length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                No<span className="text-blue-600">Fears</span>.app
              </h1>
              <div className="hidden sm:block text-gray-300">|</div>
              <div className="hidden sm:block text-gray-600">
                Welcome back, {userName}! 🌟
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4 text-sm">
                {totalTasks > 0 && (
                  <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full">
                    {completedTasks}/{totalTasks} tasks completed today
                  </div>
                )}
              </div>
              
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Life Wheel Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Your Life Wheel</h2>
                <button
                  onClick={() => router.push('/assessment')}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retake Assessment</span>
                </button>
              </div>
              
              {isLoadingAssessment ? (
                <LifeWheelSkeleton size="lg" />
              ) : (
                <LifeWheel 
                  assessment={assessment} 
                  size="lg" 
                  showLabels={true}
                  animated={true}
                />
              )}
            </div>

            {/* Quick Stats */}
            {assessment && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {Math.round(((assessment.health_score + assessment.career_score + assessment.relationships_score + assessment.finances_score + assessment.personal_growth_score + assessment.leisure_score) / 6) * 10) / 10}
                  </div>
                  <div className="text-sm text-gray-600">Overall Score</div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {completedTasks}
                  </div>
                  <div className="text-sm text-gray-600">Tasks Completed Today</div>
                </div>
              </div>
            )}
          </div>

          {/* Tasks Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Today's Micro-Tasks</h2>
                {tasks.length > 0 && (
                  <button
                    onClick={handleGenerateNewTasks}
                    disabled={isGeneratingTasks}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1 disabled:opacity-50"
                  >
                    {isGeneratingTasks ? (
                      <>
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>New Tasks</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              
              <DailyTasks
                tasks={tasks}
                onTaskComplete={handleTaskComplete}
                isLoading={isLoadingTasks}
              />
              
              {!isLoadingTasks && tasks.length === 0 && (
                <div className="text-center py-8">
                  <button
                    onClick={handleGenerateNewTasks}
                    disabled={isGeneratingTasks}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2 mx-auto"
                  >
                    {isGeneratingTasks ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Generating Your Tasks...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Generate Today's Tasks</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Motivational Section */}
        {assessment && (
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Remember: Every Small Step Counts 🌟
            </h3>
            <p className="text-gray-700 max-w-2xl mx-auto">
              You're not just rebuilding your life—you're creating the foundation for something amazing. 
              Each completed task is proof that you're stronger than your circumstances.
            </p>
          </div>
        )}
      </main>
    </div>
  )
} 