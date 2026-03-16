import { useState, useEffect, useRef } from "react";
import { AGENT_THINKING_TIMEOUT_MS } from "../constants/app";

export function useAgentThinking() {
  const [isThinking, setIsThinking] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  function startThinking() {
    setIsThinking(true);
    setTimedOut(false);

    timeoutRef.current = setTimeout(() => {
      setTimedOut(true);
    }, AGENT_THINKING_TIMEOUT_MS);
  }

  function stopThinking() {
    setIsThinking(false);
    setTimedOut(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { isThinking, timedOut, startThinking, stopThinking };
}
