import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed!' });
  }

  const {
    user_name,
    message,
    sender_type,
    visitor_id,
    type = 'text',
    file_url,
    file_name,
    file_mime,
  } = req.body;

  if (!visitor_id || !sender_type) {
    return res.status(400).json({ error: 'Missing required fields!' });
  }

  const { data, error } = await supabase
    .from('messages')
    .insert([
      {
        user_name,
        message,
        sender_type,
        visitor_id,
        type,
        file_url,
        file_name,
        file_mime,
      },
    ])
    .select()
    .single();

  if (sender_type === 'user') {
    const { error: rpcError } = await supabase.rpc('increment_unread_count', {
      v_id: visitor_id,
    });

    if (rpcError) {
      console.error(rpcError);
    }
  }

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Database error' });
  }

  return res.status(200).json({ success: true, message: data });
}
