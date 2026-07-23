import React, { useEffect, useState } from 'react'
import { OHCard, OHButton, OHModal } from '../../components/openhand'
import { apiConnector } from '../../services/apiConnector'
import toast from 'react-hot-toast'

export function MyOffers() {
  const [offers, setOffers] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [newOffer, setNewOffer] = useState({
    type: 'session',
    title: '',
    description: '',
    price: 2500,
    maxSeats: 8,
  })

  useEffect(() => {
    async function loadOffers() {
      try {
        const res = await apiConnector('GET', '/api/v1/offers')
        if (res?.data?.success) {
          setOffers(res.data.offers)
        }
      } catch (err) {
        console.warn('Offers fetch error:', err)
      }
    }
    loadOffers()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newOffer.title || !newOffer.price) {
      toast.error('Title and price are required.')
      return
    }

    try {
      const res = await apiConnector('POST', '/api/v1/offers', newOffer)
      if (res?.data?.success) {
        toast.success('New offer published!')
        setOffers((prev) => [...prev, res.data.offer])
        setModalOpen(false)
      }
    } catch (err) {
      toast.error('Failed to create offer.')
    }
  }

  return (
    <div className="practice-sec-offers">
      <div className="htop">
        <div>
          <div className="crumb">My offers</div>
          <h1>What people can book</h1>
          <p>Three live offers. Start with one, add the rest when the first one sells.</p>
        </div>
        <OHButton onClick={() => setModalOpen(true)}>Create an offer</OHButton>
      </div>

      <div className="g3">
        {/* Offer 1 */}
        <div className="offer">
          <div className="kind">Session</div>
          <h4>Individual therapy hour</h4>
          <p className="d">A single 60-minute session. For people who want to start without committing to a package.</p>
          <div className="prc">₹3,500</div>
          <div className="sub">per session · 60 min</div>
          <div className="bar"><i style={{ width: '78%' }} /></div>
          <div className="cap">14 of 18 weekly slots booked</div>
          <div className="acts">
            <button className="mini">Edit</button>
            <button className="mini" onClick={() => toast.success('Link copied!')}>Share link</button>
          </div>
        </div>

        {/* Offer 2 */}
        <div className="offer">
          <div className="kind">Circle</div>
          <h4>Anxiety &amp; the nervous system</h4>
          <p className="d">Six weeks, eight people, one evening a week. Includes between-session check-ins and a private group feed.</p>
          <div className="prc">₹15,000</div>
          <div className="sub">per seat · 6 weeks</div>
          <div className="bar"><i style={{ width: '75%' }} /></div>
          <div className="cap">6 of 8 seats filled · starts 4 Aug</div>
          <div className="acts">
            <button className="mini">Manage</button>
            <button className="mini" onClick={() => toast.success('Link copied!')}>Share link</button>
          </div>
        </div>

        {/* Dynamically Created Offers */}
        {offers.map((off) => (
          <div key={off._id} className="offer">
            <div className="kind">{off.type}</div>
            <h4>{off.title}</h4>
            <p className="d">{off.description || 'Custom offer created by practitioner.'}</p>
            <div className="prc">₹{off.price?.toLocaleString('en-IN')}</div>
            <div className="sub">per {off.type}</div>
            <div className="bar"><i style={{ width: '100%' }} /></div>
            <div className="cap">Published</div>
            <div className="acts">
              <button type="button" className="mini">Edit</button>
              <button type="button" className="mini" onClick={() => toast.success('Link copied!')}>Share link</button>
            </div>
          </div>
        ))}
      </div>

      {/* Offer Breakdown Table */}
      <OHCard surface="white" pad="lg" style={{ marginTop: 20 }}>
        <div className="sechd"><h3>What each offer earned this month</h3></div>
        <div className="scroll">
          <table className="tbl">
            <thead>
              <tr><th>Offer</th><th>Bookings</th><th>Collected</th><th>OpenHand fee (5%)</th><th>You keep</th></tr>
            </thead>
            <tbody>
              <tr><td><b>Individual therapy hour</b></td><td>21</td><td>₹73,500</td><td>₹3,675</td><td><b>₹69,825</b></td></tr>
              <tr><td><b>Anxiety &amp; the nervous system</b></td><td>6 seats</td><td>₹90,000</td><td>₹4,500</td><td><b>₹85,500</b></td></tr>
              <tr><td><b>The ongoing circle</b></td><td>37 members</td><td>₹29,563</td><td>₹1,478</td><td><b>₹28,085</b></td></tr>
            </tbody>
          </table>
        </div>
        <p className="note">Illustrative figures. Payment gateway charges and GST are separate.</p>
      </OHCard>

      {/* Create Offer Modal */}
      <OHModal open={modalOpen} onClose={() => setModalOpen(false)} title="Create a New Offer">
        <form onSubmit={handleCreate} className="step-body">
          <div className="form-group">
            <label>Offer Type</label>
            <select
              value={newOffer.type}
              onChange={(e) => setNewOffer({ ...newOffer, type: e.target.value })}
            >
              <option value="session">1:1 Session</option>
              <option value="circle">Circle (Cohort Container)</option>
              <option value="program">Program (Video Modules)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Offer Title</label>
            <input
              type="text"
              placeholder="e.g. Somatic Grounding Session"
              value={newOffer.title}
              onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              rows="3"
              placeholder="Describe what this offer delivers..."
              value={newOffer.description}
              onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Price (₹ INR)</label>
            <input
              type="number"
              value={newOffer.price}
              onChange={(e) => setNewOffer({ ...newOffer, price: Number(e.target.value) })}
              required
            />
          </div>

          <OHButton type="submit" fullWidth style={{ marginTop: 16 }}>Publish Offer</OHButton>
        </form>
      </OHModal>
    </div>
  )
}

export default MyOffers
