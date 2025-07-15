'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { ArrowRight, Target, Zap, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  const getUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }, [supabase.auth])

  useEffect(() => {
    getUser()
  }, [getUser])

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`
        }
      })
      if (error) {
        console.error('Error signing in:', error)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSignUp = async (email: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`
        }
      })
      if (error) {
        console.error('Error signing up:', error)
      } else {
        alert('Check your email for the login link!')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome back!</h2>
          <Link 
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-20 pb-16 text-center lg:pt-32">
          {/* Logo/Brand */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              No<span className="text-blue-600">Fears</span>.app
            </h1>
            <div className="text-2xl mb-6">🌱 → 🚀</div>
          </div>

          {/* Hero Content */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Turn Your <span className="text-blue-600">Rock Bottom</span><br />
              Into Your <span className="text-purple-600">Comeback Story</span>
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              A life rebirth tool that helps you assess where you are, get AI-powered micro-tasks, 
              and watch your life wheel transform as you rebuild—one small step at a time.
            </p>

            {/* Email Signup */}
            <div className="max-w-md mx-auto mb-8">
              <EmailSignupForm onSubmit={handleEmailSignUp} isLoading={isLoading} />
            </div>

            {/* Google Sign In */}
            <div className="mb-8">
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="inline-flex items-center px-8 py-4 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-sm"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-12">
              Free to start • No credit card required • Join hundreds rebuilding their lives
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works: Assess → Act → Transform
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple, proven steps that turn overwhelming life changes into manageable daily actions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Feature 1 */}
            <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Life Wheel Assessment</h4>
              <p className="text-gray-600 leading-relaxed">
                Rate 6 key life areas (Health, Career, Relationships, Finances, Personal Growth, Leisure) 
                to get a clear picture of where you stand.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">AI-Powered Micro-Tasks</h4>
              <p className="text-gray-600 leading-relaxed">
                Get 3 personalized 5-10 minute tasks daily, focused on your weakest areas. 
                Small steps, big impact.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Visual Progress Tracking</h4>
              <p className="text-gray-600 leading-relaxed">
                Watch your life wheel fill up as you complete tasks. See your transformation 
                in real-time and stay motivated.
              </p>
            </div>
          </div>

          {/* Social Proof */}
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <div className="flex items-center justify-center space-x-1 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="text-yellow-400 text-xl">⭐</span>
              ))}
            </div>
            <p className="text-lg text-gray-700 mb-2">
              &ldquo;NoFears helped me turn my lowest point into my comeback. The micro-tasks made everything feel possible.&rdquo;
            </p>
            <p className="text-gray-500">- Sarah M., Community Member</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Start Your Comeback?
            </h3>
            <p className="text-xl text-gray-600 mb-8">
              Join hundreds of people who&apos;ve turned their rock bottom into their foundation for growth.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-lg font-semibold"
              >
                {isLoading ? 'Starting...' : 'Start Your Rebirth Journey'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              
              <p className="text-sm text-gray-500">
                Takes 2 minutes to start • First assessment is free
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2024 NoFears.app - Turning rock bottom into comeback stories, one step at a time.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function EmailSignupForm({ onSubmit, isLoading }: { onSubmit: (email: string) => void, isLoading: boolean }) {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      onSubmit(email)
      setEmail('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <input
        type="email"
        placeholder="Enter your email to start"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        required
      />
      <button
        type="submit"
        disabled={isLoading || !email}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-semibold whitespace-nowrap"
      >
        Get Started Free
      </button>
    </form>
  )
}
