import { cropPhoto } from './cropPhoto';

const SOURCE = 'data:image/jpeg;base64,cmV0cmF0bw==';
const PHOTO = new File(['retrato'], 'retrato.jpg', { type: 'image/jpeg' });

/** A imagem do jsdom não carrega nada: esta avisa que carregou, ou que falhou. */
function stubImage(outcome: 'load' | 'error') {
  vi.stubGlobal(
    'Image',
    class {
      private readonly listeners = new Map<string, VoidFunction>();

      addEventListener(type: string, listener: VoidFunction) {
        this.listeners.set(type, listener);
      }

      set src(_source: string) {
        queueMicrotask(() => this.listeners.get(outcome)?.());
      }
    },
  );
}

function stubCanvas(context: object | null, blob: Blob | null) {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    context as unknown as CanvasRenderingContext2D,
  );
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => callback(blob));
}

describe('cropPhoto', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should draw the chosen area into a square, capped at 1024px, in the original format', async () => {
    const drawImage = vi.fn();
    stubImage('load');
    stubCanvas({ drawImage }, new Blob(['recortada'], { type: 'image/jpeg' }));

    const cropped = await cropPhoto(PHOTO, SOURCE, { x: 10, y: 400, width: 1125, height: 1125 });

    expect(drawImage).toHaveBeenCalledWith(
      expect.anything(),
      10,
      400,
      1125,
      1125,
      0,
      0,
      1024,
      1024,
    );
    expect(cropped.name).toBe('retrato.jpg');
    expect(cropped.type).toBe('image/jpeg');
  });

  it('should keep a small area at its own size', async () => {
    const drawImage = vi.fn();
    stubImage('load');
    stubCanvas({ drawImage }, new Blob(['recortada'], { type: 'image/jpeg' }));

    await cropPhoto(PHOTO, SOURCE, { x: 0, y: 0, width: 450, height: 450 });

    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 450, 450, 0, 0, 450, 450);
  });

  it('should fail when the photo does not load', async () => {
    stubImage('error');

    await expect(cropPhoto(PHOTO, SOURCE, { x: 0, y: 0, width: 10, height: 10 })).rejects.toThrow();
  });

  it('should fail when the browser gives no canvas to draw on', async () => {
    stubImage('load');
    stubCanvas(null, null);

    await expect(cropPhoto(PHOTO, SOURCE, { x: 0, y: 0, width: 10, height: 10 })).rejects.toThrow();
  });

  it('should fail when the canvas produces no file', async () => {
    stubImage('load');
    stubCanvas({ drawImage: vi.fn() }, null);

    await expect(cropPhoto(PHOTO, SOURCE, { x: 0, y: 0, width: 10, height: 10 })).rejects.toThrow();
  });
});
