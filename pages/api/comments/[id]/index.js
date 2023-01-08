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

  const { id } = req.query;
  if (req.method === 'DELETE') {
    if (!session) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const targetComment = await prisma.comment.findUnique({
        where: {
          id,
        },
        select: {
          ownerId: true,
          _count: {
            select: {
              replies: true,
            },
          },
        },
      });

      if (![session.user.id, 'anonymous'].includes(targetComment.ownerId)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      let deletion = null;
      if (targetComment._count.replies > 0) {
        deletion = await prisma.comment.update({
          where: {
            id,
          },
          data: {
            ownerId: 'anonymous',
            content: 'Deleted Content',
          },
          include: {
            owner: true,
            _count: {
              select: { replies: true },
            },
          },
        });
      } else {
        deletion = await prisma.comment.delete({
          where: {
            id,
          },
          include: {
            owner: true,
            _count: {
              select: { replies: true },
            },
          },
        });
      }

      return res.status(200).json({ data: deletion });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'GET') {
    try {
      const replies = await prisma.comment.findMany({
        where: {
          parentId: id,
        },
        include: {
          history: {
            orderBy: {
              createdAt: 'asc',
            },
          },
          reactions: true,
          owner: true,
          _count: {
            select: { replies: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return res.status(200).json({ data: replies });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'PATCH') {
    if (!session) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const comment = await prisma.comment.findUnique({
        where: {
          id,
        },
        select: {
          ownerId: true,
          content: true,
        },
      });
      const { content } = req.body;

      if (session.user.id != comment.ownerId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (comment.content == content.trim()) {
        return res.status(400).json({ error: 'Please make some changes' });
      }

      if (content.trim() == '') {
        return res.status(400).json({ error: 'Invalid comment content' });
      }

      const isValid = await validate(req.body, commentValidation);
      if (isValid?.error) return res.status(400).json({ error: isValid.error });

      const updatedComment = await prisma.comment.update({
        where: {
          id,
        },
        data: {
          content: content.trim(),
        },
        include: {
          history: {
            orderBy: {
              createdAt: 'asc',
            },
          },
          owner: true,
          reactions: true,
          _count: {
            select: { replies: true },
          },
        },
      });
      const addToHistory = await prisma.commentHistory.create({
        data: {
          commentId: id,
          createdAt: updatedComment.updatedAt,
          content: updatedComment.content,
        },
      });

      return res.status(201).json({
        data: { ...updatedComment, history: [...updatedComment.history, addToHistory] },
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['DELETE', 'GET', 'PATCH']);
    res.status(405).json({ error: `HTTP method ${req.method} is not supported.` });
  }

  //...
}
