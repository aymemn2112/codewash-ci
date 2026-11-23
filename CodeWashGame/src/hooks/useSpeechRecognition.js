import { useCallback, useEffect, useRef, useState } from 'react';
import { logger } from '../lib/logger';

const AUTO_RESTART_BASE_MS = 100;
const AUTO_RESTART_MAX_MS = 5000;

/** Normalise a recognised transcript the same way the game always has. */
const sanitize = (text) => text.toUpperCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');

/**
 * Isolates the Web Speech API behind a small hook.
 *
 * - `start(targetId, onResult)` begins continuous recognition.
 * - `toggle(targetId, onResult)` starts/stops.
 * - `stop()` cancels listening and any pending auto-restart.
 *
 * Auto-restart on `onend` uses exponential backoff (100 ms → 5 s) and is
 * cancelled by `stop()`, which fixes the received code's tight restart loop.
 */
export function useSpeechRecognition(RecognitionCtor) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState(null);

    const recognitionRef = useRef(null);
    const restartTimerRef = useRef(null);
    const keepAliveRef = useRef(false);
    const stoppedRef = useRef(false);
    const attemptRef = useRef(0);
    const targetIdRef = useRef(null);
    const onResultRef = useRef(null);
    const beginRef = useRef(null);

    const ctor =
        RecognitionCtor ?? (typeof window !== 'undefined' ? window.webkitSpeechRecognition : null);
    const isSupported = Boolean(ctor);

    const clearRestartTimer = useCallback(() => {
        if (restartTimerRef.current) {
            clearTimeout(restartTimerRef.current);
            restartTimerRef.current = null;
        }
    }, []);

    const stop = useCallback(() => {
        stoppedRef.current = true;
        keepAliveRef.current = false;
        attemptRef.current = 0;
        clearRestartTimer();

        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (err) {
                logger.warn('[Speech] Error stopping recognition:', err);
            }
            recognitionRef.current = null;
        }
        setIsListening(false);
    }, [clearRestartTimer]);

    const begin = useCallback(() => {
        if (!ctor || !keepAliveRef.current || stoppedRef.current) return;

        let recognition;
        try {
            recognition = new ctor();
        } catch (err) {
            logger.error('[Speech] Cannot create recognition:', err);
            setError('unsupported');
            return;
        }

        recognition.lang = 'en-US';
        recognition.continuous = true;

        recognition.onstart = () => {
            attemptRef.current = 0;
            setError(null);
            setIsListening(true);
            logger.debug('[Speech] Listening for skill:', targetIdRef.current);
        };

        recognition.onresult = (event) => {
            const last = event.results[event.results.length - 1];
            const text = sanitize(last[0].transcript);
            setTranscript(text);
            onResultRef.current?.(text, targetIdRef.current);
        };

        recognition.onerror = (event) => {
            if (event.error === 'not-allowed') {
                logger.error('[Speech] Microphone permission denied');
                keepAliveRef.current = false;
                setError('not-allowed');
                setIsListening(false);
                return;
            }
            if (event.error !== 'no-speech') {
                logger.warn('[Speech] Recognition error:', event.error);
                setError(event.error);
            }
        };

        recognition.onend = () => {
            setIsListening(false);
            recognitionRef.current = null;
            if (!keepAliveRef.current || stoppedRef.current) return;

            const delay = Math.min(
                AUTO_RESTART_MAX_MS,
                AUTO_RESTART_BASE_MS * 2 ** attemptRef.current,
            );
            attemptRef.current += 1;

            clearRestartTimer();
            restartTimerRef.current = setTimeout(() => {
                restartTimerRef.current = null;
                if (keepAliveRef.current && !stoppedRef.current) beginRef.current?.();
            }, delay);
        };

        recognitionRef.current = recognition;

        try {
            recognition.start();
        } catch (err) {
            logger.error('[Speech] Failed to start recognition:', err);
            recognitionRef.current = null;
            setError('start-failed');
        }
    }, [ctor, clearRestartTimer]);

    useEffect(() => {
        beginRef.current = begin;
    }, [begin]);

    const start = useCallback(
        (targetId, onResult) => {
            if (!ctor) {
                setError('unsupported');
                return;
            }
            if (recognitionRef.current) return;

            keepAliveRef.current = true;
            stoppedRef.current = false;
            attemptRef.current = 0;
            targetIdRef.current = targetId;
            onResultRef.current = onResult;
            clearRestartTimer();
            begin();
        },
        [ctor, begin, clearRestartTimer],
    );

    const toggle = useCallback(
        (targetId, onResult) => {
            if (keepAliveRef.current || recognitionRef.current) {
                stop();
            } else {
                start(targetId, onResult);
            }
        },
        [start, stop],
    );

    useEffect(() => () => stop(), [stop]);

    return { isSupported, isListening, transcript, error, start, stop, toggle };
}

export default useSpeechRecognition;
