import { useEffect, useRef } from 'react';

// Attaches IntersectionObserver to add .visible class when element enters viewport
const useReveal = (threshold = 0.15) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return ref;
};

export default useReveal;
