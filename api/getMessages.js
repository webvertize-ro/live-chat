import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { visitor_id } = req.query;

  let query = supabase
    .from('messages')
    .select('*')
    .eq('visitor_id', visitor_id)
    .order('created_at', { ascending: true });

  if (visitor_id && visitor_id !== 'undefined') {
    query = query.eq('visitor_id', visitor_id);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Database error' });
  }

  return res.status(200).json({ messages: data });
}
