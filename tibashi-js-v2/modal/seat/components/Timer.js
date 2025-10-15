// --- Logical Countdown Timer (No DOM) ---
export function createCountdownTimer(duration = 120, onTick, onEnd) {
  let remaining = duration;
  let intervalId = null;

  const start = () => {
    if (intervalId) clearInterval(intervalId); // اگر قبلاً فعال بود، ریست کن
    remaining = duration;
    if (typeof onTick === "function") onTick(remaining);

    intervalId = setInterval(() => {
      remaining--;
      if (typeof onTick === "function") onTick(remaining);

      if (remaining <= 0) {
        clearInterval(intervalId);
        intervalId = null;
        if (typeof onEnd === "function") onEnd();
      }
    }, 100000);
  };

  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  const reset = (newDuration = duration) => {
    stop();
    duration = newDuration;
    start();
  };

  return { start, stop, reset, getRemaining: () => remaining };
}
