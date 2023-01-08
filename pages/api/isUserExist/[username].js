import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import {} from '@supabase/auth-helpers-react';
import { prisma } from '@/lib/prisma';

import { usernameValidation } from '@/validations/user.validation';
import validate from '@/validations/validate';

export default async function handler(req, res) {
  const supabase = createServerSupabaseClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  /* if (!session) {
    return res.status(403).json({ error: 'Forbidden' });
  } */

  if (req.method === 'GET') {
    const { username } = req.query;

    const isValid = await validate(req.query, usernameValidation);
    if (isValid?.error) return res.status(400).json({ error: isValid.error });

    try {
      const user = await prisma.user.findUnique({
        where: {
          username,
        },
      });

      return res.status(200).json({ data: user ? true : false });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `HTTP method ${req.method} is not supported.` });
  }

  //...
}
