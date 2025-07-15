'use client'

import { useState } from 'react'
import { LifeCategory, LIFE_CATEGORIES } from '@/types/database'

interface LifeAssessmentProps {
  onComplete: (scores: Record<LifeCategory, number>) => void
  initialScores?: Partial<Record<LifeCategory, number>>
  isLoading?: boolean
}

export function LifeAssessment({ onComplete, initialScores = {}, isLoading = false }: LifeAssessmentProps) {
  const [scores, setScores] = useState<Record<LifeCategory, number>>(() => {
    const defaultScores: Record<LifeCategory, number> = {
      health: 5,
      career: 5,
      relationships: 5,
      finances: 5,
      personal_growth: 5,
      leisure: 5
    }
    
    return { ...defaultScores, ...initialScores }
  })

  const [currentCategory, setCurrentCategory] = useState<LifeCategory>('health')
  const [completedCategories, setCompletedCategories] = useState<Set<LifeCategory>>(new Set())

  const categories = Object.keys(LIFE_CATEGORIES) as LifeCategory[]
  const currentIndex = categories.indexOf(currentCategory)
  const isLastCategory = currentIndex === categories.length - 1

  const updateScore = (category: LifeCategory, score: number) => {
    setScores(prev => ({ ...prev, [category]: score }))
    setCompletedCategories(prev => new Set(prev).add(category))
  }

  const handleNext = () => {
    if (isLastCategory) {
      onComplete(scores)
    } else {
      setCurrentCategory(categories[currentIndex + 1])
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentCategory(categories[currentIndex - 1])
    }
  }

  const progress = ((currentIndex + 1) / categories.length) * 100

  const getScoreDescription = (score: number) => {
    if (score <= 2) return { text: "Needs immediate attention", color: "text-red-600", bg: "bg-red-50" }
    if (score <= 4) return { text: "Could use some improvement", color: "text-orange-600", bg: "bg-orange-50" }
    if (score <= 6) return { text: "Doing okay, room for growth", color: "text-yellow-600", bg: "bg-yellow-50" }
    if (score <= 8) return { text: "Pretty good, keep it up!", color: "text-green-600", bg: "bg-green-50" }
    return { text: "Excellent! You're thriving!", color: "text-emerald-600", bg: "bg-emerald-50" }
  }

  const currentCategoryData = LIFE_CATEGORIES[currentCategory]
  const currentScore = scores[currentCategory]
  const scoreDescription = getScoreDescription(currentScore)

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {currentIndex + 1} of {categories.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Category Assessment */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{currentCategoryData.icon}</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {currentCategoryData.label}
          </h2>
          <p className="text-gray-600">
            {currentCategoryData.description}
          </p>
        </div>

        {/* Score Slider */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            How satisfied are you with this area of your life?
          </label>
          
          <div className="relative">
            <input
              type="range"
              min="1"
              max="10"
              value={currentScore}
              onChange={(e) => updateScore(currentCategory, parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>1 - Very Poor</span>
              <span>5 - Average</span>
              <span>10 - Excellent</span>
            </div>
          </div>

          {/* Current Score Display */}
          <div className={`mt-4 p-4 rounded-lg ${scoreDescription.bg}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  {currentScore}/10
                </div>
                <div className={`text-sm font-medium ${scoreDescription.color}`}>
                  {scoreDescription.text}
                </div>
              </div>
              <div className="text-4xl">
                {currentScore <= 3 ? '😔' : currentScore <= 6 ? '😐' : currentScore <= 8 ? '😊' : '🎉'}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          
          <button
            onClick={handleNext}
            disabled={isLoading}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : isLastCategory ? (
              'Complete Assessment'
            ) : (
              'Next →'
            )}
          </button>
        </div>
      </div>

      {/* Categories Overview */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map((category) => {
            const categoryData = LIFE_CATEGORIES[category]
            const isCompleted = completedCategories.has(category)
            const isCurrent = category === currentCategory
            const score = scores[category]
            
            return (
              <div
                key={category}
                className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  isCurrent 
                    ? 'border-blue-500 bg-blue-50' 
                    : isCompleted 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
                onClick={() => setCurrentCategory(category)}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">{categoryData.icon}</div>
                  <div className="text-xs font-medium text-gray-700">
                    {categoryData.label.split(' ')[0]}
                  </div>
                  {isCompleted && (
                    <div className="text-xs font-bold text-green-600 mt-1">
                      {score}/10
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

{/* Custom Slider Styles */}
const sliderStyles = `
  .slider::-webkit-slider-thumb {
    appearance: none;
    height: 24px;
    width: 24px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .slider::-moz-range-thumb {
    height: 24px;
    width: 24px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = sliderStyles
  document.head.appendChild(style)
} 