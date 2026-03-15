const CANVAS_W = 1080;
const CANVAS_H = 1350;
const PHOTO_H = 972;   // 72% of height
const SEP_Y = PHOTO_H;
const SEP_H = 2;
const BAND_Y = SEP_Y + SEP_H;
const BAND_H = CANVAS_H - BAND_Y;  // ~376px
const MARGIN_L = 72;

async function loadFonts(): Promise<void> {
  if (typeof document === 'undefined') return;

  const needsInstrument = !document.fonts.check('italic 96px "Instrument Serif"');
  const needsSpaceMono = !document.fonts.check('bold 28px "Space Mono"');

  if (!needsInstrument && !needsSpaceMono) return;

  const timeout = new Promise<void>((resolve) => setTimeout(resolve, 3000));

  const loads: Promise<void>[] = [];

  if (needsInstrument) {
    const face = new FontFace(
      'Instrument Serif',
      'url(https://fonts.gstatic.com/s/instrumentserif/v1/Hd_TW_-PHH4wQpfzRSsN64I-bquKqw.woff2) format("woff2")',
      { style: 'italic' }
    );
    loads.push(
      face
        .load()
        .then((f) => { document.fonts.add(f); })
        .catch(() => { /* swallow */ })
    );
  }

  if (needsSpaceMono) {
    const face = new FontFace(
      'Space Mono',
      'url(https://fonts.gstatic.com/s/spacemono/v13/i7dPIFZifjKcF5UAWdDRYEF8RQ.woff2) format("woff2")',
      { weight: '400 700' }
    );
    loads.push(
      face
        .load()
        .then((f) => { document.fonts.add(f); })
        .catch(() => { /* swallow */ })
    );
  }

  try {
    await Promise.race([Promise.all(loads), timeout]);
  } catch {
    // swallow — canvas falls back to Georgia/Courier New
  }
}

function drawPhotoZone(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement
): void {
  // Object-cover scale into photo zone
  const scale = Math.max(CANVAS_W / img.naturalWidth, PHOTO_H / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const dx = (CANVAS_W - dw) / 2;
  const dy = (PHOTO_H - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);

  // Radial vignette
  const vignette = ctx.createRadialGradient(
    CANVAS_W / 2, PHOTO_H / 2, CANVAS_W * 0.25,
    CANVAS_W / 2, PHOTO_H / 2, CANVAS_W * 0.85
  );
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, CANVAS_W, PHOTO_H);

  // Bottom fade to black
  const fade = ctx.createLinearGradient(0, PHOTO_H * 0.6, 0, PHOTO_H);
  fade.addColorStop(0, 'rgba(0,0,0,0)');
  fade.addColorStop(1, 'rgba(0,0,0,0.88)');
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, CANVAS_W, PHOTO_H);
}

function drawBrandBand(
  ctx: CanvasRenderingContext2D,
  event: { name: string; dateLabel: string; locationLabel: string }
): void {
  // Dark background
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, BAND_Y, CANVAS_W, BAND_H);

  const bandMid = BAND_Y + BAND_H / 2;

  // "MOMENTS." logotype
  ctx.font = 'italic 96px "Instrument Serif", Georgia, serif';
  ctx.fillStyle = '#F5F5F5';
  ctx.textBaseline = 'top';
  const logoY = BAND_Y + 36;
  ctx.fillText('MOMENTS.', MARGIN_L, logoY);

  // Red rule below logotype
  const ruleY = logoY + 128;
  ctx.fillStyle = '#FF4500';
  ctx.fillRect(MARGIN_L, ruleY, 1, 32);

  // Event name
  const eventY = ruleY + 52;
  ctx.font = 'bold 28px "Space Mono", "Courier New", monospace';
  ctx.fillStyle = '#FF4500';
  ctx.textBaseline = 'top';
  try {
    // letterSpacing is non-standard but supported in modern Chrome/Safari
    (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = '7px';
  } catch {
    // ignore if unsupported
  }
  ctx.fillText(event.name.toUpperCase(), MARGIN_L, eventY);

  // Date / location
  try {
    (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = '0px';
  } catch {
    // ignore
  }
  ctx.font = '20px "Space Mono", "Courier New", monospace';
  ctx.fillStyle = '#737373';
  ctx.fillText(`${event.dateLabel} / ${event.locationLabel}`, MARGIN_L, eventY + 48);

  // Diamond accent — rotated 16px square, right edge, vertically centered in band
  const diamondX = CANVAS_W - 72;
  ctx.save();
  ctx.translate(diamondX, bandMid);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = '#FF4500';
  ctx.fillRect(-11, -11, 22, 22);
  ctx.restore();
}

export async function createHackathonComposite(
  photoBlob: Blob,
  event: { name: string; dateLabel: string; locationLabel: string }
): Promise<Blob> {
  await loadFonts();

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    const url = URL.createObjectURL(photoBlob);
    el.onload = () => {
      URL.revokeObjectURL(url);
      resolve(el);
    };
    el.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load photo for composite'));
    };
    el.src = url;
  });

  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  // Fill base black
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  drawPhotoZone(ctx, img);

  // Separator line
  ctx.fillStyle = '#FF4500';
  ctx.fillRect(0, SEP_Y, CANVAS_W, SEP_H);

  drawBrandBand(ctx, event);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('canvas.toBlob returned null'));
          return;
        }
        resolve(blob);
      },
      'image/jpeg',
      0.88
    );
  });
}
