import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import OHPricingSection from './OHPricingSection'
import * as apiModule from '../../services/apiConnector'
import toast from 'react-hot-toast'

// Mock react-hot-toast
jest.mock('react-hot-toast', () => {
  const fn = jest.fn()
  fn.success = jest.fn()
  fn.error = jest.fn()
  fn.loading = jest.fn()
  fn.dismiss = jest.fn()
  return fn
})

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

function createMockStore({ token = null, user = null } = {}) {
  return configureStore({
    reducer: {
      auth: (state = { token }) => state,
      profile: (state = { user }) => state,
    },
  })
}

describe('OHPricingSection - Bug 0035 Start Free Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('unauthenticated user clicking Start Free redirects to practitioner signup', async () => {
    const store = createMockStore({ token: null })

    render(
      <Provider store={store}>
        <MemoryRouter>
          <OHPricingSection defaultRole="practitioner" />
        </MemoryRouter>
      </Provider>
    )

    const startFreeBtn = screen.getByRole('button', { name: /start free/i })
    fireEvent.click(startFreeBtn)

    expect(mockNavigate).toHaveBeenCalledWith('/signup?role=practitioner')
  })

  test('authenticated user on open plan clicking Start Free verifies plan, shows toast and calls onSuccess', async () => {
    const store = createMockStore({
      token: 'valid-test-token',
      user: { activePlan: 'open', accountType: 'Practitioner' },
    })

    const mockOnSuccess = jest.fn()
    jest.spyOn(apiModule, 'apiConnector').mockResolvedValueOnce({
      data: {
        success: true,
        effectivePlan: 'open',
        status: 'active_free',
      },
    })

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <OHPricingSection defaultRole="practitioner" onSuccess={mockOnSuccess} />
        </MemoryRouter>
      </Provider>
    )

    const startFreeBtn = screen.getByRole('button', { name: /start free/i })
    fireEvent.click(startFreeBtn)

    await waitFor(() => {
      expect(apiModule.apiConnector).toHaveBeenCalledWith(
        'GET',
        '/api/v1/payments/subscription/mine',
        null,
        { Authorization: 'Bearer valid-test-token' }
      )
    })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'Open (Free) Plan is active. You have access to practice tools!'
      )
      expect(mockOnSuccess).toHaveBeenCalledTimes(1)
    })
  })

  test('authenticated user with active pro subscription sees informational message instead of false activation', async () => {
    const store = createMockStore({
      token: 'valid-test-token',
      user: { activePlan: 'pro_yearly', accountType: 'Practitioner' },
    })

    const mockOnSuccess = jest.fn()
    jest.spyOn(apiModule, 'apiConnector').mockResolvedValueOnce({
      data: {
        success: true,
        effectivePlan: 'pro_yearly',
        status: 'subscribed',
      },
    })

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <OHPricingSection defaultRole="practitioner" onSuccess={mockOnSuccess} />
        </MemoryRouter>
      </Provider>
    )

    const startFreeBtn = screen.getByRole('button', { name: /start free/i })
    fireEvent.click(startFreeBtn)

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        'You currently have an active PRO_YEARLY subscription.',
        { icon: 'ℹ️' }
      )
      expect(mockOnSuccess).toHaveBeenCalledTimes(1)
    })
  })

  test('authenticated user with custom/enterprise plan sees Custom/Enterprise informational message', async () => {
    const store = createMockStore({
      token: 'valid-test-token',
      user: { activePlan: 'custom', accountType: 'Practitioner' },
    })

    const mockOnSuccess = jest.fn()
    jest.spyOn(apiModule, 'apiConnector').mockResolvedValueOnce({
      data: {
        success: true,
        effectivePlan: 'custom',
        status: 'subscribed',
      },
    })

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <OHPricingSection defaultRole="practitioner" onSuccess={mockOnSuccess} />
        </MemoryRouter>
      </Provider>
    )

    const startFreeBtn = screen.getByRole('button', { name: /start free/i })
    fireEvent.click(startFreeBtn)

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        'You currently have an active Custom/Enterprise subscription.',
        { icon: 'ℹ️' }
      )
      expect(mockOnSuccess).toHaveBeenCalledTimes(1)
    })
  })

  test('handles subscription API failure with unknown activePlan by showing error without claiming false activation', async () => {
    const store = createMockStore({
      token: 'valid-test-token',
      user: { activePlan: null, accountType: 'Practitioner' }, // Unknown / missing plan
    })

    const mockOnSuccess = jest.fn()
    // Simulate API network or 500 error
    jest.spyOn(apiModule, 'apiConnector').mockRejectedValueOnce(new Error('Network error'))

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <OHPricingSection defaultRole="practitioner" onSuccess={mockOnSuccess} />
        </MemoryRouter>
      </Provider>
    )

    const startFreeBtn = screen.getByRole('button', { name: /start free/i })
    fireEvent.click(startFreeBtn)

    await waitFor(() => {
      // Must show error, NOT default to open, and NOT claim success
      expect(toast.error).toHaveBeenCalledWith(
        'Could not verify your subscription status. Please try again.'
      )
      expect(toast.success).not.toHaveBeenCalled()
      expect(mockOnSuccess).not.toHaveBeenCalled()
    })
  })

  test('prevents repeated duplicate clicks while plan verification is in-flight', async () => {
    const store = createMockStore({
      token: 'valid-test-token',
      user: { activePlan: 'open', accountType: 'Practitioner' },
    })

    let resolveApi
    const apiPromise = new Promise((resolve) => {
      resolveApi = resolve
    })
    jest.spyOn(apiModule, 'apiConnector').mockReturnValueOnce(apiPromise)

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <OHPricingSection defaultRole="practitioner" />
        </MemoryRouter>
      </Provider>
    )

    const startFreeBtn = screen.getByRole('button', { name: /start free/i })

    // Click multiple times rapidly
    fireEvent.click(startFreeBtn)
    fireEvent.click(startFreeBtn)
    fireEvent.click(startFreeBtn)

    // Only 1 API request should be dispatched
    expect(apiModule.apiConnector).toHaveBeenCalledTimes(1)

    // Complete the call
    resolveApi({ data: { success: true, effectivePlan: 'open' } })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledTimes(1)
    })
  })
  test('handles subscription API failure when Redux profile contains stale activePlan open by showing error without claiming false activation', async () => {
    const store = createMockStore({
      token: 'valid-test-token',
      user: { activePlan: 'open', accountType: 'Practitioner' },
    })

    const mockOnSuccess = jest.fn()
    jest.spyOn(apiModule, 'apiConnector').mockRejectedValueOnce(new Error('Network error'))

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <OHPricingSection defaultRole="practitioner" onSuccess={mockOnSuccess} />
        </MemoryRouter>
      </Provider>
    )

    const startFreeBtn = screen.getByRole('button', { name: /start free/i })
    fireEvent.click(startFreeBtn)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Could not verify your subscription status. Please try again.'
      )
      expect(toast.success).not.toHaveBeenCalled()
      expect(mockOnSuccess).not.toHaveBeenCalled()
    })

    // Verify the button becomes re-enabled so user can retry
    await waitFor(() => {
      expect(startFreeBtn).not.toBeDisabled()
      expect(startFreeBtn).toHaveTextContent(/start free/i)
    })
  })
})
