import { useEffect, useState } from 'react';

export function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState(getRemainingTime(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getRemainingTime(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

function getRemainingTime(dateString) {
  const target = new Date(dateString).getTime();
  const now = new Date().getTime();
  const diff = target - now;

  if (diff <= 0) return '00:00:00';

  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0'),
  ].join(':');
}
