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

  const { id } = req.query;

  if (req.method === 'POST') {
    if (!session) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (id == session.user.id) {
      return res.status(400).json({ error: "You can't follow yourself" });
    }

    try {
      const follow = await prisma.follows.upsert({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: id,
          },
        },
        update: {},
        create: {
          followerId: session.user.id,
          followingId: id,
        },
        include: {
          follower: true,
        },
      });

      return res.status(200).json({ data: follow });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'DELETE') {
    if (!session) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (id == session.user.id) {
      return res.status(400).json({ error: "You can't unfollow yourself" });
    }

    try {
      const unfollow = await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: id,
          },
        },
        rejectOnNotFound: false,
      });

      return res.status(200).json({ data: unfollow });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST', 'DELETE']);
    res.status(405).json({ error: `HTTP method ${req.method} is not supported.` });
  }

  //...
}
