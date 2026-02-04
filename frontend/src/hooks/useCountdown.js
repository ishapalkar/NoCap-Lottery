import { useState, useEffect } from 'react';

/**
 * Hook for countdown timer with smart formatting
 * @param {number} timestamp - Unix timestamp to count down to
 * @returns {Object} { timeRemaining, isExpired, formatted }
 */
export function useCountdown(timestamp) {
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (!timestamp) return;

    const updateTime = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = timestamp - now;
      setTimeRemaining(remaining > 0 ? remaining : 0);
    };

    // Update immediately
    updateTime();

    // Update every second
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [timestamp]);

  const isExpired = timeRemaining <= 0;

  // Format for display
  const formatted = (() => {
    if (isExpired) return 'Ended';

    const days = Math.floor(timeRemaining / 86400);
    const hours = Math.floor((timeRemaining % 86400) / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;

    // Show appropriate level of detail based on time remaining
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  })();

  return {
    timeRemaining,
    isExpired,
    formatted,
    days: Math.floor(timeRemaining / 86400),
    hours: Math.floor((timeRemaining % 86400) / 3600),
    minutes: Math.floor((timeRemaining % 3600) / 60),
    seconds: timeRemaining % 60,
  };
}
