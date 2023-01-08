import { useEffect, useState, useRef } from 'react';

// Most of time we only need ob until intersecting, so return false here to disconnect ob.
const DefaultOnIntersection = (isIntersecting, ob) => {
  if (isIntersecting) return false;
};

const DefaultOptions = {
  root: null,
  threshold: 0,
};

export default function useIntersection(
  onIntersection = DefaultOnIntersection,
  options = DefaultOptions,
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elemRef = { current: null };
  const setElem = (elem) => {
    elemRef.current = elem;
  };

  useEffect(() => {
    if (!elemRef.current) return;
    let isUnmounted = false;
    const ob = new IntersectionObserver(
      ([entry]) => {
        if (isUnmounted) return;
        const isElementIntersecting = entry.isIntersecting;
        if (onIntersection(isElementIntersecting, ob) === false) {
          ob.disconnect();
        }
        setIsIntersecting(isElementIntersecting);
      },
      { ...options },
    );
    ob.observe(elemRef.current);
    return () => {
      ob.disconnect();
      isUnmounted = true;
    };
  }, [elemRef.current, options]);

  return [isIntersecting, setElem];
}
