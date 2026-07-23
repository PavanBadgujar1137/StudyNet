import React from 'react'
import { OHCard } from '../../../components/openhand'

export function MyJourney({ clientName = 'Priya', practitionerName = 'Meera' }) {
  return (
    <div className="tab-view-journey">
      <div className="tab-hd">
        <div className="k">My journey</div>
        <h1>You're 34 days in, {clientName}.</h1>
        <p>This is your path — only you and {practitionerName} can see it. There's no score, no comparison with anyone else, and no wrong pace.</p>
      </div>

      {/* Check-in rhythm streak card */}
      <OHCard surface="white" pad="md" style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 18 }}>Your check-in rhythm</h3>
          <span style={{ fontSize: 13, color: 'var(--oh-muted)' }}>You set this yourself: 3 times a week</span>
        </div>
        <div className="streak">
          <div className="sd f">M</div>
          <div className="sd">T</div>
          <div className="sd f">W</div>
          <div className="sd">T</div>
          <div className="sd f">F</div>
          <div className="sd">S</div>
          <div className="sd today">Today</div>
        </div>
        <p className="note">Missed a day? Nothing breaks. Come back whenever — the point is the noticing, not the streak.</p>
      </OHCard>

      {/* Timeline Steps */}
      <div className="jrn">
        <div className="step done">
          <div className="mark"><div className="ring">✓</div><div className="when">17 June</div></div>
          <div className="bub">
            <h3>You booked a first session</h3>
            <p>You filled in six questions before you'd even met her, so the first hour went straight to what mattered instead of warming up.</p>
            <span className="tagline">Where it started</span>
          </div>
        </div>

        <div className="step done">
          <div className="mark"><div className="ring">✓</div><div className="when">24 June</div></div>
          <div className="bub">
            <h3>You checked in for the first time</h3>
            <p>Eleven seconds. You picked "stretched thin" and wrote two lines about Sunday evenings.</p>
            <span className="tagline">First check-in</span>
          </div>
        </div>

        <div className="step done">
          <div className="mark"><div className="ring">✓</div><div className="when">8 July</div></div>
          <div className="bub">
            <h3>Three sessions in — something shifted</h3>
            <p>You told {practitionerName} you'd noticed the pattern before she named it. That's the part that doesn't show up in any chart.</p>
            <span className="tagline">Session 3</span>
          </div>
        </div>

        <div className="step now">
          <div className="mark"><div className="ring">4</div><div className="when">Now</div></div>
          <div className="bub">
            <h3>You joined the August circle</h3>
            <p>Seven other people, six weeks, starting 4 August. You'll meet them on the first evening. Nobody has to say more than they want to.</p>
            <span className="tagline">Starts in 14 days</span>
          </div>
        </div>

        <div className="step locked">
          <div className="mark"><div className="ring">5</div><div className="when">Week 6</div></div>
          <div className="bub">
            <h3>Circle completes</h3>
            <p>You'll have the option to keep going — the ongoing circle, more 1:1 sessions, or a pause. All three are fine.</p>
          </div>
        </div>

        <div className="step locked">
          <div className="mark"><div className="ring">6</div><div className="when">Later</div></div>
          <div className="bub">
            <h3>Wherever this goes next</h3>
            <p>Some people finish here. Some stay for years. You'll decide, not us.</p>
          </div>
        </div>
      </div>

      {/* Milestones Card */}
      <OHCard surface="white" pad="md" style={{ marginTop: 16 }}>
        <div style={{ marginBottom: 16 }}><h3 style={{ fontSize: 18 }}>Milestones you've reached</h3></div>
        <div className="ms">
          <div className="mcard got"><span className="ic">◆</span><b>First session</b><span>17 June</span></div>
          <div className="mcard got"><span className="ic">◆</span><b>10 check-ins</b><span>12 July</span></div>
          <div className="mcard got"><span className="ic">◆</span><b>Joined a circle</b><span>19 July</span></div>
          <div className="mcard"><span class="ic">◇</span><b>Finish a circle</b><span>Not yet</span></div>
        </div>
        <p className="note">Milestones are private by default. If you ever want to share one, that's your choice — and it never includes anything you wrote.</p>
      </OHCard>
    </div>
  )
}

export default MyJourney
