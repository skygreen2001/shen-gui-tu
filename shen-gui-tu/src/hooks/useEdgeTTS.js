import { useRef, useCallback, useState } from 'react'

const EDGE_TTS_URL = 'wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1'
const TRUSTED_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4'
const DEFAULT_VOICE = 'zh-CN-XiaoxiaoNeural'
const DEFAULT_RATE = '-10%'

function uuid() {
  return 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/x/g, () =>
    Math.floor(Math.random() * 16).toString(16)
  )
}

function generateSSML(text, voice = DEFAULT_VOICE, rate = DEFAULT_RATE) {
  return `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='zh-CN'>
<voice name='${voice}'><prosody rate='${rate}' pitch='+0Hz'>${text}</prosody></voice></speak>`
}

export default function useEdgeTTS() {
  const wsRef = useRef(null)
  const audioCtxRef = useRef(null)
  const sourceRef = useRef(null)
  const [speaking, setSpeaking] = useState(false)
  const [usingFallback, setUsingFallback] = useState(false)
  const fallbackUtteranceRef = useRef(null)
  const edgeSucceededRef = useRef(false)

  const cancel = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState <= 1) {
      try { wsRef.current.close() } catch (e) { /* ignore */ }
      wsRef.current = null
    }
    if (sourceRef.current) {
      try { sourceRef.current.stop() } catch (e) { /* ignore */ }
      sourceRef.current = null
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close() } catch (e) { /* ignore */ }
      audioCtxRef.current = null
    }
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
    }
    fallbackUtteranceRef.current = null
    edgeSucceededRef.current = false
    setSpeaking(false)
  }, [])

  const speak = useCallback((text, options = {}) => {
    const { voice = DEFAULT_VOICE, rate = DEFAULT_RATE } = options
    cancel()
    setSpeaking(true)
    edgeSucceededRef.current = false

    // Start fallback IMMEDIATELY in user gesture context
    let fallbackActive = false
    if ('speechSynthesis' in window) {
      fallbackActive = true
      setUsingFallback(true)
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'zh-CN'
      utterance.rate = 0.85
      utterance.onend = () => {
        fallbackUtteranceRef.current = null
        if (!edgeSucceededRef.current) {
          setSpeaking(false)
        }
      }
      utterance.onerror = () => {
        fallbackUtteranceRef.current = null
        if (!edgeSucceededRef.current) {
          setSpeaking(false)
        }
      }
      fallbackUtteranceRef.current = utterance
      speechSynthesis.speak(utterance)
    }

    // Try Edge TTS in parallel — if it succeeds, cancel fallback
    try {
      const connectionId = uuid()
      const url = `${EDGE_TTS_URL}?TrustedClientToken=${TRUSTED_TOKEN}&ConnectionId=${connectionId}`
      const ws = new WebSocket(url)
      wsRef.current = ws

      let audioChunks = []

      const cleanup = () => {
        try { ws.close() } catch (e) { /* ignore */ }
        wsRef.current = null
      }

      const switchToEdge = (audioCtx, sourceNode) => {
        // Edge TTS succeeded — cancel fallback
        edgeSucceededRef.current = true
        setUsingFallback(false)
        if (fallbackUtteranceRef.current) {
          speechSynthesis.cancel()
          fallbackUtteranceRef.current = null
        }
        audioCtxRef.current = audioCtx
        sourceRef.current = sourceNode
      }

      const timeout = setTimeout(() => {
        cleanup()
      }, 5000)

      ws.onopen = () => {
        clearTimeout(timeout)
        const configMsg =
          `Content-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n` +
          `{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"true"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`
        ws.send(configMsg)

        const ssml = generateSSML(text, voice, rate)
        const ssmlMsg =
          `X-RequestId:${connectionId}\r\nContent-Type:application/ssml+xml\r\nPath:ssml\r\n\r\n` + ssml
        ws.send(ssmlMsg)
      }

      ws.onmessage = (event) => {
        if (typeof event.data === 'string') {
          if (event.data.includes('Path:turn.end')) {
            cleanup()
            clearTimeout(timeout)
            if (audioChunks.length > 0) {
              try {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
                const blob = new Blob(audioChunks, { type: 'audio/mpeg' })
                blob.arrayBuffer().then((buf) => audioCtx.decodeAudioData(buf)).then((audioBuffer) => {
                  const sourceNode = audioCtx.createBufferSource()
                  sourceNode.buffer = audioBuffer
                  sourceNode.connect(audioCtx.destination)
                  sourceNode.onended = () => {
                    sourceRef.current = null
                    setSpeaking(false)
                  }
                  sourceNode.start(0)
                  switchToEdge(audioCtx, sourceNode)
                }).catch(() => {
                  // Edge decode failed, fallback already playing
                })
              } catch (e) { /* fallback already playing */ }
            }
          }
        } else {
          audioChunks.push(event.data)
        }
      }

      ws.onerror = () => { clearTimeout(timeout); cleanup() }
      ws.onclose = () => { clearTimeout(timeout); cleanup() }
    } catch (e) {
      // Edge TTS failed, fallback already playing
    }

    return Promise.resolve()
  }, [cancel])

  const pause = useCallback(() => {
    if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
      audioCtxRef.current.suspend()
    }
    if ('speechSynthesis' in window) {
      speechSynthesis.pause()
    }
  }, [])

  const resume = useCallback(() => {
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
    if ('speechSynthesis' in window) {
      speechSynthesis.resume()
    }
  }, [])

  return { speak, cancel, pause, resume, speaking, usingFallback }
}
