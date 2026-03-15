import { NextResponse } from 'next/server';
import { uploadFileToPinata } from '@/lib/pinata-server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const filenameValue = formData.get('filename');
    const filename =
      typeof filenameValue === 'string' && filenameValue.trim()
        ? filenameValue
        : 'moment-upload';

    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: 'Missing upload file' }, { status: 400 });
    }

    const cid = await uploadFileToPinata(file, filename);
    return NextResponse.json({ cid });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Upload failed';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
