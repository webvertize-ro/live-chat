import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed!' });
  }
  const { user_name, message, visitor_id } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Missing required fields!' });
  }

  const { error } = await supabase.from('messages').insert([
    {
      visitor_id,
      user_name,
      message,
      sender_type: 'user',
    },
  ]);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Database error' });
  }

  return res.status(200).json({ success: true });
}
