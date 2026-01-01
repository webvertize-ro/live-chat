import { createClient } from '@supabase/supabase-js';
import { create } from 'domain';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

const supabase = create(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: 'File upload failed' });
    }

    const file = files.file;
    const fileBuffer = fs.readFileSync(file.filepath);

    const filePath = `${fields.visitor_id}/${Date.now()}-${
      file.originalFilename
    }`;

    const { error: uploadError } = await supabase.storage
      .from('chat-attachments')
      .upload(filePath, fileBuffer, {
        contentType: file.mimetype,
      });

    if (uploadError) {
      return res.status(500).json({ error: 'Storage upload failed' });
    }

    const { data } = supabase.storage
      .from('chat-attachments')
      .getPublicUrl(filePath);

    return res.status(200).json({
      url: data.getPublicUrl,
      name: file.originalFilename,
      mime: file.mimetype,
    });
  });
}
