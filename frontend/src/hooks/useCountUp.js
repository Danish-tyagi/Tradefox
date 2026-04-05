import { useEffect, useRef, useState } from 'react';

const useCountUp = (target, duration = 1800, start = false) => {
  const [value, setValue] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    if (!start) return;
    const startTime = performance.now();
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
      else setValue(target);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, start]);

  return value;
};

export default useCountUp;
