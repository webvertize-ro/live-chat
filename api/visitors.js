import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed!' });
  }

  const { name, phoneNumber } = req.body;

  if (!name || !phoneNumber) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const { error } = await supabase.from('visitors').insert([
    {
      name,
      phone_number: phoneNumber,
    },
  ]);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Database error' });
  }

  return res.status(200).json({ success: true });
}
