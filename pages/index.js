import CustomHead from '@/components/CustomHead';
import ListPostCards from '@/components/ListPostCards';
import PageHeading from '@/components/PageHeading';
import { serialize, prisma } from '@/lib/prisma';

const LIMIT = 3;

export default function Home({ posts, scrollRef }) {
  return (
    <>
      <PageHeading title="Discover" icon="isax-discover-1" color="bg-purple-50 text-purple-700" />
      <ListPostCards target={scrollRef} initialPosts={posts} limit={LIMIT} apiUrl="/api/posts" />
    </>
  );
}

export async function getServerSideProps() {
  const posts = await prisma.post.findMany({
    take: LIMIT,
    include: {
      owner: true,
      tags: true,
      likes: true,
      _count: {
        select: {
          comments: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return {
    props: {
      posts: serialize(posts),
    },
  };
}
