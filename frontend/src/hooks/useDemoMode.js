import { useMemo } from 'react';

/**
 * Detects if contract is running in demo mode based on time windows
 * @param {number} depositWindowEnd - Timestamp when deposit window ends
 * @param {number} prizeDrawTime - Timestamp when prize draw occurs
 * @param {number} roundStartTime - When the current round started (optional)
 * @returns {Object} { isDemoMode, depositWindowDuration, roundDuration, mode }
 */
export function useDemoMode(depositWindowEnd, prizeDrawTime, roundStartTime) {
  const demoInfo = useMemo(() => {
    // If no timestamps yet, can't determine
    if (!depositWindowEnd || !prizeDrawTime) {
      return {
        isDemoMode: false,
        depositWindowDuration: 0,
        roundDuration: 0,
        mode: 'unknown',
      };
    }

    // Calculate durations
    const depositWindowDuration = depositWindowEnd - (roundStartTime || (prizeDrawTime - (7 * 24 * 3600)));
    const roundDuration = prizeDrawTime - (roundStartTime || (prizeDrawTime - (7 * 24 * 3600)));

    // DEMO MODE detection thresholds:
    // Deposit window < 10 minutes AND round < 30 minutes = DEMO
    const isDemoMode = depositWindowDuration < 600 || roundDuration < 1800;

    let mode = 'production';
    if (depositWindowDuration <= 300) mode = 'demo-fast'; // ≤ 5 minutes deposit
    else if (depositWindowDuration <= 3600) mode = 'demo'; // ≤ 1 hour
    else mode = 'production';

    return {
      isDemoMode,
      depositWindowDuration,
      roundDuration,
      mode,
      // Human-readable durations
      depositWindowFormatted: formatDuration(depositWindowDuration),
      roundDurationFormatted: formatDuration(roundDuration),
    };
  }, [depositWindowEnd, prizeDrawTime, roundStartTime]);

  return demoInfo;
}

// Helper to format duration nicely
function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}min`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}
