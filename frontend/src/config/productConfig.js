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
  // Public footer / legal address (OpenHand only — no parent-company names)
  address: 'Office No. 901 and 905, 41 Evoke, Sr. No. 74, Near Mukai Chowk, Ravet, Pune, Maharashtra - 412101, India',
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
// Learner Access Policy — 100% Free Forever
// ─────────────────────────────────────────────
export const LEARNER_PLANS = [
  {
    key: 'free',
    name: 'Free Learner Account',
    price: '₹0',
    period: 'Free Forever',
    tagline: 'Complete and unrestricted free access for all learners across OpenHand.',
    badge: '100% FREE LIFETIME ACCESS',
    featured: true,
    features: [
      'Unlimited access to all practitioner free courses',
      'Join and participate in growth & support Circles',
      'Daily mood check-ins & guided reflection prompts',
      'AURA AI health companion & reflection assistant',
      '1:1 Practitioner Session booking access',
      'Secure digital health record vault',
      'Zero recurring fees or subscriptions required',
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
export const PRACTITIONER_PLANS = [
  {
    key: 'open',
    name: 'Open',
    price: '₹0',
    period: '/month',
    commission: '10% per booking · every Offers',
    tagline: 'Start your practice. We start bringing mentees.',
    badge: 'START FREE',
    featured: false,
    buttonText: 'Start free →',
    features: [
      'Flat 10% on every booking — your link or ours',
      'Growth Hand onboarding: profile & positioning review',
      'Listed in OpenHand mentee discovery',
      '1:1, group sessions, webinars & packages',
      'Built-in HD Session Room',
      'Custom domain',
      'Verified Practitioner badge',
      '72-hour working day payouts (UPI / bank)',
    ],
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '₹799',
    yearlyPrice: '₹799',
    period: '/month, billed yearly',
    yearlyPeriod: '/month, billed yearly',
    commission: '5% per booking · every Offers',
    tagline: 'A growth partner working on your practice every month.',
    badge: 'MOST CHOSEN',
    featured: true,
    buttonText: 'Grow with Pro →',
    features: [
      'Everything in Open — commission drops to 5%',
      'Monthly growth review with an OpenHand mentor',
      'Priority mentee matching & featured placement',
      'Visibility campaigns: spotlights, collaborations, events',
      'AI session notes & client progress insights',
    ],
  },
  {
    key: 'custom',
    name: 'Custom',
    price: 'Custom',
    period: '',
    commission: 'establish Course , Therapist & coaching firms.',
    tagline: 'establish Course , Therapist & coaching firms.',
    badge: 'CUSTOM',
    featured: false,
    buttonText: 'Talk to us →',
    features: [
      'Everything in Pro',
      'Custom commission — as low as 0%',
      'Dedicated growth & success manager',
      'Multi-practitioner teams & roles',
      'LMS, certification & cohort workflows',
      'White Label Play Store And IOS Store APP',
    ],
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

