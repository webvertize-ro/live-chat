import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(400).json({ error: 'File upload failed' });
    }

    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!uploadedFile || !uploadedFile.filepath) {
      return res.status(400).json({ error: 'No file received' });
    }

    const visitorId = Array.isArray(fields.visitor_id)
      ? fields.visitor_id[0]
      : fields.visitor_id;

    const fileBuffer = fs.readFileSync(uploadedFile.filepath);

    const filePath = `${visitorId}/${Date.now()}-${
      uploadedFile.originalFilename
    }`;

    const { error: uploadError } = await supabase.storage
      .from('chat-attachments')
      .upload(filePath, fileBuffer, {
        contentType: uploadedFile.mimetype,
      });

    // Clean up temp file
    fs.unlinkSync(uploadedFile.filepath);

    if (uploadError) {
      console.error(uploadError);
      return res.status(500).json({ error: 'Storage upload failed' });
    }

    const { data } = supabase.storage
      .from('chat-attachments')
      .getPublicUrl(filePath);

    return res.status(200).json({
      url: data.publicUrl,
      name: uploadedFile.originalFilename,
      mime: uploadedFile.mimetype,
      type: uploadedFile.mimetype.startsWith('image/') ? 'image' : 'file',
    });
  });
}
