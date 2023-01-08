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

    try {
      const like = await prisma.postLike.upsert({
        where: {
          likerId_postId: {
            likerId: session.user.id,
            postId: id,
          },
        },
        update: {},
        create: {
          likerId: session.user.id,
          postId: id,
        },
      });

      return res.status(200).json({ data: like });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'DELETE') {
    if (!session) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const removeLike = await prisma.postLike.delete({
        where: {
          likerId_postId: {
            likerId: session.user.id,
            postId: id,
          },
        },
        rejectOnNotFound: false,
      });

      return res.status(200).json({ data: removeLike });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST', 'DELETE']);
    res.status(405).json({ error: `HTTP method ${req.method} is not supported.` });
  }

  //...
}
