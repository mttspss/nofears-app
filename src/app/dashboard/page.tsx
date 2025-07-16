'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { LifeWheel, LifeWheelSkeleton } from '@/components/ui/life-wheel'
import { DailyTasks } from '@/components/ui/daily-tasks'
import { LifeAssessment, DailyTask } from '@/types/database'
import { LogOut, RefreshCw, Plus, Trophy, Target, Sparkles, TrendingUp } from 'lucide-react'
import { User } from '@supabase/supabase-js'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [assessment, setAssessment] = useState<LifeAssessment | null>(null)
  const [tasks, setTasks] = useState<DailyTask[]>([])
  const [isLoadingAssessment, setIsLoadingAssessment] = useState(true)
  const [isLoadingTasks, setIsLoadingTasks] = useState(true)
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const loadAssessment = useCallback(async () => {
    try {
      const response = await fetch('/api/assessment')
      const data = await response.json()
      setAssessment(data.assessment)
    } catch (error) {
      console.error('Error loading assessment:', error)
    } finally {
      setIsLoadingAssessment(false)
    }
  }, [])

  const loadTasks = useCallback(async () => {
    try {
      const response = await fetch('/api/tasks')
      const data = await response.json()
      setTasks(data.tasks)
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setIsLoadingTasks(false)
    }
  }, [])

  const loadDashboardData = useCallback(async () => {
    await Promise.all([
      loadAssessment(),
      loadTasks()
    ])
  }, [loadAssessment, loadTasks])

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
  }, [router, supabase, loadDashboardData])

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <div className="text-2xl font-bold text-gray-900 mb-2">Loading Your Transformation Hub</div>
          <p className="text-gray-600">Preparing your personalized dashboard...</p>
        </div>
      </div>
    )
  }

  const userName = user.user_metadata?.full_name || user.user_metadata?.name || 'Champion'
  const completedTasks = tasks.filter(task => task.completed).length
  const totalTasks = tasks.length
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-6">
              <h1 className="text-3xl font-bold text-gray-900">
                No<span className="text-blue-600">Fears</span>.app
              </h1>
              <div className="hidden sm:block text-gray-300">|</div>
              <div className="hidden sm:flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <div className="text-gray-700 font-medium">
                  Welcome back, {userName}! 
                </div>
              </div>
              {totalTasks > 0 && (
                <div className="hidden lg:flex items-center space-x-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-2 rounded-full border border-green-200">
                  <Trophy className="w-4 h-4" />
                  <span className="font-semibold">{completedTasks}/{totalTasks} completed today</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors px-4 py-2 rounded-lg hover:bg-gray-100"
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
        {/* Hero Stats */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 p-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Transformation Journey</h2>
              <p className="text-gray-600">Every small step is building the foundation for your comeback story</p>
            </div>
            
            {assessment && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {Math.round(((assessment.health_score + assessment.career_score + assessment.relationships_score + assessment.finances_score + assessment.personal_growth_score + assessment.leisure_score) / 6) * 10) / 10}
                  </div>
                  <div className="text-sm font-medium text-blue-800">Overall Life Score</div>
                  <div className="text-xs text-blue-600 mt-1">Out of 10</div>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {completedTasks}
                  </div>
                  <div className="text-sm font-medium text-green-800">Tasks Completed</div>
                  <div className="text-xs text-green-600 mt-1">Today</div>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {Math.round(progressPercentage)}%
                  </div>
                  <div className="text-sm font-medium text-purple-800">Daily Progress</div>
                  <div className="text-xs text-purple-600 mt-1">Today&apos;s Goal</div>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl border border-yellow-200">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    🔥
                  </div>
                  <div className="text-sm font-medium text-yellow-800">Streak Active</div>
                  <div className="text-xs text-yellow-600 mt-1">Keep going!</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Life Wheel Section */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                    <Target className="w-6 h-6 text-blue-600" />
                    <span>Your Life Wheel</span>
                  </h2>
                  <p className="text-gray-600 mt-1">Visual representation of your life balance</p>
                </div>
                <button
                  onClick={() => router.push('/assessment')}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-all duration-300"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retake</span>
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

              {assessment && (
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Growth Insight</h3>
                  </div>
                  <p className="text-gray-700 text-sm">
                    Your journey is unique and every area of improvement counts. Focus on small daily wins 
                    in your lowest-scoring areas to create lasting transformation.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Tasks Section */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                    <span>Today&apos;s Micro-Tasks</span>
                  </h2>
                  <p className="text-gray-600 mt-1">Small steps, big transformation</p>
                </div>
                {tasks.length > 0 && (
                  <button
                    onClick={handleGenerateNewTasks}
                    disabled={isGeneratingTasks}
                    className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50"
                  >
                    {isGeneratingTasks ? (
                      <>
                        <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
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
                <div className="text-center py-12">
                  <div className="text-6xl mb-6">🎯</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Ready to Start Today?</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Generate your first set of personalized micro-tasks based on your life assessment. 
                    Each task is designed to take just 5-10 minutes.
                  </p>
                  <button
                    onClick={handleGenerateNewTasks}
                    disabled={isGeneratingTasks}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 flex items-center space-x-2 mx-auto shadow-lg hover:shadow-xl"
                  >
                    {isGeneratingTasks ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Generating Your Tasks...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>Generate Today&apos;s Tasks</span>
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
          <div className="mt-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-center text-white shadow-xl">
            <div className="max-w-3xl mx-auto">
              <div className="text-4xl mb-4">🌟</div>
              <h3 className="text-2xl font-bold mb-4">
                You&apos;re Writing Your Comeback Story
              </h3>
              <p className="text-blue-100 text-lg leading-relaxed">
                Every task you complete, every small win you achieve, is proof that you&apos;re not just surviving—you&apos;re thriving. 
                Your rock bottom is becoming your foundation. Keep going, champion! 💪
              </p>
              <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Target className="w-4 h-4" />
                  </div>
                  <span>Purpose-Driven</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span>Always Growing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <span>Victory Minded</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 