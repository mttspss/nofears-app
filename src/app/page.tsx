'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

// Components
import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { Features } from '@/components/Features'
import { FAQ } from '@/components/FAQ'
import { CTA } from '@/components/CTA'
import { Footer } from '@/components/Footer'

// Magic UI Components
import { BlurFade } from '@/components/magicui/blur-fade'
import { BorderBeam } from '@/components/magicui/border-beam'
import { Particles } from '@/components/magicui/particles'

export default function LandingPage() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  const getUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }, [supabase.auth])

  useEffect(() => {
    getUser()
  }, [getUser])

  // If user is logged in, show welcome screen
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Particles
          className="absolute inset-0 -z-10"
          quantity={80}
          ease={80}
          color="#3b82f6"
          refresh
        />
        
        <BlurFade delay={0.25} inView>
          <div className="text-center bg-background p-12 rounded-3xl shadow-2xl relative max-w-md mx-auto">
            <BorderBeam size={250} duration={12} delay={9} />
            
            <div className="text-6xl mb-6">🎯</div>
            <h2 className="text-3xl font-extrabold text-foreground mb-6">Welcome back!</h2>
            <p className="text-lg text-muted-foreground mb-8">Ready to continue your transformation journey?</p>
            
            <Link 
              href="/dashboard"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 font-semibold text-lg shadow-lg"
            >
              Continue Your Journey <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </BlurFade>
      </div>
    )
  }

  // Main landing page
  return (
    <div className="bg-background text-foreground">
      <Header />
      <Hero />
      <Features />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  )
}
