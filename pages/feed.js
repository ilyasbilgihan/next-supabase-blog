import ListPostCards from '@/components/ListPostCards';
import Loader from '@/components/Loader';
import { useUser } from 'store/UserContext';
import PageHeading from '@/components/PageHeading';

import CustomHead from '@/components/CustomHead';

const LIMIT = 3;

export default function Feed() {
  const { user } = useUser();

  return (
    <>
      <CustomHead title={`Bookmarks`} />
      <PageHeading title="Bookmarks" icon="isax-save-2" color="bg-yellow-50 text-yellow-700" />

      {user ? (
        user.bookmarks?.length ? (
          <ListPostCards limit={LIMIT} apiUrl={`/api/bookmarks/${user.id}`} />
        ) : (
          'You have no bookmarks yet.'
        )
      ) : (
        <Loader />
      )}
    </>
  );
}
