/**
 * OpenHand — Canonical Product Configuration
 * ============================================
 * SINGLE SOURCE OF TRUTH for all plan data, free-tier rules, AURA policy,
 * terminology, and contact information.
 *
 * Every page/component that references plan names, prices, AURA gating, or
 * contact addresses must import from this file. Hand-copying these values
 * across templates is what caused the contradiction bugs this file resolves.
 *
 * Last updated: 2026-08-13
 * Reviewed by: Engineering
 * ⚠️  Pricing/commission fields marked CLIENT_SUPPLIED must be confirmed
 *     by the client before production launch.
 */

// ─────────────────────────────────────────────
// CP-4: Contact Domain (enforced sitewide)
// ─────────────────────────────────────────────
export const CONTACT = {
  connect: 'connect@openhand.live',
  support: 'connect@openhand.live',
  legal:   'connect@openhand.live',
  security:'connect@openhand.live',
  privacy: 'connect@openhand.live',
  hello:   'connect@openhand.live',
}

// ─────────────────────────────────────────────
// CP-5: Canonical Terminology
// ─────────────────────────────────────────────
export const TERMS = {
  circle:           'Circle',           // 8-seat small-group container
  pod:              'Pod',              // self-organizing sub-group inside a Circle
  session:          'Session',          // 1:1 paid session
  membership:       'Membership',       // recurring learner plan
  aura:             'AURA — consent-first session AI', // first mention per page
  auraShort:        'AURA',             // subsequent mentions
  auraLivePrompts:  'AURA Live Prompts',
  auraCrossSession: 'AURA Cross-Session Memory',
  auraTechnique:    'AURA Technique Match',
  auraAftercare:    'AURA Aftercare Notes',
  cockpit:          'Practice Cockpit', // practitioner home screen
  checkin:          'Check-in',         // learner recurring check-in
  practitionerMeet: 'Practitioner Meetups', // community meetups (not "Circles")
  practitionerCount:'1,200+',           // ⚠️ CLIENT_SUPPLIED: confirm this is current
}

// ─────────────────────────────────────────────
// CP-1: Free Tier Definition
// ─────────────────────────────────────────────
export const FREE_TIER = {
  // What a practitioner can do on a free (unpaid) account:
  allowedActions: [
    'complete_4_step_onboarding',  // claim handle, add offer, connect payout, share link
    'publish_one_offer',           // 1 published offer maximum
    'aura_notes_only',             // post-session note drafting (not live panel)
    'directory_listing',           // appears in Find a Practitioner
    'view_practice_cockpit',       // can see the Practice Cockpit home
    'book_learner_sessions',       // can receive bookings
  ],
  // What triggers the first payment prompt (never at login/signup):
  paymentTriggers: [
    'first_booking_received',     // first paid booking received
    'publish_first_circle',       // first Circle published
  ],
  // What is gated behind paid plans:
  paidOnly: [
    'circles_unlimited',          // more than 0 published Circles (1st Circle = trigger)
    'offers_unlimited',           // more than 1 published offer
    'aura_live_panel',            // in-session AURA live prompts panel
    'automations',                // check-in automation sequences
    'white_label',                // white-label portal + custom domain
    'org_eap_billing',            // B2B / EAP billing tools
    'branded_app',                // branded mobile app
    'sso_hris',                   // SSO / HRIS integration
    'dedicated_account_manager',  // account manager (Master tier)
  ],
}

// ─────────────────────────────────────────────
// CP-2: AURA Free/Paid Split
// ─────────────────────────────────────────────
export const AURA_POLICY = {
  free: {
    label: 'AURA Aftercare Notes',
    description: 'Post-session note drafting — available on every tier, including free.',
    enabled: true,
  },
  paid: {
    label: 'AURA Live Prompts panel',
    description: 'In-session live suggestions panel — paid tiers only (Starter and above).',
    enabled: false, // enabled when practitioner has paid plan
  },
}

// ─────────────────────────────────────────────
// Learner Plans
// ─────────────────────────────────────────────
export const LEARNER_PLANS = [
  {
    key: 'beginner',
    name: 'Beginner',
    price: '₹51',
    period: '/month',
    tagline: 'Start your wellbeing journey with practitioner-led tools and community.',
    badge: 'ESSENTIAL MEMBERSHIP',
    featured: false,
    features: [
      'Access to practitioner course library',
      '1 monthly live Circle pass',
      'Daily mood check-ins & reflection prompts',
      'AURA Aftercare Notes (free on every plan)',
      '1:1 Session booking access',
      'Secure digital health record vault',
    ],
  },
  {
    key: 'advance',
    name: 'Advance',
    price: '₹151',
    period: '/month',
    tagline: 'Full access to Circles, courses, and session discounts for active learners.',
    badge: 'MOST POPULAR',
    featured: true,
    features: [
      'Everything in Beginner',
      'Unlimited practitioner courses',
      'Unlimited live Circles',
      '15% discount on all 1:1 Sessions',
      'AURA Live Prompts (in-session) access',
      'Priority session scheduling',
    ],
  },
  {
    key: 'champion',
    name: 'Champion',
    price: '₹1,500',
    period: '/month',
    tagline: 'Complete wellbeing coverage with a free monthly Session and dedicated support.',
    badge: 'COMPLETE COVERAGE',
    featured: false,
    features: [
      'Everything in Advance',
      '1 free 1:1 Session per month',
      '25% discount on additional Sessions',
      'Dedicated care manager & concierge support',
      'Family sharing (up to 3 sub-accounts)',
      '24/7 priority support & instant AURA access',
    ],
  },
]

