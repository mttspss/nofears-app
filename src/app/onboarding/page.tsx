'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { LifeAssessment } from '@/components/ui/life-assessment'
import { LifeCategory } from '@/types/database'

export default function OnboardingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [step, setStep] = useState<'welcome' | 'assessment' | 'processing'>('welcome')
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

      // Check if onboarding is already completed
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()

      if (profile?.onboarding_completed) {
        router.push('/dashboard')
      }
    }

    checkAuth()
  }, [])

  const handleAssessmentComplete = async (scores: Record<LifeCategory, number>) => {
    setIsLoading(true)
    setStep('processing')

    try {
      // Submit assessment
      const response = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scores })
      })

      if (!response.ok) {
        throw new Error('Failed to save assessment')
      }

      // Generate initial tasks
      const tasksResponse = await fetch('/api/tasks/generate', {
        method: 'POST',
      })

      if (!tasksResponse.ok) {
        console.warn('Failed to generate initial tasks, but continuing...')
      }

      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (error) {
      console.error('Error completing onboarding:', error)
      setIsLoading(false)
      setStep('assessment')
      alert('Something went wrong. Please try again.')
    }
  }

  const handleStartAssessment = () => {
    setStep('assessment')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {step === 'welcome' && (
        <WelcomeStep 
          user={user} 
          onStart={handleStartAssessment}
        />
      )}

      {step === 'assessment' && (
        <div className="py-8">
          <LifeAssessment 
            onComplete={handleAssessmentComplete}
            isLoading={isLoading}
          />
        </div>
      )}

      {step === 'processing' && (
        <ProcessingStep />
      )}
    </div>
  )
}

function WelcomeStep({ user, onStart }: { user: any, onStart: () => void }) {
  const userName = user.user_metadata?.full_name || user.user_metadata?.name || 'there'

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="text-6xl mb-6">🌟</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Your Rebirth Journey, {userName}!
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Every great comeback starts with knowing where you are. 
            Let's take a moment to assess your current life situation across six key areas.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            What You'll Do Next:
          </h2>
          
          <div className="space-y-4 text-left">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Rate Your Life Areas</h3>
                <p className="text-gray-600">
                  Honestly assess 6 key areas: Health, Career, Relationships, Finances, Personal Growth, and Leisure.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-semibold text-sm">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Get Your Personal Action Plan</h3>
                <p className="text-gray-600">
                  Our AI will analyze your responses and create 3 personalized micro-tasks to start improving today.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold text-sm">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">See Your Life Wheel</h3>
                <p className="text-gray-600">
                  Watch your visual life wheel fill up as you complete tasks and make progress.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <span className="text-2xl">🤖</span>
            <h3 className="text-lg font-semibold text-blue-900">AI-Guided Assessment</h3>
          </div>
          <p className="text-blue-800 text-sm">
            Our AI will guide you through each area with thoughtful questions and provide personalized 
            insights to help you identify exactly where to focus your energy for maximum impact.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={onStart}
            className="w-full bg-blue-600 text-white py-4 px-8 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Start My Life Assessment
          </button>
          
          <p className="text-sm text-gray-500">
            ⏱️ Takes about 5-7 minutes • 🔒 Your responses are private and secure
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          {[
            { icon: '🏃‍♂️', label: 'Health', desc: 'Physical & mental wellness' },
            { icon: '💼', label: 'Career', desc: 'Work & professional growth' },
            { icon: '❤️', label: 'Relationships', desc: 'Family, friends & social' },
            { icon: '💰', label: 'Finances', desc: 'Money & financial security' },
            { icon: '🌱', label: 'Growth', desc: 'Learning & development' },
            { icon: '🎯', label: 'Leisure', desc: 'Fun & recreation' },
          ].map((area, index) => (
            <div key={index} className="bg-white rounded-lg p-4 text-center border border-gray-100">
              <div className="text-2xl mb-2">{area.icon}</div>
              <div className="font-semibold text-gray-900 text-sm">{area.label}</div>
              <div className="text-xs text-gray-500">{area.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ProcessingStep() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-blue-200 rounded-full mx-auto mb-6" />
            <div className="absolute inset-0 w-24 h-24 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Creating Your Personal Action Plan
          </h2>
          
          <div className="space-y-3 text-gray-600">
            <p className="flex items-center justify-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Analyzing your life assessment...</span>
            </p>
            <p className="flex items-center justify-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Identifying growth opportunities...</span>
            </p>
            <p className="flex items-center justify-center space-x-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span>Generating personalized micro-tasks...</span>
            </p>
            <p className="flex items-center justify-center space-x-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              <span>Building your life wheel...</span>
            </p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="text-4xl mb-3">🎉</div>
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            You've Taken the First Step!
          </h3>
          <p className="text-green-700 text-sm">
            Completing your assessment shows incredible courage. 
            Your personalized dashboard is being prepared...
          </p>
        </div>
      </div>
    </div>
  )
} 