import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { prisma } from '@/lib/prisma';
import { postValidation } from '@/validations/post.validation';
import validate from '@/validations/validate';
import slugify from '@/utils/slugify';
import uploadImageToSupabaseBucket from '@/utils/uploadImageToSupabaseBucket';

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

  if (req.method === 'GET') {
    try {
      const limit = req.query?.limit || 5;
      const cursor = req.query?.cursor || '';
      const cursorObj = cursor ? { id: cursor } : undefined;

      const posts = await prisma.post.findMany({
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
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  } else if (req.method === 'POST') {
    if (!session) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const isValid = await validate(req.body, postValidation);
      if (isValid?.error) return res.status(400).json({ error: isValid.error });

      const { title, description, content, tags } = req.body;

      const postWithSlug = await prisma.post.findUnique({
        where: {
          slug_ownerId: {
            slug: slugify(title),
            ownerId: session.user.id,
          },
        },
      });

      if (postWithSlug) {
        return res.status(400).json({ error: 'You already have a post with a similar title.' });
      }

      let postImageURL;
      if (req.body.image?.startsWith('data:image/')) {
        postImageURL = await uploadImageToSupabaseBucket(
          supabase,
          req.body.image,
          `post-images/${session.user.id}/${slugify(title)}`,
        );
      } else {
        return res.status(400).json({ error: 'Invalid Image URL' });
      }

      const createdPost = await prisma.post.create({
        data: {
          slug: slugify(title),
          title,
          description,
          image: postImageURL,
          content,
          ownerId: session.user.id,
          tags: {
            connectOrCreate: tags.map((tag) => ({
              where: { slug: tag.slug },
              create: { ...tag },
            })),
          },
        },
        include: {
          owner: true,
        },
      });

      return res.status(201).json({ data: createdPost });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: `HTTP method ${req.method} is not supported.` });
  }

  //...
}
