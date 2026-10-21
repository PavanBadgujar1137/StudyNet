import React, { useState } from 'react'
import { FiX, FiAward, FiCheckCircle, FiShield } from 'react-icons/fi'

// Fast-loading WebP Badges
import communityMakerBadge from '../../assets/Badges/community-maker.webp'
import openhandVerifiedBadge from '../../assets/Badges/openhand-verified.webp'
import trustedGuideBadge from '../../assets/Badges/trusted-guide.webp'
import masterPractitionerBadge from '../../assets/Badges/master-practitioner.webp'
import peoplesChoiceBadge from '../../assets/Badges/peoples-choice.webp'

export const PRACTITIONER_BADGES = [
  {
    id: 'openhand-verified',
    name: 'OpenHand Verified',
    shortName: 'Verified',
    image: openhandVerifiedBadge,
    tagline: 'Vetted & Identity Verified',
    description: 'Officially verified by the OpenHand clinical board. Confirmed professional background, active credentials, and identity.',
    criteria: 'Completed rigorous practitioner identity, qualification vetting, and platform compliance.',
    rarity: 'Platform Vetted',
    accentColor: '#3B82F6',
    borderGlow: 'rgba(59, 130, 246, 0.45)',
  },
  {
    id: 'master-practitioner',
    name: 'Master Practitioner',
    shortName: 'Master',
    image: masterPractitionerBadge,
    tagline: 'Top Clinical Excellence',
    description: 'Awarded for demonstrating top-tier practice excellence, outstanding client outcomes, and advanced somatic & clinical mastery.',
    criteria: 'Achieved consistent 5-star clinical feedback, active Pro tier practice, and high client course completion rates.',
    rarity: 'Top Tier Honor',
    accentColor: '#F59E0B',
    borderGlow: 'rgba(245, 158, 11, 0.45)',
  },
  {
    id: 'peoples-choice',
    name: "People's Choice",
    shortName: "People's Choice",
    image: peoplesChoiceBadge,
    tagline: 'Most Loved by Learners',
    description: 'Consistently receives heartfelt 5-star learner testimonials, repeated client re-bookings, and enthusiastic community praise.',
    criteria: 'Ranked in the top percentile of repeat client bookings, high NPS, and positive written reviews.',
    rarity: 'Community Award',
    accentColor: '#EC4899',
    borderGlow: 'rgba(236, 72, 153, 0.45)',
  },
  {
    id: 'trusted-guide',
    name: 'Trusted Guide',
    shortName: 'Trusted Guide',
    image: trustedGuideBadge,
    tagline: 'Empathetic & Reliable Support',
    description: 'Honored for exceptional empathy, consistent guidance, psychological safety, and deep learner trust in 1-on-1 sessions.',
    criteria: 'Exemplary reliability, compassionate communication, and 100% on-time session fulfillment.',
    rarity: 'Trust Honor',
    accentColor: '#6366F1',
    borderGlow: 'rgba(99, 102, 241, 0.45)',
  },
  {
    id: 'community-maker',
    name: 'Community Maker',
    shortName: 'Community Care',
    image: communityMakerBadge,
    tagline: 'Peer Circles & Group Spaces',
    description: 'Awarded for fostering vibrant peer circles, active group discussions, and safe community healing spaces.',
    criteria: 'Actively facilitates interactive group cohorts, community discussions, and peer support rooms.',
    rarity: 'Impact Award',
    accentColor: '#8B5CF6',
    borderGlow: 'rgba(139, 92, 246, 0.45)',
  },
]

/**
 * Returns full badge objects based on IDs or returns default set
 */
export function getBadgesForPractitioner(badgeIds) {
  if (!badgeIds || !Array.isArray(badgeIds) || badgeIds.length === 0) {
    return PRACTITIONER_BADGES
  }
  const filtered = PRACTITIONER_BADGES.filter((b) =>
    badgeIds.some((id) => (typeof id === 'string' ? id.toLowerCase() : '') === b.id)
  )
  return filtered.length > 0 ? filtered : PRACTITIONER_BADGES
}

/**
 * Competitor-style Badge Strip (Topmate-inspired)
 * Shows dark rounded cards with 3D WebP icons and complete, untruncated badge names.
 */
