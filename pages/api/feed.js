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
      const cursorObj = cursor
        ? { ownerId_postId: { ownerId: session.user.id, postId: cursor } }
        : undefined;
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          bookmarks: {
            skip: cursor !== '' ? 1 : 0, // skip if cursor
            cursor: cursorObj,
            take: +limit,
            include: {
              post: {
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
            orderBy: {
              assignedAt: 'desc',
            },
          },
        },
      });

      return res.status(200).json({
        posts: user.bookmarks.map((b) => b.post),
        nextId: user.bookmarks.at(-1)?.postId || null,
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
