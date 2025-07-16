'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { BlurFade } from '@/components/magicui/blur-fade'
import { BorderBeam } from '@/components/magicui/border-beam'

const faqs = [
  {
    question: "How is NoFears different from therapy?",
    answer: "NoFears complements therapy by providing daily actionable tasks. While therapy helps you understand your problems, NoFears gives you concrete steps to rebuild your life systematically."
  },
  {
    question: "How long does it take to see results?",
    answer: "Most users report feeling more hopeful and organized within the first week. Significant life improvements typically occur within 30-90 days of consistent use."
  },
  {
    question: "Is my data private and secure?",
    answer: "Absolutely. All your data is encrypted and stored securely. We never share personal information and you can delete your account at any time."
  },
  {
    question: "What if I'm not tech-savvy?",
    answer: "NoFears is designed to be simple and intuitive. If you can use email, you can use NoFears. We also provide support if you need help getting started."
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes, you can cancel your subscription at any time. No long-term commitments or hidden fees."
  }
]

export function FAQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <section id="faq" className="py-12 sm:py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <BlurFade delay={0.1} inView>
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to know about NoFears
            </p>
          </div>
        </BlurFade>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <BlurFade key={index} delay={0.1 + index * 0.1} inView>
              <div className="border border-border rounded-2xl overflow-hidden relative">
                <BorderBeam size={250} duration={12} delay={9} />
                
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-6 text-left bg-background hover:bg-muted/50 transition-colors flex items-center justify-between"
                >
                  <span className="text-xl font-semibold pr-8">{faq.question}</span>
                  <ChevronDown 
                    className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
                      openFaq === index ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="p-6 pt-0 text-base leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </BlurFade>
          ))}
        </div>

      </div>
    </section>
  )
} 