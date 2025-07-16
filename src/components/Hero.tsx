'use client'

import { useState } from 'react'
import { ArrowRight, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { RainbowButton } from '@/components/magicui/rainbow-button'
import { BlurFade } from '@/components/magicui/blur-fade'
import { AuroraText } from '@/components/magicui/aurora-text'

export function Hero() {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`
        }
      })
      if (error) console.error('Error signing in:', error)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="py-12 sm:py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          
          {/* Social Proof Badge */}
          <BlurFade delay={0.1} inView>
            <div className="inline-flex items-center px-6 py-3 mb-6 bg-green-100/80 dark:bg-green-900/20 backdrop-blur-sm rounded-full text-sm border border-green-200 dark:border-green-800">
              <div className="relative flex h-2 w-2 mr-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </div>
              <span className="text-green-700 dark:text-green-300 font-semibold">1,247+ lives transformed this month</span>
            </div>
          </BlurFade>

          {/* Main Headline */}
          <BlurFade delay={0.2} inView>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-8">
              Turn your{' '}
              <span className="text-muted-foreground italic">rock bottom</span>
              <br />
              into your{' '}
              <AuroraText
                colors={["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981"]}
                className="font-extrabold"
              >
                comeback story
              </AuroraText>
            </h1>
          </BlurFade>

          {/* Subtitle */}
          <BlurFade delay={0.3} inView>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-12 max-w-3xl mx-auto">
              The AI-powered life transformation system that helps you rebuild your life systematically. 
              From rock bottom to thriving in 30 days with personalized micro-tasks.
            </p>
          </BlurFade>

          {/* CTA Button */}
          <BlurFade delay={0.4} inView>
            <div className="mb-12">
              <RainbowButton 
                onClick={handleSignIn} 
                disabled={isLoading}
                size="lg"
                className="text-lg px-8 py-4"
              >
                {isLoading ? 'Starting Your Journey...' : 'Start Your Transformation'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </RainbowButton>
            </div>
          </BlurFade>

          {/* Social Proof Strip */}
          <BlurFade delay={0.5} inView>
            <div className="flex flex-col items-center gap-6">
              {/* User Avatars */}
              <div className="flex items-center -space-x-2">
                {[
                  { initial: 'S', color: 'from-pink-500 to-rose-500' },
                  { initial: 'M', color: 'from-blue-500 to-indigo-500' },
                  { initial: 'A', color: 'from-green-500 to-emerald-500' },
                  { initial: 'L', color: 'from-purple-500 to-violet-500' },
                  { initial: 'R', color: 'from-orange-500 to-amber-500' }
                ].map((user, index) => (
                  <div
                    key={user.initial}
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${user.color} flex items-center justify-center text-white font-semibold border-2 border-background shadow-lg`}
                  >
                    {user.initial}
                  </div>
                ))}
              </div>
              
              {/* Rating and Text */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="font-semibold">4.9/5</span>
                <span>from 1,200+ transformations</span>
              </div>
            </div>
          </BlurFade>

        </div>
      </div>
    </section>
  )
} 