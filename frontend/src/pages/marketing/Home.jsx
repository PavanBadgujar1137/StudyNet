import React from 'react'
import { OHNav, OHFooter, OHButton, OHEyebrow, OHCard, OHCardTitle, OHCardBody } from '../../components/openhand'
import './Home.css'

export function Home() {
  return (
    <div className="oh-home-page">

      {/* Hero */}
      <header className="oh-home-hero">
        <div className="oh-wrap">
          <OHEyebrow>For coaches, counsellors &amp; healers</OHEyebrow>
          <h1>
            You already know how to hold space.<br />
            <span className="oh-grad-text">We'll help you hold it online — and get paid for it.</span>
          </h1>
          <p className="sub">
            OpenHand is the practice platform built for people who guide, not just teach.
            Client check-ins, private cohorts, and real community — without the corporate LMS feel.
          </p>
          <div className="cta-row">
            <OHButton href="/start-free" size="lg">Start your free practice space</OHButton>
            <OHButton href="/client-journey" variant="ghost" size="lg">See a sample client journey →</OHButton>
          </div>
        </div>
      </header>

      {/* Held wave line SVG */}
      <div className="held-line-wrap oh-wrap" aria-hidden="true">
        <svg className="held-line" viewBox="0 0 1080 64" preserveAspectRatio="none">
          <path
            d="M0 32 C 180 4, 360 60, 540 32 C 720 4, 900 60, 1080 32"
            fill="none"
            stroke="var(--oh-blue)"
            strokeWidth="1.5"
            opacity="0.35"
          />
        </svg>
      </div>

      {/* Section 1: Built around how you actually work */}
      <section className="oh-sec">
        <div className="oh-wrap">
          <OHEyebrow>Not modules. Practice.</OHEyebrow>
          <h2 className="oh-sec-title">Built around how you actually work with people</h2>
          <div className="oh-grid-3">
            <OHCard lift pad="md">
              <OHCardTitle>Client check-ins</OHCardTitle>
              <OHCardBody>
                Simple, recurring check-ins that show you how someone's really doing between sessions — not just whether they clicked "complete."
              </OHCardBody>
            </OHCard>
            <OHCard lift pad="md">
              <OHCardTitle>Gentle progress tracking</OHCardTitle>
              <OHCardBody>
                Mood and progress tracking your clients will actually use, because it feels like reflection, not a clinical dashboard.
              </OHCardBody>
            </OHCard>
            <OHCard lift pad="md">
              <OHCardTitle>Private cohorts</OHCardTitle>
              <OHCardBody>
                Small group containers with their own rhythm and boundaries — not a public course feed anyone can wander into.
              </OHCardBody>
            </OHCard>
          </div>
        </div>
      </section>

      {/* Section 2: People heal in circles */}
      <section className="oh-sec oh-sec-community">
        <div className="oh-wrap">
          <OHEyebrow>The part corporate LMS forgets</OHEyebrow>
          <h2 className="oh-sec-title">People heal in circles, not in isolation</h2>
          <div className="oh-grid-3">
            <OHCard lift pad="md">
              <OHCardTitle>Peer circles</OHCardTitle>
              <OHCardBody>
                Give clients a place to hold each other between sessions, guided but not dependent on you.
              </OHCardBody>
            </OHCard>
            <OHCard lift pad="md">
              <OHCardTitle>Live sessions</OHCardTitle>
              <OHCardBody>
                Built-in group calls that feel like your living room, not a webinar platform.
              </OHCardBody>
            </OHCard>
            <OHCard lift pad="md">
              <OHCardTitle>Accountability pods</OHCardTitle>
              <OHCardBody>
                Small, self-organizing groups that keep momentum going long after the module ends.
              </OHCardBody>
            </OHCard>
          </div>
        </div>
      </section>

      {/* Section 3: AI that sounds like you */}
      <section className="oh-sec">
        <div className="oh-wrap">
          <OHEyebrow>Quietly intelligent</OHEyebrow>
          <h2 className="oh-sec-title">AI that sounds like you, not like a bot</h2>
          <div className="oh-grid-3">
            <OHCard pad="md" className="dashed-card">
              <OHCardTitle>AI reflection prompts</OHCardTitle>
              <OHCardBody>
                Clients get thoughtful, personalized prompts between sessions — written in a tone you set, not a generic bot voice.
              </OHCardBody>
            </OHCard>
            <OHCard pad="md" className="dashed-card">
              <OHCardTitle>Human-sounding nudges</OHCardTitle>
              <OHCardBody>
                Automated check-ins that read like they came from you, so no one feels like they fell into a drip campaign.
              </OHCardBody>
            </OHCard>
            <OHCard pad="md" className="dashed-card">
              <OHCardTitle>Notes-to-content converter</OHCardTitle>
              <OHCardBody>
                Turn your own session notes into your next lesson or resource automatically — your expertise, structured for you.
              </OHCardBody>
            </OHCard>
          </div>
        </div>
      </section>

      {/* Section 4: Built for trust */}
      <section className="oh-sec oh-sec-dark">
        <div className="oh-wrap">
          <OHEyebrow dark>Held with care</OHEyebrow>
          <h2 className="oh-sec-title dark">Built for the trust your work depends on</h2>
          <div className="oh-grid-3">
            <OHCard surface="navy" pad="md">
              <OHCardTitle>Confidentiality by design</OHCardTitle>
              <OHCardBody>
                Private cohorts and client data are separated and access-controlled from the ground up, not bolted on.
              </OHCardBody>
            </OHCard>
            <OHCard surface="navy" pad="md">
              <OHCardTitle>Ethical-practice standards</OHCardTitle>
              <OHCardBody>
                Built alongside practitioners, with guardrails that reflect real coaching and counselling ethics codes.
              </OHCardBody>
            </OHCard>
            <OHCard surface="navy" pad="md">
              <OHCardTitle>Protected conversations</OHCardTitle>
              <OHCardBody>
                Session notes and sensitive client information are encrypted and never used to train external models.
              </OHCardBody>
            </OHCard>
          </div>
        </div>
      </section>

      {/* Section 5: 3-step ladder */}
      <section className="oh-sec ladder-sec">
        <div className="oh-wrap text-center">
          <OHEyebrow>Start where you're comfortable</OHEyebrow>
          <h2 className="oh-sec-title">Three ways in — no pressure, no sales call required first</h2>
          <div className="ladder-steps">
            <OHCard surface="white" pad="lg" className="step-card">
              <span className="step-num">One</span>
              <OHCardTitle>Start your free practice space</OHCardTitle>
              <OHCardBody>Set up your space in minutes. No card required, no time limit to explore.</OHCardBody>
              <a href="/start-free" className="step-link">Start free →</a>
            </OHCard>

            <OHCard surface="white" pad="lg" className="step-card">
              <span className="step-num">Two</span>
              <OHCardTitle>See a sample client journey</OHCardTitle>
              <OHCardBody>Walk through what a client actually experiences, from check-in to cohort.</OHCardBody>
              <a href="/client-journey" className="step-link">View sample journey →</a>
            </OHCard>

            <OHCard surface="white" pad="lg" className="step-card">
              <span className="step-num">Three</span>
              <OHCardTitle>Talk to a real human</OHCardTitle>
              <OHCardBody>Have questions specific to your practice? Book time with our team, not a bot.</OHCardBody>
              <a href="/talk-to-human" className="step-link">Book a conversation →</a>
            </OHCard>
          </div>
        </div>
      </section>

      <OHFooter />
    </div>
  )
}

export default Home