export function PractitionerBadgeStrip({
  badges,
  maxDisplay = 3,
  onOpenModal,
  size = 'default', // 'compact' | 'default'
  gridColumns, // e.g. 2 for 2x2
}) {
  const badgeList = getBadgesForPractitioner(badges)
  const [internalModalOpen, setInternalModalOpen] = useState(false)

  const handleOpen = () => {
    if (onOpenModal) {
      onOpenModal()
    } else {
      setInternalModalOpen(true)
    }
  }

  const isCompact = size === 'compact'
  const isGrid = Boolean(gridColumns)
  const cardWidth = isGrid ? (isCompact ? 68 : 88) : (isCompact ? 68 : 88)
  const cardHeight = isGrid ? (isCompact ? 72 : 92) : (isCompact ? 72 : 92)
  const iconSize = isCompact ? 34 : 44
  const fontSize = isCompact ? 10 : 11

  const displayedBadges = badgeList.slice(0, maxDisplay)
  const remainingCount = Math.max(0, badgeList.length - maxDisplay)

  return (
    <>
      <div
        className="oh-badge-strip-container"
        style={
          isGrid
            ? {
                display: 'grid',
                gridTemplateColumns: `repeat(${gridColumns}, ${cardWidth}px)`,
                gap: isCompact ? '6px' : '10px',
                position: 'relative',
              }
            : {
                display: 'inline-flex',
                alignItems: 'center',
                gap: isCompact ? '8px' : '10px',
                flexWrap: 'wrap',
                position: 'relative',
              }
        }
      >
        {displayedBadges.map((b) => (
          <div
            key={b.id}
            onClick={handleOpen}
            title={`${b.name} — ${b.tagline}`}
            style={{
              width: `${cardWidth}px`,
              height: `${cardHeight}px`,
              background: 'linear-gradient(180deg, #161B26 0%, #0B0F17 100%)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              borderRadius: isCompact ? '10px' : '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: isCompact ? '6px 4px' : '8px 6px',
              cursor: 'pointer',
              transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
              position: 'relative',
              userSelect: 'none',
              boxSizing: 'border-box',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.04)'
              e.currentTarget.style.borderColor = b.borderGlow
              e.currentTarget.style.boxShadow = `0 8px 20px ${b.borderGlow}`
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.25)'
            }}
          >
            <img
              src={b.image}
              alt={b.name}
              loading="lazy"
              style={{
                width: `${iconSize}px`,
                height: `${iconSize}px`,
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.45))',
                marginBottom: '4px',
              }}
            />
            <span
              style={{
                fontSize: `${fontSize}px`,
                fontWeight: 700,
                color: '#FFFFFF',
                textAlign: 'center',
                lineHeight: 1.15,
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                maxWidth: '100%',
                letterSpacing: '-0.2px',
              }}
            >
              {b.shortName}
            </span>
          </div>
        ))}

        {remainingCount > 0 && (
          <button
            type="button"
            onClick={handleOpen}
            title="Click to view all earned honors & badges"
            style={{
              width: `${cardWidth}px`,
              height: `${cardHeight}px`,
              background: 'linear-gradient(180deg, #161B26 0%, #0B0F17 100%)',
              border: '1.5px dashed rgba(255, 255, 255, 0.28)',
              borderRadius: isCompact ? '10px' : '12px',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: isCompact ? '6px 4px' : '8px 6px',
              transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
              boxSizing: 'border-box',
              userSelect: 'none',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#60A5FA'
              e.currentTarget.style.background = 'linear-gradient(180deg, #1E273A 0%, #0F1626 100%)'
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.04)'
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.3)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.28)'
              e.currentTarget.style.background = 'linear-gradient(180deg, #161B26 0%, #0B0F17 100%)'
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.25)'
            }}
          >
            <FiAward
              size={isCompact ? 16 : 22}
              color="#F59E0B"
              style={{
                marginBottom: '4px',
                filter: 'drop-shadow(0 2px 4px rgba(245, 158, 11, 0.4))',
              }}
            />
            <span
              style={{
                fontSize: `${fontSize + 1}px`,
                fontWeight: 800,
                color: '#FFFFFF',
                lineHeight: 1.15,
                textAlign: 'center',
              }}
            >
              +{remainingCount} more
            </span>
            <span
              style={{
                fontSize: isCompact ? '8.5px' : '9.5px',
                fontWeight: 600,
                color: '#94A3B8',
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
                marginTop: '2px',
                textAlign: 'center',
              }}
            >
              View All
            </span>
          </button>
        )}
      </div>

      {!onOpenModal && internalModalOpen && (
        <BadgesModal
          isOpen={internalModalOpen}
          onClose={() => setInternalModalOpen(false)}
          badges={badgeList}
        />
      )}
    </>
  )
}

