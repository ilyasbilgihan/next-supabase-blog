import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { prisma } from '@/lib/prisma';

import { coverImageValidation } from '@/validations/user.validation';
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

  if (!session) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { id } = req.query;

  if (req.method === 'PATCH') {
    // Check if user is authenticated and is the owner of the data
    if (session.user.id != id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const isValid = await validate(req.body, coverImageValidation);
    if (isValid?.error) return res.status(400).json({ error: isValid.error });

    try {
      let coverImageURL = null;
      if (req.body.coverImage != '') {
        if (req.body.coverImage?.startsWith('data:image/')) {
          coverImageURL = await uploadImageToSupabaseBucket(
            supabase,
            req.body.coverImage,
            `cover-images/${id}`,
          );
        } else if (req.body.coverImage?.startsWith(process.env.NEXT_PUBLIC_SUPABASE_URL)) {
          coverImageURL = req.body.coverImage;
        } else {
          return res.status(400).json({ error: 'Invalid Image URL' });
        }
      }

      const updateUser = await prisma.user.update({
        where: {
          id,
        },
        data: {
          coverImage: coverImageURL,
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
