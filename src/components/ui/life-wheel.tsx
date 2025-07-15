'use client'

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { LifeAssessment, LIFE_CATEGORIES, LifeCategory } from '@/types/database'

interface LifeWheelProps {
  assessment: LifeAssessment | null
  size?: 'sm' | 'md' | 'lg'
  showLabels?: boolean
  animated?: boolean
}

export function LifeWheel({ assessment, size = 'md', showLabels = true, animated = true }: LifeWheelProps) {
  const sizeConfig = {
    sm: { height: 200, fontSize: 10 },
    md: { height: 300, fontSize: 12 },
    lg: { height: 400, fontSize: 14 }
  }

  const config = sizeConfig[size]

  const data = Object.entries(LIFE_CATEGORIES).map(([key, category]) => {
    const categoryKey = key as LifeCategory
    const scoreKey = `${categoryKey}_score` as keyof LifeAssessment
    const score = assessment ? (assessment[scoreKey] as number) : 0
    
    return {
      category: category.label,
      score: score,
      fullMark: 10,
      icon: category.icon
    }
  })

  const averageScore = assessment 
    ? Math.round((
        assessment.health_score +
        assessment.career_score +
        assessment.relationships_score +
        assessment.finances_score +
        assessment.personal_growth_score +
        assessment.leisure_score
      ) / 6 * 10) / 10
    : 0

  return (
    <div className="w-full">
      <div className="relative">
        <ResponsiveContainer width="100%" height={config.height}>
          <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis 
              dataKey="category" 
              tick={{ fontSize: config.fontSize, fill: '#374151' }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 10]}
              tick={{ fontSize: config.fontSize - 2, fill: '#6b7280' }}
              tickCount={6}
            />
            <Radar
              name="Life Score"
              dataKey="score"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              strokeWidth={2}
              dot={{ r: 4, fill: '#3b82f6' }}
              className={animated ? 'animate-pulse' : ''}
            />
          </RadarChart>
        </ResponsiveContainer>
        
        {/* Center Score Display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center bg-white/90 rounded-full p-4 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">
              {averageScore}
            </div>
            <div className="text-xs text-gray-600">
              Overall
            </div>
          </div>
        </div>
      </div>

      {/* Score Legend */}
      {showLabels && (
        <div className="mt-6 grid grid-cols-2 gap-2 text-sm">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{item.icon}</span>
                <span className="text-gray-700 text-xs">{item.category}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-blue-600">{item.score}</span>
                <span className="text-gray-400">/10</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Motivational Message */}
      {assessment && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 text-center">
            {averageScore >= 8 && "🎉 You're thriving! Keep up the amazing work!"}
            {averageScore >= 6 && averageScore < 8 && "🌟 You're doing well! Small improvements will make a big difference."}
            {averageScore >= 4 && averageScore < 6 && "💪 You're on the right path. Every step forward counts!"}
            {averageScore < 4 && "🌱 This is your starting point. Growth begins with a single step forward."}
          </p>
        </div>
      )}
    </div>
  )
}

interface LifeWheelSkeletonProps {
  size?: 'sm' | 'md' | 'lg'
}

export function LifeWheelSkeleton({ size = 'md' }: LifeWheelSkeletonProps) {
  const sizeConfig = {
    sm: { height: 200 },
    md: { height: 300 },
    lg: { height: 400 }
  }

  return (
    <div className="w-full animate-pulse">
      <div 
        className="bg-gray-200 rounded-lg mb-6" 
        style={{ height: sizeConfig[size].height }}
      />
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded-lg" />
        ))}
      </div>
    </div>
  )
} 