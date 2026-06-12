import { useState, useCallback, useEffect } from 'react';

export default function useTTS() {
  const [status, setStatus] = useState<'idle' | 'speaking' | 'paused'>(
    'idle',
  );
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    try {
      // 动态导入 react-native-tts 以处理可能的错误
      const TTS = require('react-native-tts').default;
      
      if (TTS && TTS.speak) {
        TTS.setDefaultLanguage('zh-CN');
        TTS.setDefaultRate(0.85);

        const onStart = () => setStatus('speaking');
        const onDone = () => setStatus('idle');
        const onError = () => setStatus('idle');

        if (TTS.addEventListener) {
          TTS.addEventListener('tts-start', onStart);
          TTS.addEventListener('tts-finish', onDone);
          TTS.addEventListener('tts-error', onError);
        }

        setSupported(true);

        return () => {
          if (TTS.removeEventListener) {
            TTS.removeEventListener('tts-start', onStart);
            TTS.removeEventListener('tts-finish', onDone);
            TTS.removeEventListener('tts-error', onError);
          }
        };
      }
    } catch (error) {
      console.log('TTS not supported:', error);
      setSupported(false);
    }
  }, []);

  const speak = useCallback((text: string) => {
    try {
      const TTS = require('react-native-tts').default;
      TTS.speak(text);
    } catch (error) {
      console.log('TTS speak failed:', error);
    }
  }, []);

  const cancel = useCallback(() => {
    try {
      const TTS = require('react-native-tts').default;
      TTS.stop();
      setStatus('idle');
    } catch (error) {
      console.log('TTS cancel failed:', error);
      setStatus('idle');
    }
  }, []);

  const pause = useCallback(() => {
    try {
      const TTS = require('react-native-tts').default;
      if (TTS.pause) {
        TTS.pause();
        setStatus('paused');
      }
    } catch (error) {
      console.log('TTS pause failed:', error);
    }
  }, []);

  const resume = useCallback(() => {
    try {
      const TTS = require('react-native-tts').default;
      if (TTS.resume) {
        TTS.resume();
        setStatus('speaking');
      }
    } catch (error) {
      console.log('TTS resume failed:', error);
    }
  }, []);

  return { speak, cancel, pause, resume, status, supported };
}
