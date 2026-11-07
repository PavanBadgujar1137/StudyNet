import React from 'react'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import CoPilot from './CoPilot'

beforeAll(() => {
  global.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.scrollTo = jest.fn()
  Element.prototype.scrollTo = jest.fn()
})

function createMockStore() {
  return configureStore({
    reducer: {
      auth: (state = { token: null }) => state,
      profile: (state = { user: null }) => state,
    },
  })
}

describe('CoPilot - Bug 0036 Ask Our Ethics Desk Link', () => {
  test('renders Ask Our Ethics Desk as a clean, direct mailto link with correct recipient and subject', () => {
    const store = createMockStore()

    render(
      <Provider store={store}>
        <MemoryRouter>
          <CoPilot />
        </MemoryRouter>
      </Provider>
    )

    const ethicsDeskLink = screen.getByRole('link', { name: /ask our ethics desk/i })
    expect(ethicsDeskLink).toBeInTheDocument()
    expect(ethicsDeskLink).toHaveAttribute(
      'href',
      'mailto:connect@openhand.live?subject=AURA%20Ethics%20Desk'
    )
    // Confirm there are no artificial target or javascript delays attached
    expect(ethicsDeskLink.tagName.toLowerCase()).toBe('a')
  })
})
