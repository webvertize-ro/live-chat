import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function acknowledgeConversation(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { visitor_id } = req.body;

  if (!visitor_id) {
    return res.status(400).json({ error: 'Missing visitor_id' });
  }

  const { error } = await supabase
    .from('visitors')
    .update({ unread_count_user: 0 })
    .eq('id', Number(visitor_id));

  if (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: 'Failed to acknowledge conversation' });
  }

  return res.status(200).json({ success: true });
}
