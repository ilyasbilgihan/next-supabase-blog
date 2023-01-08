import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { prisma } from '@/lib/prisma';
import { commentValidation } from '@/validations/comment.validation';
import validate from '@/validations/validate';

export default async function handler(req, res) {
  const supabase = createServerSupabaseClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  /* if (!session) {
    return res.status(403).json({ error: 'Forbidden' });
  } */

  if (req.method === 'POST') {
    if (!session) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const isValid = await validate(req.body, commentValidation);
      if (isValid?.error) return res.status(400).json({ error: isValid.error });

      const { content, postId, parentId } = req.body;

      if (content.trim() == '') {
        return res.status(400).json({ error: 'Invalid comment content' });
      }

      if (parentId) {
        const parent = await prisma.comment.findUnique({
          where: {
            id: parentId,
          },
          select: {
            ownerId: true,
          },
        });

        if (parent.ownerId == 'anonymous') {
          return res.status(400).json({ error: 'Can not reply to a deleted comment' });
        }
      }

      const createdComment = await prisma.comment.create({
        data: {
          content: content.trim(),
          postId,
          parentId,
          ownerId: session.user.id,
        },
        include: {
          owner: true,
          _count: {
            select: { replies: true },
          },
          reactions: true,
        },
      });
      const addToHistory = await prisma.commentHistory.create({
        data: {
          commentId: createdComment.id,
          createdAt: createdComment.updatedAt,
          content: createdComment.content,
        },
      });

      return res.status(201).json({ data: { ...createdComment, history: [addToHistory] } });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `HTTP method ${req.method} is not supported.` });
  }

  //...
}
