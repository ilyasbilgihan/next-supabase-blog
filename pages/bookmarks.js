import ListPostCards from '@/components/ListPostCards';
import Loader from '@/components/Loader';
import { useUser } from 'store/UserContext';
import PageHeading from '@/components/PageHeading';
import Link from 'next/link';
import CustomHead from '@/components/CustomHead';

const LIMIT = 3;

export default function Bookmarks() {
  const { user } = useUser();

  return (
    <>
      <CustomHead title={`Your Feed`} />
      <PageHeading title="Your Feed" icon="isax-people" color="bg-rose-50 text-rose-700" />

      {user ? (
        user.followings?.length ? (
          <ListPostCards limit={LIMIT} apiUrl={`/api/feed/${user.id}`} />
        ) : (
          <div>
            You are not following anyone yet. Go to{' '}
            <Link className="text-primary" href="/">
              Discover
            </Link>{' '}
            to find people to follow.
          </div>
        )
      ) : (
        <Loader />
      )}
    </>
  );
}
