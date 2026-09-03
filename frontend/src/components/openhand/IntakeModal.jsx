import React, { useState, useEffect } from 'react'
import { OHModal } from './OHModal'
import { OHButton } from './OHButton'
import { OHEyebrow } from './OHEyebrow'
import { FiCheckCircle, FiArrowRight, FiArrowLeft, FiClock } from 'react-icons/fi'

export function IntakeModal({ open, onClose, practitionerName, questions = [], onSubmit }) {
  const defaultQuestions = [
    "What brought you to this session today?",
    "What have you tried so far to address this?",
    "What is your primary goal for our work together?",
    "How would you rate your current stress or burnout level (1-10)?",
    "Are there specific topics or boundaries you want to focus on?",
    "What outcome would make this journey a success for you in 6 weeks?",
  ]

  const activeQuestions = questions.length > 0 ? questions : defaultQuestions
  const [answers, setAnswers] = useState(Array(activeQuestions.length).fill(''))
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    if (open) {
      setAnswers(Array(activeQuestions.length).fill(''))
      setCurrentStep(0)
      setCompleted(false)
    }
  }, [open, questions, activeQuestions.length])

  const handleAnswerChange = (text) => {
    const newAnswers = [...answers]
    newAnswers[currentStep] = text
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentStep < activeQuestions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const formattedAnswers = activeQuestions.map((q, idx) => ({
      question: q,
      answer: answers[idx] || 'Not answered',
    }))

    try {
      if (onSubmit) {
        await onSubmit(formattedAnswers)
      }
      setCompleted(true)
    } catch (err) {
      console.error('Intake submission error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <OHModal open={open} onClose={onClose} size="md" title="Pre-Session Intake">
      <div className="p-4 sm:p-6 space-y-6 bg-white text-slate-900 rounded-2xl">
        {!completed ? (
          <>
            <div className="border-b border-slate-200 pb-4">
              <OHEyebrow text="Stage 02 — Learner Intake" />
              <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                An intake that does the small talk for you
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                <FiClock className="text-blue-600" />
                Saves ~15 minutes of your call with {practitionerName || 'Dr. Sarah M.'}
              </p>
            </div>

            {/* Step Progress Bar */}
            <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
              <span>Question {currentStep + 1} of {activeQuestions.length}</span>
              <span>{Math.round(((currentStep + 1) / activeQuestions.length) * 100)}% Completed</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 rounded-full"
                style={{ width: `${((currentStep + 1) / activeQuestions.length) * 100}%` }}
              />
            </div>

            {/* Active Question Box */}
            <div className="bg-slate-50 border border-slate-200 p-4 sm:p-5 rounded-2xl space-y-3">
              <label className="block text-sm sm:text-base font-extrabold text-slate-900">
                {activeQuestions[currentStep]}
              </label>
              <textarea
                value={answers[currentStep]}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Type your reflection or answer here..."
                rows={4}
                style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}
                className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 resize-none shadow-sm transition-all"
              />
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-all ${
                  currentStep === 0
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FiArrowLeft /> Back
              </button>

              <OHButton
                onClick={handleNext}
                disabled={isSubmitting}
                variant="primary"
                size="md"
              >
                {currentStep === activeQuestions.length - 1 ? (
                  isSubmitting ? 'Saving Intake...' : 'Submit & Proceed'
                ) : (
                  <span className="flex items-center gap-2 font-bold">
                    Next Question <FiArrowRight />
                  </span>
                )}
              </OHButton>
            </div>
          </>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 border border-blue-200 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-sm">
              <FiCheckCircle />
            </div>
            <h4 className="text-xl font-extrabold text-slate-900">Intake Completed!</h4>
            <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-sm mx-auto leading-relaxed">
              Your responses have been saved and sent directly to {practitionerName || 'your practitioner'}. 
              They will review it before your call so you skip the 15-minute warm-up!
            </p>
            <OHButton onClick={onClose} variant="primary" className="mt-4">
              Continue to Booking
            </OHButton>
          </div>
        )}
      </div>
    </OHModal>
  )
}

export default IntakeModal
