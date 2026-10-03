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
    <OHModal open={open} onClose={onClose} size="md">
      <div className="p-5 sm:p-7 space-y-5 bg-white text-slate-900 rounded-2xl">
        {!completed ? (
          <>
            {/* Top Header & Eyebrow */}
            <div className="border-b border-slate-100 pb-4 space-y-1.5">
              <OHEyebrow>Stage 02 — Learner Intake</OHEyebrow>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                An intake that does the small talk for you
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium flex items-center gap-1.5 pt-0.5">
                <FiClock className="text-blue-600 flex-shrink-0" />
                Saves ~15 minutes of your call with <span className="font-bold text-slate-800">{practitionerName || 'Dr. Sarah M.'}</span>
              </p>
            </div>

            {/* Step Progress Indicator & Bar */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                <span>Question {currentStep + 1} of {activeQuestions.length}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/80">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 rounded-full"
                  style={{ width: `${((currentStep + 1) / activeQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Label & Textarea */}
            <div className="space-y-2.5 pt-2">
              <label className="block text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                {activeQuestions[currentStep]}
              </label>
              <textarea
                value={answers[currentStep]}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Type your reflection or answer here..."
                rows={5}
                style={{
                  color: '#020617',
                  WebkitTextFillColor: '#020617',
                  backgroundColor: '#FFFFFF',
                  caretColor: '#2563EB',
                  opacity: 1,
                  fontSize: '16px',
                  fontWeight: '600',
                  lineHeight: '1.6',
                }}
                className="oh-intake-textarea w-full bg-white border-2 border-slate-300 rounded-xl p-4 text-base font-semibold text-slate-950 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 resize-none shadow-sm transition-all"
              />
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
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
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 border border-blue-200 rounded-2xl flex items-center justify-center mx-auto text-3xl shadow-sm">
              <FiCheckCircle />
            </div>
            <h4 className="text-2xl font-extrabold text-slate-900">Intake Completed!</h4>
            <p className="text-sm text-slate-600 font-medium max-w-sm mx-auto leading-relaxed">
              Your responses have been saved and sent directly to <span className="font-bold text-slate-800">{practitionerName || 'your practitioner'}</span>. 
              They will review it before your call so you skip the 15-minute warm-up!
            </p>
            <OHButton onClick={onClose} variant="primary" size="lg" className="mt-4">
              Continue to Booking
            </OHButton>
          </div>
        )}
      </div>
    </OHModal>
  )
}

export default IntakeModal
