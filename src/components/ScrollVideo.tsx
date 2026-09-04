import { useEffect, useRef, useState } from 'react'
import { HERO_POSTER_URL, HERO_VIDEO_URL } from '../lib/constants'

const MAX_FRAMES = 90
const MIN_FRAMES = 24
const FRAMES_PER_SECOND = 12
const FRAME_MAX_WIDTH = 960
const SMOOTHING = 0.12
const SEEK_THRESHOLD = 0.04
const EXTRACTION_START_DELAY = 300

function drawCover(
  ctx: CanvasRenderingContext2D,
  media: CanvasImageSource,
  mediaW: number,
  mediaH: number,
  canvasW: number,
  canvasH: number,
) {
  if (!mediaW || !mediaH || !canvasW || !canvasH) return
  const scale = Math.max(canvasW / mediaW, canvasH / mediaH)
  const drawW = mediaW * scale
  const drawH = mediaH * scale
  const dx = (canvasW - drawW) / 2
  const dy = (canvasH - drawH) / 2
  ctx.drawImage(media, dx, dy, drawW, drawH)
}

export default function ScrollVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const framesRef = useRef<ImageBitmap[]>([])
  const targetProgressRef = useRef(0)
  const smoothedProgressRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  const [posterVisible, setPosterVisible] = useState(true)
  const [videoHasFrame, setVideoHasFrame] = useState(false)
  const [framesReady, setFramesReady] = useState(false)

  // Track scroll progress across the whole document
  useEffect(() => {
    const updateProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? window.scrollY / max : 0
      targetProgressRef.current = Math.min(1, Math.max(0, progress))
    }
    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress)
    return () => {
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
    }
  }, [])

  // Detect when the visible video has a decoded frame
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const onLoadedData = () => setVideoHasFrame(true)
    video.addEventListener('loadeddata', onLoadedData)
    if (video.readyState >= 2) setVideoHasFrame(true)
    return () => video.removeEventListener('loadeddata', onLoadedData)
  }, [])

  // Once the visible video has a frame, extract a scrubbable frame cache offscreen
  useEffect(() => {
    if (!videoHasFrame) return
    let cancelled = false

    const timer = window.setTimeout(async () => {
      try {
        const offVideo = document.createElement('video')
        offVideo.src = HERO_VIDEO_URL
        offVideo.muted = true
        offVideo.playsInline = true
        offVideo.preload = 'auto'

        await new Promise<void>((resolve, reject) => {
          offVideo.addEventListener('loadedmetadata', () => resolve(), { once: true })
          offVideo.addEventListener('error', () => reject(new Error('offscreen video failed')), {
            once: true,
          })
          offVideo.load()
        })

        if (cancelled) return

        const duration = offVideo.duration || 0
        if (!duration) return

        const frameCount = Math.max(
          MIN_FRAMES,
          Math.min(MAX_FRAMES, Math.round(duration * FRAMES_PER_SECOND)),
        )

        const nativeW = offVideo.videoWidth || 1920
        const nativeH = offVideo.videoHeight || 1080
        const scale = Math.min(1, FRAME_MAX_WIDTH / nativeW)
        const w = Math.max(1, Math.round(nativeW * scale))
        const h = Math.max(1, Math.round(nativeH * scale))

        const extractCanvas = document.createElement('canvas')
        extractCanvas.width = w
        extractCanvas.height = h
        const extractCtx = extractCanvas.getContext('2d')
        if (!extractCtx) return

        const frames: ImageBitmap[] = []
        const seekableDuration = Math.max(0, duration - 0.05)

        for (let i = 0; i < frameCount; i++) {
          if (cancelled) break
          const t = frameCount > 1 ? (i / (frameCount - 1)) * seekableDuration : 0

          await new Promise<void>((resolve) => {
            const onSeeked = () => {
              offVideo.removeEventListener('seeked', onSeeked)
              resolve()
            }
            offVideo.addEventListener('seeked', onSeeked)
            offVideo.currentTime = t
          })

          if (cancelled) break

          extractCtx.drawImage(offVideo, 0, 0, w, h)
          const bitmap = await createImageBitmap(extractCanvas)
          frames.push(bitmap)
        }

        if (!cancelled && frames.length > 0) {
          framesRef.current = frames
          setFramesReady(true)
        }
      } catch {
        // Frame cache extraction failed silently; fallback path (direct video seek) stays active.
      }
    }, EXTRACTION_START_DELAY)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [videoHasFrame])

  // Fade the poster out once we have something to show in its place
  useEffect(() => {
    if (videoHasFrame || framesReady) {
      setPosterVisible(false)
    }
  }, [videoHasFrame, framesReady])

  // Drive the render loop: lerp scroll progress and paint either cached frames or seek the video
  useEffect(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      canvas.width = Math.round(window.innerWidth * dpr)
      canvas.height = Math.round(window.innerHeight * dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    const tick = () => {
      smoothedProgressRef.current +=
        (targetProgressRef.current - smoothedProgressRef.current) * SMOOTHING
      const s = smoothedProgressRef.current

      const frames = framesRef.current
      if (frames.length > 0) {
        const idx = Math.min(frames.length - 1, Math.max(0, Math.round(s * (frames.length - 1))))
        const bitmap = frames[idx]
        drawCover(ctx, bitmap, bitmap.width, bitmap.height, canvas.width, canvas.height)
      } else if (video && video.duration) {
        const target = s * Math.max(0, video.duration - 0.05)
        if (Math.abs(video.currentTime - target) > SEEK_THRESHOLD) {
          video.currentTime = target
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('resize', resize)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#0a0a0a] pointer-events-none" aria-hidden="true">
      <img
        src={HERO_POSTER_URL}
        alt=""
        onError={(e) => {
          e.currentTarget.style.display = 'none'
        }}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          posterVisible ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <video
        ref={videoRef}
        src={HERO_VIDEO_URL}
        muted
        playsInline
        preload="auto"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          videoHasFrame && !framesReady ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${
          framesReady ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  )
}
