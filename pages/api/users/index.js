import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { prisma } from '@/lib/prisma';
import { usernameValidation } from '@/validations/user.validation';
import validate from '@/validations/validate';

export default async function handler(req, res) {
  const supabase = createServerSupabaseClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (req.method === 'GET') {
    // TODO
  } else if (req.method === 'POST') {
    if (!session) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { username } = req.body;

    const isValid = await validate(req.body, usernameValidation);
    if (isValid?.error) return res.status(400).json({ error: isValid.error });

    try {
      const user = await prisma.user.create({
        data: {
          id: session.user.id,
          username,
          email: session.user.email,
        },
      });

      return res.status(201).json({ data: user });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `HTTP method ${req.method} is not supported.` });
  }

  //...
}
