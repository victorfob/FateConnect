import type { Area } from 'react-easy-crop';

/** O avatar maior tem 96px; acima disto a foto só pesa no envio. */
const MAX_SIDE_PX = 1024;
const CANVAS_ORIGIN = 0;

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', () => reject(new Error('A foto não carregou.')));
    image.src = source;
  });
}

function canvasBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('A foto não foi gerada.'));
        return;
      }

      resolve(blob);
    }, type);
  });
}

/** Desenha só a área escolhida num quadrado e devolve um arquivo no formato do original. */
export async function cropPhoto(photo: File, source: string, area: Area): Promise<File> {
  const image = await loadImage(source);
  const side = Math.min(Math.round(area.width), MAX_SIDE_PX);
  const canvas = document.createElement('canvas');
  canvas.width = side;
  canvas.height = side;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('O navegador não desenhou a foto.');

  context.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    CANVAS_ORIGIN,
    CANVAS_ORIGIN,
    side,
    side,
  );
  const blob = await canvasBlob(canvas, photo.type);

  return new File([blob], photo.name, { type: blob.type });
}
