import React, { useState } from 'react'
import { OHCard, OHKanban, OHButton } from '../../components/openhand'
import { apiConnector } from '../../services/apiConnector'
import toast from 'react-hot-toast'

export function Circles() {
  const [cards, setCards] = useState([
    {
      id: 'c1',
      stageId: 'filling',
      title: 'Anxiety & the nervous system',
      subtitle: 'Starts 4 Aug · ₹15,000/seat',
      tags: ['6 of 8 seats', '₹90k committed'],
      avatar: 'AN',
    },
    {
      id: 'c2',
      stageId: 'filling',
      title: 'New parents circle',
      subtitle: 'Starts 12 Aug · ₹12,000/seat',
      tags: ['3 of 8 seats', '₹36k committed'],
      avatar: 'NP',
    },
    {
      id: 'c3',
      stageId: 'running',
      title: 'Grief circle — July cohort',
      subtitle: 'Week 4 of 6 · 8 seats',
      tags: ['94% attendance', 'Thu 19:00'],
      avatar: 'GC',
    },
    {
      id: 'c4',
      stageId: 'closing',
      title: 'Burnout circle — June',
      subtitle: 'Final session Friday',
      tags: ['Testimonials queued'],
      avatar: 'BC',
    },
    {
      id: 'c5',
      stageId: 'completed',
      title: 'Anxiety circle — May',
      subtitle: '8 finished · 5 to membership',
      tags: ['Completed'],
      avatar: 'AC',
    },
  ])

  const columns = [
    { id: 'filling', label: 'Filling', color: '#1F5FE0' },
    { id: 'running', label: 'Running', color: '#4733C9' },
    { id: 'closing', label: 'Closing', color: '#6B33D2' },
    { id: 'completed', label: 'Completed', color: '#8A2BE0' },
  ]

  const handleStageChange = async (cardId, newStage) => {
    // Update local state immediately for responsive UI
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, stageId: newStage } : c))
    )

    try {
      await apiConnector('PATCH', `/api/v1/circles/${cardId}/stage`, { kanbanStage: newStage })
      toast.success(`Circle moved to ${newStage}`)
    } catch (err) {
      console.warn('Stage update error:', err)
    }
  }

  return (
    <div className="practice-sec-circles">
      <div className="htop">
        <div>
          <div className="crumb">Circles</div>
          <h1>Circles manager</h1>
          <p>Four circles at different stages. Drag between columns as they move.</p>
        </div>
        <OHButton onClick={() => toast.success('Circle creation wizard opening...')}>
          Open a new circle
        </OHButton>
      </div>

      {/* Drag & Drop Kanban */}
      <OHKanban columns={columns} cards={cards} onStageChange={handleStageChange} />

      {/* Economics Telemetry Card */}
      <OHCard surface="white" pad="lg" style={{ marginTop: 20 }}>
        <div className="sechd"><h3>Circle economics</h3></div>
        <div className="g3">
          <div className="stat">
            <div className="lbl">Hours per circle</div>
            <div className="val">9</div>
            <div className="dl flat">6 sessions + prep</div>
          </div>
          <div className="stat">
            <div className="lbl">Revenue per circle</div>
            <div className="val">₹1,20,000</div>
            <div className="dl flat">at 8 seats</div>
          </div>
          <div className="stat">
            <div className="lbl">Effective hourly</div>
            <div className="val">₹13,333</div>
            <div className="dl up">vs ₹3,500 for 1:1</div>
          </div>
        </div>
        <p className="note">This is the argument for circles in one line: the same evening, roughly four times the return, and clients who hold each other between sessions.</p>
      </OHCard>
    </div>
  )
}

export default Circles
