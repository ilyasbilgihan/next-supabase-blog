import Navbar from './Navbar';
import NavbarMobile from './NavbarMobile';
import { Merriweather } from '@next/font/google';
import { useEffect } from 'react';
import { useUser } from 'store/UserContext';
const font = Merriweather({
  weight: ['300', '400', '700', '900'],
  subsets: ['latin-ext', 'latin'],
});

import CompleteRegistration from './CompleteRegistration';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Toaster } from 'react-hot-toast';

export default function Layout({ children }) {
  const supabase = useSupabaseClient();
  const { registration, setUser, setRegistration, signOut } = useUser();

  useEffect(() => {
    supabase.auth.getUser().then((res) => {
      if (!res.error) {
        let localUser = JSON.parse(localStorage.getItem('user-data'));
        if (localUser) {
          if (localUser?.username) {
            setUser(localUser);
          } else {
            setRegistration(true);
          }
        } else {
          supabase.auth.signOut().then((res) => {
            if (!res.error) {
              signOut();
            }
          });
        }
      }
    });
  }, []);

  return (
    <>
      <div className={`${font.className} flex flex-col h-screen`}>
        <Toaster position="top-left" reverseOrder={false} />
        <Navbar />
        <main
          id="scroll-target"
          style={{ overflowY: 'overlay' }}
          className="wrapper overflow-x-hidden flex-1 pt-14 sm:pt-16 pb-16"
        >
          {registration ? <CompleteRegistration /> : children}
        </main>
        <NavbarMobile />
      </div>
    </>
  );
}
