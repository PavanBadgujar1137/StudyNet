import React, { useRef, useState, useEffect } from "react"
import { FiPlay, FiPause, FiMaximize, FiVolume2, FiVolumeX } from "react-icons/fi"

const SPEED_OPTIONS = [0.5, 1, 1.25, 1.5, 2]

export default function LectureVideoPlayer({ videoUrl, watermarkText }) {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)

  // Floating watermark position telemetry
  const [watermarkPos, setWatermarkPos] = useState({ top: "20%", left: "20%" })

  // Randomize watermark position every 12 seconds to deter recording software crop
  useEffect(() => {
    if (!watermarkText) return
    const interval = setInterval(() => {
      const top = Math.floor(Math.random() * 60 + 10) + "%"
      const left = Math.floor(Math.random() * 60 + 10) + "%"
      setWatermarkPos({ top, left })
    }, 12000)
    return () => clearInterval(interval)
  }, [watermarkText])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSpeedChange = (speed) => {
    if (!videoRef.current) return
    videoRef.current.playbackRate = speed
    setPlaybackSpeed(speed)
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    const current = videoRef.current.currentTime
    const duration = videoRef.current.duration
    if (duration > 0) {
      setProgress((current / duration) * 100)
    }
  }

  const handleSeek = (e) => {
    if (!videoRef.current) return
    const rect = e.target.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const width = rect.width
    const duration = videoRef.current.duration
    if (duration > 0) {
      videoRef.current.currentTime = (clickX / width) * duration
    }
  }

  const handleMaximize = () => {
    if (videoRef.current?.requestFullscreen) {
      videoRef.current.requestFullscreen()
    }
  }

  return (
    <div className="relative group bg-black rounded-2xl overflow-hidden border border-richblack-800 shadow-2xl">
      {/* Video Node */}
      <video
        ref={videoRef}
        src={videoUrl}
        onTimeUpdate={handleTimeUpdate}
        onClick={togglePlay}
        className="w-full aspect-video object-contain cursor-pointer"
        preload="metadata"
      />

      {/* Floating Dynamic Watermark */}
      {watermarkText && (
        <div
          style={{
            position: "absolute",
            top: watermarkPos.top,
            left: watermarkPos.left,
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            userSelect: "none",
          }}
          className="text-white/20 select-none pointer-events-none font-bold text-xs sm:text-sm bg-black/30 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-[1px] transition-all duration-1000 z-10"
        >
          {watermarkText}
        </div>
      )}

      {/* Custom Video Controls Bar */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-3">
        {/* Progress Timeline */}
        <div
          onClick={handleSeek}
          className="h-1.5 w-full bg-white/20 rounded-full cursor-pointer overflow-hidden relative"
        >
          <div
            className="h-full bg-purple-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <button onClick={togglePlay} className="text-white hover:text-purple-400 transition-colors">
              {isPlaying ? <FiPause size={20} /> : <FiPlay size={20} />}
            </button>

            {/* Mute/Volume */}
            <button onClick={toggleMute} className="text-white hover:text-purple-400 transition-colors">
              {isMuted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
            </button>

            {/* Speed Selector */}
            <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-lg">
              <span className="text-[10px] text-white/60 font-semibold">Speed:</span>
              {SPEED_OPTIONS.map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  className={`text-xs font-bold px-1.5 py-0.5 rounded transition-all ${
                    playbackSpeed === speed ? "bg-purple-600 text-white" : "text-white/60 hover:text-white"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Fullscreen */}
          <button onClick={handleMaximize} className="text-white hover:text-purple-400 transition-colors">
            <FiMaximize size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
