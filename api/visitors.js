import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, phoneNumber } = req.body;

    // Validation
    if (!name || !phoneNumber) {
      return res.status(400).json({ error: 'Missing fields!' });
    }

    // Inserting into the database
    const { data, error } = await supabase
      .from('visitors')
      .insert([
        {
          name,
          phone_number: phoneNumber,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Database error' });
    }

    // Inserting the pre-defined message in the messages table
    // const { dataM, errorM } = await supabase
    //   .from('messages')
    //   .insert([
    //     {
    //       user_name: 'Edion Trans',
    //       message: 'Buna ziua! Cu ce va putem ajuta astazi?',
    //       sender_type: 'admin',
    //       visitor_id: visitor_id,
    //       type: 'text',
    //     },
    //   ])
    //   .select()
    //   .single();

    // if (errorM) {
    //   console.error(error);
    //   return res.status(500).json({
    //     error: 'Error inserting the pre-defined message in the database.',
    //   });
    // }

    return res.status(200).json({
      success: true,
      visitor: data,
    });
  }

  if (req.method === 'GET') {
    const { visitorId } = req.query;

    if (!visitorId) {
      return res.status(400).json({ error: 'Missing visitorId' });
    }

    const { data, error } = await supabase
      .from('visitors')
      .select('*')
      .eq('id', visitorId)
      .single();

    if (error) {
      console.error(error);
      return res.status(404).json({ error: 'Visitor not found' });
    }

    return res.status(200).json({
      success: true,
      visitor: data,
    });
  }

  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}
