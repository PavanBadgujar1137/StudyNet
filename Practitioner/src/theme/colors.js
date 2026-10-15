/**
 * OpenHand Practitioner App Design Tokens
 * Faithful reproduction of openhand-apps.css & web visual identity
 */

export const colors = {
  // Backgrounds
  background: '#F7F8FD', // --mist
  card: '#FFFFFF',       // --card
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',
  surfaceLight: '#F8FAFC',

  // Typography & Text
  text: '#0E1235',          // --ink
  textSecondary: '#2A2F5C', // --ink-2
  textMuted: '#6A6F94',     // --muted
  textLight: '#94A3B8',
  textWhite: '#FFFFFF',

  // Brand Gradient & Accents
  blue: '#1F5FE0',     // --blue
  indigo: '#4733C9',   // --indigo
  violet: '#8A2BE0',   // --violet
  gradient: ['#1F5FE0', '#4733C9', '#8A2BE0'], // --grad

  // Functional Status
  success: '#2E9E6B',       // --ok
  successLight: '#DCFCE7',
  successText: '#15803D',
  warning: '#B08328',       // --warn
  warningLight: '#FEF3C7',
  warningText: '#92400E',
  danger: '#EF4444',        // --stop
  dangerLight: '#FEE2E2',
  dangerText: '#B91C1C',

  // Borders & Dividers
  border: '#E2E8F0',
  borderSubtle: 'rgba(14, 18, 53, 0.08)',
  borderActive: '#BFDBFE',

  // Practitioner App-specific Accent (Clinical Indigo / AURA Assistant / Web Violet)
  accent: '#7C3AED',
  accentLight: '#F5F3FF',
  accentBorder: '#DDD6FE',
  accentDark: '#1E1B4B',
  violetBrand: '#7C3AED',
  violetLight: '#F5F3FF',
  violetBorder: '#DDD6FE',
  violetText: '#6D28D9',
  violetGradientStart: '#7C3AED',
  violetGradientEnd: '#EC4899',
  cyanGlow: '#0EA5E9',

  // Dark slate hero tone
  slateDark: '#090D16',

  // Shadows
  shadowColor: '#0E1235',
  shadowViolet: 'rgba(124, 58, 237, 0.25)',
};

export default colors;
