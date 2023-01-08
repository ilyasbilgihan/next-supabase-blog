import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { prisma } from '@/lib/prisma';
import { postValidation } from '@/validations/post.validation';
import validate from '@/validations/validate';
import slugify from '@/utils/slugify';
import uploadImageToSupabaseBucket from '@/utils/uploadImageToSupabaseBucket';
import deleteImageFromSupabaseBucket from '@/utils/deleteImageFromSupabaseBucket';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '3mb',
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

  if (req.method === 'DELETE') {
    if (!session) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    try {
      const post = await prisma.post.findUnique({
        where: {
          id,
        },
        select: {
          ownerId: true,
        },
      });

      if (session.user.id != post.ownerId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const deletedPost = await prisma.post.delete({
        where: {
          id,
        },
      });

      await deleteImageFromSupabaseBucket(
        supabase,
        `post-images/${deletedPost.ownerId}/${slugify(deletedPost.slug)}`,
      );

      return res.status(200).json({ data: deletedPost });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'PATCH') {
    if (!session) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const post = await prisma.post.findUnique({
        where: {
          id,
        },
        select: {
          ownerId: true,
        },
      });

      if (session.user.id != post.ownerId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const isValid = await validate(req.body, postValidation);
      if (isValid?.error) return res.status(400).json({ error: isValid.error });

      const { title, description, content, tags, image } = req.body;

      let postImageURL = image;
      if (image?.startsWith('data:image/')) {
        postImageURL = await uploadImageToSupabaseBucket(
          supabase,
          image,
          `post-images/${session.user.id}/${slugify(title)}`,
        );
      } else if (!image.startsWith(process.env.NEXT_PUBLIC_SUPABASE_URL)) {
        return res.status(400).json({ error: 'Invalid Image URL' });
      }

      await prisma.post.update({
        where: {
          id,
        },
        data: {
          tags: {
            set: [],
          },
        },
      });

      const updatedPost = await prisma.post.update({
        where: {
          id,
        },
        data: {
          description,
          image: postImageURL,
          content,
          tags: {
            connectOrCreate: tags.map((tag) => ({
              where: { slug: tag.slug },
              create: { ...tag },
            })),
          },
        },
      });

      return res.status(201).json({ data: updatedPost });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['PATCH', 'DELETE']);
    res.status(405).json({ error: `HTTP method ${req.method} is not supported.` });
  }

  //...
}
