import Link from 'next/link';
import { useRouter } from 'next/router';
import useHideOnScroll from 'hooks/useHideOnScroll';
import { useUser } from 'store/UserContext';
import { useSessionContext } from '@supabase/auth-helpers-react';
import Image from 'next/image';

const navbarMobileItems = [
  {
    icon: 'isax-home',
    iconActive: 'isax-bulk-home',
    color: 'text-rose-700',
    shadowColor: 'shadow-rose-200',
    href: '/your-feed',
  },
  {
    icon: 'isax-discover',
    iconActive: 'isax-bulk-discover',
    color: 'text-purple-700',
    shadowColor: 'shadow-purple-200',
    href: '/',
  },
  {
    icon: 'isax-edit',
    iconActive: 'isax-bulk-edit',
    color: 'text-blue-600',
    shadowColor: 'shadow-blue-200',
    href: '/write',
    protected: true,
  },
  {
    icon: 'isax-save-2',
    iconActive: 'isax-bulk-save-2',
    color: 'text-yellow-600',
    shadowColor: 'shadow-yellow-100',
    href: '/bookmarks',
    protected: true,
  },
];

export default function NavbarMobile() {
  const router = useRouter();
  const show = useHideOnScroll();

  const sessionContext = useSessionContext();

  const { user, signOut } = useUser();

  return (
    <nav
      style={{
        boxShadow: '0 -2px 4px 2px rgba(0,0,0,.05)',
        transition: 'bottom 0.3s',
      }}
      className={`${
        show ? 'bottom-0' : '-bottom-14'
      } sm:hidden fixed z-20 bg-white bottom-0 w-full text-sm flex backdrop-blur backdrop-saturate-150 bg-opacity-60`}
    >
      <ul className="mobile-menu flex w-full items-center justify-around text-xl">
        {navbarMobileItems.map((item) => {
          if (!sessionContext.session && item.protected) {
            return;
          }

          return (
            <li key={item.href}>
              <Link className="inline-flex items-center justify-center h-14 w-14" href={item.href}>
                <span
                  className={`${
                    item.href == router.pathname
                      ? `${item.iconActive} drop-shadow-md text-2xl ${item.color} ${item.shadowColor} `
                      : item.icon
                  }`}
                >
                  <span className="path1"></span>
                  <span className="path2"></span>
                  <span className="path3"></span>
                </span>
              </Link>
            </li>
          );
        })}
        {sessionContext.session ? (
          <li>
            <Link href={`/${user?.username}`}>
              <Image
                alt={user?.username || 'Anonymous'}
                className="rounded-full border"
                src={user?.image || '/profile.jpg'}
                width={32}
                height={32}
              />
            </Link>
          </li>
        ) : (
          ''
        )}
      </ul>
    </nav>
  );
}
