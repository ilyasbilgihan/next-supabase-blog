import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function useHideOnScroll() {
  const router = useRouter();
  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const controlNavbar = (event) => {
    const target = event.target;
    if (typeof target !== 'undefined') {
      if (target.scrollTop > lastScrollY) {
        setShow(false);
      } else {
        setShow(true);
      }
      setLastScrollY(target.scrollTop);
    }
  };

  useEffect(() => {
    const target = document.getElementById('scroll-target');
    if (typeof target !== 'undefined') {
      target.addEventListener('scroll', controlNavbar);
      // cleanup
      return () => {
        target.removeEventListener('scroll', controlNavbar);
      };
    }
  }, [lastScrollY, router.asPath]);

  return show;
}
