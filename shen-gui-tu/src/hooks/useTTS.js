import { useState, useCallback, useRef } from 'react'

export default function useTTS() {
  const [status, setStatus] = useState('idle') // 'idle' | 'speaking' | 'paused'
  const utteranceRef = useRef(null)

  const supported = 'speechSynthesis' in window

  const speak = useCallback((text) => {
    if (!supported) return
    speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    utterance.rate = 0.85
    utterance.onstart = () => setStatus('speaking')
    utterance.onend = () => {
      utteranceRef.current = null
      setStatus('idle')
    }
    utterance.onerror = () => {
      utteranceRef.current = null
      setStatus('idle')
    }
    utteranceRef.current = utterance
    speechSynthesis.speak(utterance)
  }, [supported])

  const cancel = useCallback(() => {
    if (!supported) return
    speechSynthesis.cancel()
    utteranceRef.current = null
    setStatus('idle')
  }, [supported])

  const pause = useCallback(() => {
    if (!supported) return
    speechSynthesis.pause()
    setStatus('paused')
  }, [supported])

  const resume = useCallback(() => {
    if (!supported) return
    speechSynthesis.resume()
    setStatus('speaking')
  }, [supported])

  return { speak, cancel, pause, resume, status, supported }
}
