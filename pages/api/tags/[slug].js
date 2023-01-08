import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  const supabase = createServerSupabaseClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  /* if (!session) {
    return res.status(403).json({ error: 'Forbidden' });
  } */
  const { slug } = req.query;

  if (req.method === 'GET') {
    try {
      const limit = req.query?.limit || 5;
      const cursor = req.query?.cursor || '';
      const cursorObj = cursor ? { id: cursor } : undefined;
      const tag = await prisma.tag.findUnique({
        where: {
          slug,
        },
        include: {
          posts: {
            skip: cursor !== '' ? 1 : 0, // skip if cursor
            cursor: cursorObj,
            take: +limit,
            orderBy: {
              createdAt: 'desc',
            },
            include: {
              owner: true,
              tags: true,
              likes: true,
            },
          },
        },
      });

      return res.status(200).json({
        posts: tag?.posts,
        nextId: tag?.posts.at(-1)?.id || null,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ message: `HTTP method ${req.method} is not supported.` });
  }

  //...
}
