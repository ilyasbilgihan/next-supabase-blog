import { useState } from 'react';
import Layout from '../components/Layout';

import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';

import '../styles/globals.css';
import { UserProvider } from 'store/UserContext';
import usePageLoading from 'hooks/usePageLoading';
import Loader from '@/components/Loader';
import Head from 'next/head';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());
  const isLoading = usePageLoading();
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Write You Want</title>
        <meta
          name="description"
          content="Next.js + Supabase + Prisma | Responsive blog application example"
          key="description"
        />
        <meta name="twitter:site" content="@ilyasbilgihan" />
        <meta name="og:site_name" content="Write You Want" />
        <meta name="twitter:url" content={router.asPath} />
        <meta name="og:url" content={router.asPath} />
        <meta name="twitter:creator" content="@ilyasbilgihan" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="robots" content="index, follow" />
        <meta name="og:type" content="website" key="type" />
      </Head>
      <SessionContextProvider
        supabaseClient={supabaseClient}
        initialSession={pageProps.initialSession}
      >
        <UserProvider>
          <Layout Component={Component}>
            {isLoading ? <Loader /> : <Component {...pageProps} />}
          </Layout>
        </UserProvider>
      </SessionContextProvider>
    </>
  );
}

export default MyApp;
