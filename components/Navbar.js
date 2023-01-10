import Link from 'next/link';
import Router, { useRouter } from 'next/router';
import Dropdown from './Dropdown';
import useHideOnScroll from 'hooks/useHideOnScroll';

import { useSessionContext } from '@supabase/auth-helpers-react';

const topNavigation = [{ name: 'Feed', href: '/feed', isProtected: true }];

const dropdownItems = [
  {
    name: 'Public Profile',
    icon: <span className="isax-user-square text-lg"></span>,
  },
  {
    name: 'Write Post',
    icon: <span className="isax-receipt-edit text-xl"></span>,
    withDivider: true,
  },
  {
    name: 'Bookmarks',
    icon: <span className="isax-save-2 text-lg"></span>,
  },
  {
    name: 'Profile Details',
    icon: <span className="isax-user-edit text-lg"></span>,
    withDivider: true,
  },
  {
    name: 'Logout',
    icon: <span className="isax-logout text-lg"></span>,
    color: 'danger',
    withDivider: true,
  },
];

import { useUser } from 'store/UserContext';
import Image from 'next/image';

export default function Navbar() {
  const router = useRouter();
  const sessionContext = useSessionContext();
  const { user, signOut } = useUser();

  const show = useHideOnScroll();

  const handleLogout = async () => {
    const { error } = await sessionContext.supabaseClient.auth.signOut();
    if (error) {
      console.log(error);
    } else {
      signOut(); // set user data to null
      router.reload();
    }
  };

  return (
    <nav
      style={{ transition: 'top 0.3s' }}
      className={`${
        show ? 'top-0' : '-top-16'
      } z-40 flex fixed w-full h-14 sm:h-16 wrapper items-center justify-center sm:justify-between shadow-md bg-white backdrop-blur backdrop-saturate-150 bg-opacity-60`}
    >
      <span
        onClick={() => {
          router.back();
        }}
        className="sm:hidden cursor-pointer isax-arrow-left-2 text-xl absolute left-0 w-14 h-14 flex items-center justify-center"
      ></span>
      <Link title="Write You Want" href="/" className="mt-2 select-none">
        <Image
          src="/logo.png"
          width="100"
          height="32"
          alt="WuW logo"
          priority={true}
          className="drop-shadow-sm shadow-gray-400"
        />
      </Link>
      <div></div>
      <div className="hidden sm:flex">
        <ul className="flex items-center gap-6">
          {topNavigation.map((item) =>
            item.isProtected && !user ? (
              ''
            ) : (
              <li
                key={item.name}
                className={`${router.pathname == item.href ? 'text-primary drop-shadow-md' : ''}`}
              >
                <Link href={item.href}>{item.name}</Link>
              </li>
            ),
          )}
          {sessionContext.session ? (
            <li>
              <Dropdown
                items={dropdownItems}
                handler={(target) => {
                  switch (target) {
                    case 'Public Profile':
                      router.push(`/${user?.username}`);
                      break;
                    case 'Write Post':
                      router.push('/write');
                      break;
                    case 'Bookmarks':
                      router.push('/bookmarks');
                      break;
                    case 'Profile Details':
                      router.push('/settings');
                      break;
                    case 'Logout':
                      handleLogout();
                      break;
                    default:
                      break;
                  }
                }}
              >
                <Image
                  alt={user?.username || 'Anonymous'}
                  className="rounded-full shadow"
                  src={user?.image || '/profile.jpg'}
                  width={36}
                  height={36}
                />
              </Dropdown>
            </li>
          ) : (
            <li>
              <Link
                href="/login"
                className={`${router.pathname == '/login' ? 'text-primary drop-shadow-md' : ''}`}
              >
                Login
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