// ─────────────────────────────────────────────
// Practitioner Plans
// ─────────────────────────────────────────────
// ⚠️ CP-6: Commission/take-rate — CLIENT_SUPPLIED
// The actual take-rate % must be confirmed by the client before the
// pricing page can state it explicitly. The placeholder below must
// be replaced with the real number before launch.
export const COMMISSION_RATE_PLACEHOLDER = 'CLIENT_SUPPLIED_COMMISSION_%'

export const PRACTITIONER_PLANS = [
  {
    key: 'starter',
    name: 'Starter',
    price: '₹999',
    period: '/month',
    tagline: 'For practitioners building their online practice from scratch.',
    badge: 'PLATFORM ACCESS',
    featured: false,
    features: [
      'Publish 1:1 Session offers',
      'Host 1 live Circle',
      'Directory listing & booking link',
      'Learner mood check-in tracking',
      'AURA Aftercare Notes (post-session drafting) — included free',
      'Razorpay direct payout integration',
    ],
    // NOTE: AURA post-session notes are FREE on this tier per CP-2
    auraPostSessionFree: true,
    auraLivePanelIncluded: true, // paid gating starts at Starter
  },
  {
    key: 'growth',
    name: 'Growth',
    price: '₹2,999',
    period: '/month',
    tagline: 'Scale your practice with unlimited Circles, automations, and branded tools.',
    badge: 'MOST POPULAR',
    featured: true,
    features: [
      'Everything in Starter',
      'Unlimited live Circles',
      'Unlimited offer publishing',
      'Automated Check-in & reflection sequences',
      'Priority directory placement & verified badge',
      'Free learner Memberships to gift clients',  // was "Companion passes" — renamed per PJ-7
    ],
    auraPostSessionFree: true,
    auraLivePanelIncluded: true,
  },
  {
    key: 'master',
    name: 'Master',             // was "Master VIP" — "VIP" removed per brief (PJ-6)
    price: '₹5,999',
    period: '/month',
    tagline: 'For established clinics and high-volume practitioners.',
    badge: 'CLINIC & STUDIO',
    featured: false,
    features: [
      'Everything in Growth',
      // ⚠️ CP-6: replace placeholder with real commission rate before launch
      `Take-rate: ${COMMISSION_RATE_PLACEHOLDER} — confirm with client`,
      'White-label portal & custom domain',          // per G3 exact label
      'Branded app',                                  // per G3 exact label
      'Dedicated account manager',                   // per G3 exact label
      'Zapier / API integration',                    // per G3 exact label
      'SSO and HRIS integration',                    // per G3 — Phase 3
      'Circle analytics & learner retention intelligence',
    ],
    auraPostSessionFree: true,
    auraLivePanelIncluded: true,
  },
]

// ─────────────────────────────────────────────
// Org / EAP Pricing (from For Organizations page)
// ─────────────────────────────────────────────
export const ORG_PRICING = {
  singleCircle: '₹1,20,000',   // single Circle pilot
  department:   '₹4,20,000',   // per quarter / department
  orgWide:      'Custom',       // org-wide pricing
}

// ─────────────────────────────────────────────
// CP-3: Trial/Banner Policy
// ─────────────────────────────────────────────
// No static trial banners. Any trial UI must read from real user state.
// A logged-out visitor MUST NOT see a trial countdown.
// A practitioner with no active trial MUST NOT see a countdown.
export const TRIAL_POLICY = {
  showBannerWhen: 'user_has_active_trial_only', // never static
  practitionerFreeTier: true, // no trial needed — free tier is permanent
}

// ─────────────────────────────────────────────
// CP-7: Legal Review Status Flags (Requirement 4.6)
// ─────────────────────────────────────────────
// Set a flag to true once qualified legal counsel has formally reviewed
// and approved the respective legal document for production publishing.
export const LEGAL_FLAGS = {
  privacyPolicy: true,
  termsOfService: true,
  dataConsent: true,
  security: true,
}

