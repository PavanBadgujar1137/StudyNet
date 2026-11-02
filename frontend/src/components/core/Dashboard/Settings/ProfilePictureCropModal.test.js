import React from "react"
import "@testing-library/jest-dom"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import ProfilePictureCropModal from "./ProfilePictureCropModal"
import { validateImageFile } from "../../../../utils/imageProcessing"

describe("ProfilePictureCropModal & Cropping Logic", () => {
  beforeEach(() => {
    // Mock HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
      clearRect: jest.fn(),
      save: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      closePath: jest.fn(),
      clip: jest.fn(),
      drawImage: jest.fn(),
      restore: jest.fn(),
    }))

    // Mock toBlob
    HTMLCanvasElement.prototype.toBlob = jest.fn((callback) => {
      callback(new Blob(["test-image-data"], { type: "image/jpeg" }))
    })
  })

  test("1. Renders cropping modal with title, controls, and viewport", () => {
    render(
      <ProfilePictureCropModal
        isOpen={true}
        imageSrc="blob:http://localhost/test-uuid"
        onClose={jest.fn()}
        onConfirm={jest.fn()}
      />
    )

    expect(screen.getByText("Crop Profile Picture")).toBeInTheDocument()
    expect(screen.getByLabelText("Zoom slider")).toBeInTheDocument()
    expect(screen.getByLabelText("Zoom in")).toBeInTheDocument()
    expect(screen.getByLabelText("Zoom out")).toBeInTheDocument()
    expect(screen.getByText("Live Preview")).toBeInTheDocument()
    expect(screen.getByText("Confirm & Upload")).toBeInTheDocument()
    expect(screen.getByText("Cancel")).toBeInTheDocument()
  })

  test("2. Zoom controls adjust zoom value properly", () => {
    render(
      <ProfilePictureCropModal
        isOpen={true}
        imageSrc="blob:http://localhost/test-uuid"
        onClose={jest.fn()}
        onConfirm={jest.fn()}
      />
    )

    const zoomInBtn = screen.getByLabelText("Zoom in")
    const zoomText = screen.getByText("100%")
    expect(zoomText).toBeInTheDocument()

    fireEvent.click(zoomInBtn)
    expect(screen.getByText("110%")).toBeInTheDocument()

    const zoomSlider = screen.getByLabelText("Zoom slider")
    fireEvent.change(zoomSlider, { target: { value: "1.5" } })
    expect(screen.getByText("150%")).toBeInTheDocument()

    const resetBtn = screen.getByLabelText("Reset crop")
    fireEvent.click(resetBtn)
    expect(screen.getByText("100%")).toBeInTheDocument()
  })

  test("3. Crop cancellation triggers onClose and does not call onConfirm", () => {
    const handleClose = jest.fn()
    const handleConfirm = jest.fn()

    render(
      <ProfilePictureCropModal
        isOpen={true}
        imageSrc="blob:http://localhost/test-uuid"
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
    )

    const cancelBtn = screen.getByText("Cancel")
    fireEvent.click(cancelBtn)

    expect(handleClose).toHaveBeenCalledTimes(1)
    expect(handleConfirm).not.toHaveBeenCalled()
  })

  test("4. ESC key closes modal", () => {
    const handleClose = jest.fn()

    render(
      <ProfilePictureCropModal
        isOpen={true}
        imageSrc="blob:http://localhost/test-uuid"
        onClose={handleClose}
        onConfirm={jest.fn()}
      />
    )

    fireEvent.keyDown(window, { key: "Escape" })
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  test("5. Crop confirmation generates cropped file and invokes onConfirm", async () => {
    const handleConfirm = jest.fn()

    render(
      <ProfilePictureCropModal
        isOpen={true}
        imageSrc="blob:http://localhost/test-uuid"
        onClose={jest.fn()}
        onConfirm={handleConfirm}
      />
    )

    // Simulate image loaded with natural dimensions in JSDOM
    const img = screen.getByAltText("Crop source")
    Object.defineProperty(img, "naturalWidth", { value: 800, configurable: true })
    Object.defineProperty(img, "naturalHeight", { value: 800, configurable: true })
    fireEvent.load(img)

    const confirmBtn = screen.getByText("Confirm & Upload")
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(handleConfirm).toHaveBeenCalledTimes(1)
      const croppedFile = handleConfirm.mock.calls[0][0]
      expect(croppedFile).toBeInstanceOf(File)
      expect(croppedFile.type).toBe("image/jpeg")
      expect(croppedFile.name).toBe("profile-picture.jpg")
    })
  })

  test("6. Uploading state disables buttons and shows uploading indicator", () => {
    render(
      <ProfilePictureCropModal
        isOpen={true}
        imageSrc="blob:http://localhost/test-uuid"
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        isUploading={true}
      />
    )

    expect(screen.getByText("Uploading...")).toBeInTheDocument()
    expect(screen.getByText("Cancel")).toBeDisabled()
    expect(screen.getByLabelText("Zoom slider")).toBeDisabled()
  })

  test("7. Image validation accepts valid types and rejects invalid files", () => {
    const validJpg = new File(["dummy"], "avatar.jpg", { type: "image/jpeg" })
    const validPng = new File(["dummy"], "avatar.png", { type: "image/png" })
    const validWebp = new File(["dummy"], "avatar.webp", { type: "image/webp" })
    const invalidPdf = new File(["dummy"], "document.pdf", { type: "application/pdf" })
    const oversizedFile = new File([new ArrayBuffer(11 * 1024 * 1024)], "huge.jpg", { type: "image/jpeg" })

    expect(validateImageFile(validJpg, 10).valid).toBe(true)
    expect(validateImageFile(validPng, 10).valid).toBe(true)
    expect(validateImageFile(validWebp, 10).valid).toBe(true)
    expect(validateImageFile(invalidPdf, 10).valid).toBe(false)
    expect(validateImageFile(oversizedFile, 10).valid).toBe(false)
  })

  test("8. Aspect ratio clamping handles square, portrait, and landscape", () => {
    const computeClampedPan = (dims, zoom, pan) => {
      const VIEWPORT_SIZE = 280
      const s0 = Math.max(VIEWPORT_SIZE / dims.width, VIEWPORT_SIZE / dims.height)
      const wRendered = dims.width * s0 * zoom
      const hRendered = dims.height * s0 * zoom
      const maxPanX = Math.max(0, (wRendered - VIEWPORT_SIZE) / 2)
      const maxPanY = Math.max(0, (hRendered - VIEWPORT_SIZE) / 2)
      return {
        x: Math.min(maxPanX, Math.max(-maxPanX, pan.x)),
        y: Math.min(maxPanY, Math.max(-maxPanY, pan.y)),
      }
    }

    // Square (500x500)
    const square = computeClampedPan({ width: 500, height: 500 }, 1, { x: 50, y: 50 })
    expect(square).toEqual({ x: 0, y: 0 })

    // Landscape (800x400) at 1x
    const landscape = computeClampedPan({ width: 800, height: 400 }, 1, { x: 500, y: 50 })
    expect(landscape.x).toBeLessThanOrEqual(140)
    expect(landscape.y).toBe(0)

    // Portrait (400x800) at 1x
    const portrait = computeClampedPan({ width: 400, height: 800 }, 1, { x: 50, y: 500 })
    expect(portrait.x).toBe(0)
    expect(portrait.y).toBeLessThanOrEqual(140)
  })
})
