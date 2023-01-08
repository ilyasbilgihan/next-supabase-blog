import { Router } from 'next/router';
import { useEffect, useState } from 'react';

export default function usePageLoading() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    Router.events.on('routeChangeStart', (url) => {
      setIsLoading(true);
    });

    Router.events.on('routeChangeComplete', (url) => {
      setIsLoading(false);
    });

    Router.events.on('routeChangeError', (url) => {
      setIsLoading(false);
    });
  }, [Router]);

  return isLoading;
}
