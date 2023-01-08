import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { prisma } from '@/lib/prisma';

import { userDetailsValidation } from '@/validations/user.validation';
import validate from '@/validations/validate';
import uploadImageToSupabaseBucket from '@/utils/uploadImageToSupabaseBucket';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb',
    },
  },
};

export default async function handler(req, res) {
  const supabase = createServerSupabaseClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  /* if (!session) {
    return res.status(403).json({ error: 'Forbidden' });
  } */
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      if (req.query.cursor) {
        const limit = req.query?.limit || 5;
        const cursor = req.query?.cursor || '';
        const cursorObj = cursor ? { id: cursor } : undefined;
        const user = await prisma.user.findUnique({
          where: {
            id,
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
          posts: user?.posts,
          nextId: user?.posts.at(-1)?.id || null,
        });
      } else {
        const user = await prisma.user.findUnique({
          where: {
            id,
          },
          include: {
            likedPosts: true,
            bookmarks: true,
            followings: true,
            followers: true,
          },
        });

        if (user) {
          return res.status(200).json({ data: user });
        } else {
          return res.status(404).json({ error: 'User not found' });
        }
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'PATCH') {
    // Check if user is authenticated and is the owner of the data
    if (!session) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (session.user.id != id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const isValid = await validate(req.body, userDetailsValidation);
    if (isValid?.error) return res.status(400).json({ error: isValid.error });

    try {
      let avatarURL = null;
      if (req.body.image != '') {
        if (req.body.image?.startsWith('data:image/')) {
          avatarURL = await uploadImageToSupabaseBucket(
            supabase,
            req.body.image,
            `profile-images/${id}`,
          );
        } else if (req.body.image?.startsWith(process.env.NEXT_PUBLIC_SUPABASE_URL)) {
          avatarURL = req.body.image;
        } else {
          return res.status(400).json({ error: 'Invalid Image URL' });
        }
      }

      const updateUser = await prisma.user.update({
        where: {
          id,
        },
        data: {
          ...req.body,
          image: avatarURL,
        },
        include: {
          likedPosts: true,
          bookmarks: true,
          followings: true,
          followers: true,
        },
      });

      return res.status(200).json({ data: updateUser });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PATCH']);
    res.status(405).json({ message: `HTTP method ${req.method} is not supported.` });
  }

  //...
}
