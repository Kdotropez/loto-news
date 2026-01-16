import { useEffect, useState } from 'react';
import { CountdownCalculator, NextDrawInfo } from '@/lib/countdown-calculator';

export function useNextDraw(): NextDrawInfo {
  const [info, setInfo] = useState<NextDrawInfo>(() => {
    const calc = new CountdownCalculator();
    return calc.getNextDrawInfo();
  });

  useEffect(() => {
    const calc = new CountdownCalculator();
    setInfo(calc.getNextDrawInfo());
    const timer = setInterval(() => {
      setInfo(calc.getNextDrawInfo());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return info;
}




