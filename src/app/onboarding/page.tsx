'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { LifeAssessment } from '@/components/ui/life-assessment'
import { LifeCategory } from '@/types/database'
import { User } from '@supabase/supabase-js'
import { Sparkles, Target, TrendingUp, Heart } from 'lucide-react'

export default function OnboardingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [step, setStep] = useState<'welcome' | 'assessment' | 'processing'>('welcome')
  const router = useRouter()
  const supabase = createClient()

  const checkAuth = useCallback(async () => {
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
  }, [router, supabase])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <div className="text-2xl font-bold text-gray-900 mb-2">Preparing Your Journey</div>
          <p className="text-gray-600">Setting up your transformation space...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
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

function WelcomeStep({ user, onStart }: { user: User, onStart: () => void }) {
  const userName = user.user_metadata?.full_name || user.user_metadata?.name || 'there'

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-medium mb-6 border border-blue-200">
            <Sparkles className="w-4 h-4 mr-2" />
            Welcome to Your Transformation Journey
          </div>
          <div className="text-7xl mb-6">🌟</div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Welcome, {userName}!<br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Your Rebirth Starts Here
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Every great comeback starts with knowing where you are. 
            Let&apos;s take a moment to assess your current life situation and create your personalized transformation plan.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 p-8 md:p-12 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            What You&apos;ll Do Next:
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-2 flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span>Rate Your Life Areas</span>
                </h3>
                <p className="text-gray-700">
                  Honestly assess 6 key areas: Health, Career, Relationships, Finances, Personal Growth, and Leisure. 
                  This creates your unique Life Wheel baseline.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-2 flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <span>Get Your Personal Action Plan</span>
                </h3>
                <p className="text-gray-700">
                  Our AI analyzes your responses and creates 3 personalized micro-tasks to start improving today. 
                  Each task takes just 5-10 minutes but creates lasting change.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl border border-green-200">
              <div className="w-12 h-12 bg-green-600 text-white rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-2 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span>Watch Your Life Wheel Grow</span>
                </h3>
                <p className="text-gray-700">
                  See your visual life wheel fill up as you complete tasks and make progress. 
                  Celebrate every win and track your transformation journey.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Guidance Box */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 mb-8 text-white text-center shadow-xl">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-3xl">🤖</span>
            <h3 className="text-2xl font-bold">AI-Guided Assessment</h3>
          </div>
          <p className="text-blue-100 text-lg leading-relaxed max-w-2xl mx-auto">
            Our AI will guide you through each area with thoughtful questions and provide personalized 
            insights to help you identify exactly where to focus your energy for maximum impact.
          </p>
        </div>

        {/* Call to Action */}
        <div className="text-center space-y-6">
          <button
            onClick={onStart}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-5 px-12 rounded-2xl text-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl"
          >
            Start My Life Assessment
          </button>
          
          <p className="text-gray-500">
            ⏱️ Takes about 5-7 minutes • 🔒 Your responses are private and secure • ✨ Completely free
          </p>
        </div>

        {/* Life Areas Preview */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">The 6 Life Areas We&apos;ll Assess</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: '🏃‍♂️', label: 'Health', desc: 'Physical & mental wellness' },
              { icon: '💼', label: 'Career', desc: 'Work & professional growth' },
              { icon: '❤️', label: 'Relationships', desc: 'Family, friends & social' },
              { icon: '💰', label: 'Finances', desc: 'Money & financial security' },
              { icon: '🌱', label: 'Growth', desc: 'Learning & development' },
              { icon: '🎯', label: 'Leisure', desc: 'Fun & recreation' },
            ].map((area, index) => (
              <div key={index} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/30 hover:bg-white/80 transition-all duration-300">
                <div className="text-3xl mb-3">{area.icon}</div>
                <div className="font-bold text-gray-900 mb-1">{area.label}</div>
                <div className="text-sm text-gray-600">{area.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProcessingStep() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-12">
          <div className="relative mb-8">
            <div className="w-32 h-32 border-8 border-blue-200 rounded-full mx-auto" />
            <div className="absolute inset-0 w-32 h-32 border-8 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Creating Your Personal Transformation Plan
          </h2>
          
          <div className="space-y-4 text-lg">
            <div className="flex items-center justify-center space-x-3 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-gray-700">Analyzing your life assessment...</span>
            </div>
            <div className="flex items-center justify-center space-x-3 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-gray-700">Identifying growth opportunities...</span>
            </div>
            <div className="flex items-center justify-center space-x-3 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
              <span className="text-gray-700">Generating personalized micro-tasks...</span>
            </div>
            <div className="flex items-center justify-center space-x-3 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30">
              <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse" />
              <span className="text-gray-700">Building your transformation dashboard...</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-8 text-white shadow-xl">
          <div className="text-5xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold mb-4">
            You&apos;ve Taken the First Step!
          </h3>
          <p className="text-green-100 text-lg leading-relaxed">
            Completing your assessment shows incredible courage and self-awareness. 
            Your personalized transformation dashboard is being prepared with everything you need to start your comeback journey.
          </p>
          <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4" />
              <span>Self-Compassion</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Focused Action</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Continuous Growth</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 