/**
 * High-end Badges Modal popup (matching Competitor image with rich interactive details)
 */
export function BadgesModal({
  isOpen,
  onClose,
  badges,
  practitionerName = 'Practitioner',
}) {
  const badgeList = getBadgesForPractitioner(badges)
  const [selectedBadge, setSelectedBadge] = useState(badgeList[0] || null)

  if (!isOpen) return null

  return (
    <div
      className="oh-badges-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        className="oh-badges-modal-content"
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '540px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #F1F5F9',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2
                style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  color: '#0F172A',
                  margin: 0,
                  letterSpacing: '-0.3px',
                }}
              >
                Badges
              </h2>
              <span
                style={{
                  background: '#F1F5F9',
                  color: '#475569',
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px',
                }}
              >
                {badgeList.length} Honors
              </span>
            </div>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748B' }}>
              Earned recognition &amp; achievements on OpenHand
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#F1F5F9',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#E2E8F0'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#F1F5F9'
            }}
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Badges Grid (Topmate style) */}
        <div style={{ padding: '24px 24px 16px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(78px, 1fr))',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            {badgeList.map((b) => {
              const isSelected = selectedBadge?.id === b.id
              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBadge(b)}
                  style={{
                    background: isSelected
                      ? 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)'
                      : 'linear-gradient(180deg, #161B26 0%, #0B0F17 100%)',
                    border: `1.5px solid ${isSelected ? b.accentColor : 'rgba(255, 255, 255, 0.12)'}`,
                    borderRadius: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '10px 6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected
                      ? `0 6px 18px ${b.borderGlow}`
                      : '0 3px 8px rgba(0,0,0,0.2)',
                    position: 'relative',
                  }}
                  onMouseOver={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.borderColor = b.borderGlow
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'
                    }
                  }}
                >
                  <img
                    src={b.image}
                    alt={b.name}
                    loading="lazy"
                    style={{
                      width: '48px',
                      height: '48px',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))',
                      marginBottom: '4px',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: isSelected ? '#FFFFFF' : '#E2E8F0',
                      textAlign: 'center',
                      lineHeight: 1.15,
                    }}
                  >
                    {b.shortName}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Selected Badge Spotlight Card */}
          {selectedBadge && (
            <div
              style={{
                background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
                border: '1px solid #E2E8F0',
                borderRadius: '18px',
                padding: '18px 20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '14px',
                  background: 'linear-gradient(180deg, #161B26 0%, #0B0F17 100%)',
                  border: `1.5px solid ${selectedBadge.accentColor}`,
                  boxShadow: `0 4px 14px ${selectedBadge.borderGlow}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <img
                  src={selectedBadge.image}
                  alt={selectedBadge.name}
                  style={{
                    width: '54px',
                    height: '54px',
                    objectFit: 'contain',
                  }}
                />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 800,
                      color: '#0F172A',
                      margin: 0,
                    }}
                  >
                    {selectedBadge.name}
                  </h3>
                  <span
                    style={{
                      background: '#DCFCE7',
                      color: '#15803D',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <FiCheckCircle size={11} /> Awarded
                  </span>
                  <span
                    style={{
                      background: '#EEF2FF',
                      color: '#4338CA',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    {selectedBadge.rarity}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: selectedBadge.accentColor,
                    marginBottom: '6px',
                  }}
                >
                  {selectedBadge.tagline}
                </div>

                <p
                  style={{
                    fontSize: '13px',
                    color: '#475569',
                    lineHeight: 1.45,
                    margin: '0 0 10px 0',
                  }}
                >
                  {selectedBadge.description}
                </p>

                <div
                  style={{
                    fontSize: '11.5px',
                    color: '#64748B',
                    borderTop: '1px solid #E2E8F0',
                    paddingTop: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <FiShield size={12} style={{ color: selectedBadge.accentColor }} />
                  <strong>Criteria:</strong> {selectedBadge.criteria}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            background: '#F8FAFC',
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B' }}>
            <FiAward style={{ color: '#F59E0B' }} /> Verified OpenHand Practitioner Recognition
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 20px',
              borderRadius: '10px',
              background: '#0F172A',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#1E293B'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#0F172A'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default PractitionerBadgeStrip
