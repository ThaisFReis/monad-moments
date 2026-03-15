import { NextResponse } from 'next/server';
import type { MetadataPayload } from '@/lib/pinata';
import { uploadMetadataToPinata } from '@/lib/pinata-server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const metadata = (await request.json()) as MetadataPayload;

    if (!metadata?.image || !Array.isArray(metadata.attributes)) {
      return NextResponse.json({ error: 'Invalid metadata payload' }, { status: 400 });
    }

    const cid = await uploadMetadataToPinata(metadata);
    return NextResponse.json({ cid });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Metadata upload failed';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
