import CustomHead from '@/components/CustomHead';
import ListPostCards from '@/components/ListPostCards';
import PageHeading from '@/components/PageHeading';
import { serialize, prisma } from '@/lib/prisma';

const LIMIT = 3;

export default function Tag({ tag }) {
  return (
    <>
      <CustomHead
        title={`Posts tagged with "${tag.name}"`}
        description={`List of posts tagged with "${tag.name}"`}
      />
      <PageHeading
        title={`${tag.name}`}
        icon="isax-clipboard"
        color="bg-emerald-50 text-emerald-700"
      />
      <ListPostCards limit={LIMIT} apiUrl={`/api/tags/${tag.slug}`} initialPosts={tag.posts} />
    </>
  );
}

export async function getServerSideProps({ req, res, query }) {
  const tag = await prisma.tag.findUnique({
    where: {
      slug: query.slug,
    },
    include: {
      posts: {
        take: LIMIT,
        orderBy: {
          createdAt: 'desc',
        },
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
      },
    },
  });

  console.log(tag);
  if (!tag || tag.posts.length == 0) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {
      tag: serialize(tag),
    },
  };
}
