import React from "react"
import "@testing-library/jest-dom"
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import ChangeProfilePicture from "./ChangeProfilePicture"
import * as SettingsAPI from "../../../../services/operations/SettingsAPI"

jest.mock("../../../../services/operations/SettingsAPI", () => ({
  updateDisplayPicture: jest.fn(),
  deleteDisplayPicture: jest.fn(),
}))

const mockCreateObjectURL = jest.fn(() => "blob:http://localhost/mock-uuid")
const mockRevokeObjectURL = jest.fn()

beforeAll(() => {
  window.URL.createObjectURL = mockCreateObjectURL
  window.URL.revokeObjectURL = mockRevokeObjectURL
})

const createTestStore = () =>
  configureStore({
    reducer: {
      auth: (state = { token: "mock-jwt-token" }) => state,
      profile: (
        state = {
          user: {
            firstName: "John",
            lastName: "Doe",
            image: "https://example.com/avatar.jpg",
          },
        }
      ) => state,
    },
  })

describe("ChangeProfilePicture Upload & Duplicate Prevention", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateObjectURL.mockReturnValue("blob:http://localhost/mock-uuid")

    // Mock Canvas getContext and toBlob for JSDOM
    window.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
      clearRect: jest.fn(),
      save: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      closePath: jest.fn(),
      clip: jest.fn(),
      drawImage: jest.fn(),
      restore: jest.fn(),
    }))

    window.HTMLCanvasElement.prototype.toBlob = jest.fn((callback) => {
      callback(new Blob(["test-image-data"], { type: "image/jpeg" }))
    })
  })

  test("1. Selecting an image opens crop modal and does NOT dispatch upload", async () => {
    const store = createTestStore()
    render(
      <Provider store={store}>
        <ChangeProfilePicture />
      </Provider>
    )

    const file = new File(["dummy content"], "avatar.jpg", { type: "image/jpeg" })
    const input = document.getElementById("profile-picture-upload-input")

    await act(async () => {
      await userEvent.upload(input, file)
    })

    expect(await screen.findByText("Crop Profile Picture")).toBeInTheDocument()
    expect(SettingsAPI.updateDisplayPicture).not.toHaveBeenCalled()
  })

  test("2. Cancelling crop modal closes modal and dispatches zero upload requests", async () => {
    const store = createTestStore()
    render(
      <Provider store={store}>
        <ChangeProfilePicture />
      </Provider>
    )

    const file = new File(["dummy content"], "avatar.jpg", { type: "image/jpeg" })
    const input = document.getElementById("profile-picture-upload-input")

    await act(async () => {
      await userEvent.upload(input, file)
    })

    const cancelBtn = await screen.findByText("Cancel")
    await act(async () => {
      fireEvent.click(cancelBtn)
    })

    await waitFor(() => {
      expect(screen.queryByText("Crop Profile Picture")).not.toBeInTheDocument()
    })
    expect(SettingsAPI.updateDisplayPicture).not.toHaveBeenCalled()
    expect(screen.queryByText("Upload New Photo")).not.toBeInTheDocument()
    expect(screen.queryByText("Retry Upload")).not.toBeInTheDocument()
  })

  test("3. Successful crop confirmation dispatches exactly ONE upload and does NOT show redundant upload button", async () => {
    SettingsAPI.updateDisplayPicture.mockImplementation(() => async () => true)

    const store = createTestStore()
    render(
      <Provider store={store}>
        <ChangeProfilePicture />
      </Provider>
    )

    const file = new File(["dummy content"], "avatar.jpg", { type: "image/jpeg" })
    const input = document.getElementById("profile-picture-upload-input")

    await act(async () => {
      await userEvent.upload(input, file)
    })

    const img = await screen.findByAltText("Crop source")
    Object.defineProperty(img, "naturalWidth", { value: 800, configurable: true })
    Object.defineProperty(img, "naturalHeight", { value: 800, configurable: true })
    act(() => {
      fireEvent.load(img)
    })

    const confirmBtn = await screen.findByText("Confirm & Upload")
    await act(async () => {
      fireEvent.click(confirmBtn)
    })

    await waitFor(() => {
      expect(SettingsAPI.updateDisplayPicture).toHaveBeenCalledTimes(1)
    })

    // Redundant upload buttons should NOT appear
    await waitFor(() => {
      expect(screen.queryByText("Crop Profile Picture")).not.toBeInTheDocument()
    })
    expect(screen.queryByText("Upload New Photo")).not.toBeInTheDocument()
    expect(screen.queryByText("Retry Upload")).not.toBeInTheDocument()
  })

  test("4. Failed upload displays Retry Upload button and allows retry without re-selecting image", async () => {
    // First upload attempt fails (returns false)
    SettingsAPI.updateDisplayPicture.mockImplementationOnce(() => async () => false)

    const store = createTestStore()
    render(
      <Provider store={store}>
        <ChangeProfilePicture />
      </Provider>
    )

    const file = new File(["dummy content"], "avatar.jpg", { type: "image/jpeg" })
    const input = document.getElementById("profile-picture-upload-input")

    await act(async () => {
      await userEvent.upload(input, file)
    })

    const img = await screen.findByAltText("Crop source")
    Object.defineProperty(img, "naturalWidth", { value: 800, configurable: true })
    Object.defineProperty(img, "naturalHeight", { value: 800, configurable: true })
    act(() => {
      fireEvent.load(img)
    })

    const confirmBtn = await screen.findByText("Confirm & Upload")
    await act(async () => {
      fireEvent.click(confirmBtn)
    })

    await waitFor(() => {
      expect(SettingsAPI.updateDisplayPicture).toHaveBeenCalledTimes(1)
    })

    // Because it failed, Retry Upload button should be available
    const retryBtn = await screen.findByText("Retry Upload")
    expect(retryBtn).toBeInTheDocument()

    // Second upload attempt succeeds (returns true)
    SettingsAPI.updateDisplayPicture.mockImplementationOnce(() => async () => true)
    await act(async () => {
      fireEvent.click(retryBtn)
    })

    await waitFor(() => {
      expect(SettingsAPI.updateDisplayPicture).toHaveBeenCalledTimes(2)
    })

    // Once retry succeeds, Retry button disappears
    await waitFor(() => {
      expect(screen.queryByText("Retry Upload")).not.toBeInTheDocument()
    })
  })
})
