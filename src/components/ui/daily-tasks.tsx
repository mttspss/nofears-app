'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, Clock, Sparkles, Trophy, Target } from 'lucide-react'
import { DailyTask, LIFE_CATEGORIES } from '@/types/database'

interface DailyTasksProps {
  tasks: DailyTask[]
  onTaskComplete: (taskId: string, completed: boolean) => Promise<void>
  isLoading?: boolean
}

export function DailyTasks({ tasks, onTaskComplete, isLoading = false }: DailyTasksProps) {
  const [completingTasks, setCompletingTasks] = useState<Set<string>>(new Set())

  const handleTaskToggle = async (task: DailyTask) => {
    if (completingTasks.has(task.id)) return

    setCompletingTasks(prev => new Set(prev).add(task.id))
    
    try {
      await onTaskComplete(task.id, !task.completed)
    } catch (error) {
      console.error('Error updating task:', error)
    } finally {
      setCompletingTasks(prev => {
        const newSet = new Set(prev)
        newSet.delete(task.id)
        return newSet
      })
    }
  }

  const completedCount = tasks.filter(task => task.completed).length
  const totalTasks = tasks.length
  const progressPercentage = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0

  if (isLoading) {
    return <DailyTasksSkeleton />
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎯</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks yet</h3>
        <p className="text-gray-600">
          Complete your life assessment to get personalized daily tasks!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <span>Today's Micro-Tasks</span>
            </h2>
            <p className="text-gray-600 text-sm">
              Small steps, big impact. You've got this! 💪
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {completedCount}/{totalTasks}
            </div>
            <div className="text-sm text-gray-500">completed</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white rounded-full h-3 shadow-inner">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        {/* Progress Message */}
        <div className="mt-3 text-center">
          {completedCount === 0 && (
            <p className="text-sm text-gray-600">
              🌱 Ready to start your journey? Every task completed is a step forward!
            </p>
          )}
          {completedCount > 0 && completedCount < totalTasks && (
            <p className="text-sm text-blue-700">
              🚀 Great progress! Keep the momentum going!
            </p>
          )}
          {completedCount === totalTasks && (
            <p className="text-sm text-green-700 font-medium">
              🎉 Amazing! You've completed all your tasks today. You're building a better life, one day at a time!
            </p>
          )}
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.map((task, index) => {
          const isCompleting = completingTasks.has(task.id)
          const categoryData = LIFE_CATEGORIES[task.category]
          
          return (
            <div
              key={task.id}
              className={`group relative bg-white rounded-xl border-2 transition-all duration-300 ${
                task.completed 
                  ? 'border-green-200 bg-green-50/50' 
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Task Number & Icon */}
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                      task.completed 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {task.completed ? '✓' : index + 1}
                    </div>
                  </div>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`text-lg font-semibold ${
                        task.completed ? 'text-green-800 line-through' : 'text-gray-900'
                      }`}>
                        {task.title}
                      </h3>
                      
                      {/* Category Badge */}
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-lg">{categoryData.icon}</span>
                        <span className="text-gray-500">{categoryData.label}</span>
                      </div>
                    </div>

                    <p className={`text-gray-600 mb-3 ${
                      task.completed ? 'line-through' : ''
                    }`}>
                      {task.description}
                    </p>

                    {/* Task Metadata */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{task.estimated_minutes} min</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Target className="w-4 h-4" />
                        <span>{categoryData.label}</span>
                      </div>
                    </div>

                    {/* Motivational Note */}
                    {!task.completed && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-yellow-800 italic">
                          💡 {task.description}
                        </p>
                      </div>
                    )}

                    {/* Completion Feedback */}
                    {task.completed && task.completed_at && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-green-800">
                          ✨ Completed! Every small step matters on your journey.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Complete Button */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => handleTaskToggle(task)}
                      disabled={isCompleting}
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                        task.completed
                          ? 'border-green-500 bg-green-500 text-white'
                          : isCompleting
                          ? 'border-gray-300 bg-gray-100'
                          : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                      }`}
                    >
                      {isCompleting ? (
                        <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      ) : task.completed ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Completion Celebration */}
      {completedCount === totalTasks && totalTasks > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-bold text-green-800 mb-2">
            Incredible Work Today!
          </h3>
          <p className="text-green-700 mb-4">
            You've completed all your micro-tasks. You're not just rebuilding your life—you're thriving! 
            Tomorrow brings new opportunities to grow even more.
          </p>
          <div className="flex items-center justify-center space-x-1 text-sm text-green-600">
            <Trophy className="w-4 h-4" />
            <span>+{totalTasks * 10} Life Points Earned</span>
          </div>
        </div>
      )}
    </div>
  )
}

export function DailyTasksSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-gray-100 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="h-6 bg-gray-200 rounded w-48 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-32" />
          </div>
          <div className="text-right">
            <div className="h-8 bg-gray-200 rounded w-12 mb-1" />
            <div className="h-3 bg-gray-200 rounded w-16" />
          </div>
        </div>
        <div className="h-3 bg-gray-200 rounded" />
      </div>

      {/* Tasks Skeleton */}
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
} 