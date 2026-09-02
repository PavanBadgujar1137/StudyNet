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
      <div className="p-4 sm:p-6 space-y-6">
        {!completed ? (
          <>
            <div className="border-b border-richblack-700 pb-4">
              <OHEyebrow text="Stage 02 — Learner Intake" />
              <h3 className="text-xl font-bold text-richblack-5 mt-1">
                An intake that does the small talk for you
              </h3>
              <p className="text-xs text-richblack-300 mt-1 flex items-center gap-1.5">
                <FiClock className="text-teal-400" />
                Saves ~15 minutes of your call with {practitionerName || 'your practitioner'}
              </p>
            </div>

            {/* Step Progress Bar */}
            <div className="flex items-center justify-between text-xs text-richblack-400 font-medium">
              <span>Question {currentStep + 1} of {activeQuestions.length}</span>
              <span>{Math.round(((currentStep + 1) / activeQuestions.length) * 100)}% Completed</span>
            </div>
            <div className="w-full h-1.5 bg-richblack-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-400 to-indigo-500 transition-all duration-300"
                style={{ width: `${((currentStep + 1) / activeQuestions.length) * 100}%` }}
              />
            </div>

            {/* Active Question Box */}
            <div className="bg-richblack-800 border border-richblack-700 p-4 rounded-xl space-y-3">
              <label className="block text-sm font-semibold text-richblack-100">
                {activeQuestions[currentStep]}
              </label>
              <textarea
                value={answers[currentStep]}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Type your reflection or answer here..."
                rows={4}
                className="w-full bg-richblack-900 border border-richblack-600 rounded-lg p-3 text-sm text-richblack-5 focus:outline-none focus:border-teal-400 resize-none"
              />
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg ${
                  currentStep === 0
                    ? 'text-richblack-600 cursor-not-allowed'
                    : 'text-richblack-300 hover:text-richblack-5 hover:bg-richblack-800'
                }`}
              >
                <FiArrowLeft /> Back
              </button>

              <OHButton
                onClick={handleNext}
                disabled={isSubmitting}
                variant="primary"
              >
                {currentStep === activeQuestions.length - 1 ? (
                  isSubmitting ? 'Saving Intake...' : 'Submit & Proceed'
                ) : (
                  <span className="flex items-center gap-2">
                    Next Question <FiArrowRight />
                  </span>
                )}
              </OHButton>
            </div>
          </>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center mx-auto text-2xl">
              <FiCheckCircle />
            </div>
            <h4 className="text-lg font-bold text-richblack-5">Intake Completed!</h4>
            <p className="text-xs text-richblack-300 max-w-sm mx-auto">
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
