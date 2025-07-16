'use client'

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { RainbowButton } from '@/components/magicui/rainbow-button'
import { BlurFade } from '@/components/magicui/blur-fade'
import { Particles } from '@/components/magicui/particles'

export function CTA() {
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
    <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden">
      <Particles
        className="absolute inset-0"
        quantity={50}
        ease={80}
        color="#ffffff"
        refresh
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          
          <BlurFade delay={0.1} inView>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Ready to Write Your{' '}
              <span className="text-yellow-300">Comeback Story</span>?
            </h2>
          </BlurFade>

          <BlurFade delay={0.2} inView>
            <p className="text-lg sm:text-xl leading-relaxed mb-12 opacity-90 max-w-3xl mx-auto">
              Join 1,200+ people who've transformed their rock bottom into their foundation for success. 
              Your transformation starts with a single click.
            </p>
          </BlurFade>
          
          <BlurFade delay={0.3} inView>
            <div className="mb-8">
              <RainbowButton
                onClick={handleSignIn}
                disabled={isLoading}
                size="lg"
                className="text-xl px-12 py-6"
              >
                {isLoading ? 'Starting Your Journey...' : 'Start Your Transformation Now'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </RainbowButton>
            </div>
          </BlurFade>
          
          <BlurFade delay={0.4} inView>
            <div className="text-sm opacity-75">
              Free to start • No credit card required • Transform in 30 days
            </div>
          </BlurFade>

        </div>
      </div>
    </section>
  )
} 