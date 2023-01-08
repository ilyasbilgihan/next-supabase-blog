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
  const { userId } = req.query;

  if (req.method === 'GET') {
    if (!session) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (session.user.id != userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const limit = req.query?.limit || 5;
      const cursor = req.query?.cursor || '';
      const cursorObj = cursor ? { id: cursor } : undefined;

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          followings: true,
        },
      });

      const followings = user.followings.map((f) => f.followingId);

      const posts = await prisma.post.findMany({
        where: {
          ownerId: { in: followings },
        },
        skip: cursor !== '' ? 1 : 0, // skip if cursor
        cursor: cursorObj,
        take: +limit,
        include: {
          owner: true,
          tags: true,
          likes: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return res.status(200).json({
        posts,
        nextId: posts.at(-1)?.id || null,
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
