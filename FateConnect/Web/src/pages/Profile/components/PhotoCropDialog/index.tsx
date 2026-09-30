import { useCallback, useState } from 'react';
import { Button, Dialog, Slider } from '@design-system';
import Cropper, { type Area, type Point } from 'react-easy-crop';

import { useFilePreviewUrl } from '@app/hooks/useFilePreviewUrl';
import { useNotification } from '@app/hooks/useNotification';

import { PHOTO_CROP_TEXTS, ZOOM_RANGE } from './constants';
import { cropPhoto } from './helpers/cropPhoto';
import * as S from './styles';

const CENTERED: Point = { x: 0, y: 0 };
const SQUARE = 1;

export type PhotoCropDialogProps = Readonly<{
  photo: File;
  onApply: (cropped: File) => void;
  onCancel: VoidFunction;
}>;

export function PhotoCropDialog({ photo, onApply, onCancel }: PhotoCropDialogProps) {
  const source = useFilePreviewUrl(photo);
  const { notifyError } = useNotification();
  const [crop, setCrop] = useState<Point>(CENTERED);
  const [zoom, setZoom] = useState(ZOOM_RANGE.min);
  const [area, setArea] = useState<Area | null>(null);
  const [applying, setApplying] = useState(false);

  const handleCropComplete = useCallback(
    (_area: Area, areaPixels: Area) => setArea(areaPixels),
    [],
  );

  const handleZoomChange = useCallback((_event: Event, value: number | number[]) => {
    if (typeof value === 'number') setZoom(value);
  }, []);

  const applyCrop = useCallback(async () => {
    if (!area || !source) return;

    setApplying(true);
    try {
      onApply(await cropPhoto(photo, source, area));
    } catch {
      notifyError(PHOTO_CROP_TEXTS.failed);
      setApplying(false);
    }
  }, [area, notifyError, onApply, photo, source]);

  const handleApply = useCallback(() => void applyCrop(), [applyCrop]);

  return (
    <Dialog open onClose={onCancel} title={PHOTO_CROP_TEXTS.title}>
      <Dialog.Body>
        <S.CropArea>
          {source && (
            <Cropper
              image={source}
              crop={crop}
              zoom={zoom}
              minZoom={ZOOM_RANGE.min}
              maxZoom={ZOOM_RANGE.max}
              aspect={SQUARE}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
            />
          )}
        </S.CropArea>
      </Dialog.Body>

      {/* Fora do miolo, que rola e recortaria o halo da bolinha do zoom. */}
      <S.CropControls>
        <S.CropHint variant="caption">{PHOTO_CROP_TEXTS.hint}</S.CropHint>
        <S.ZoomControl>
          <Slider
            value={zoom}
            min={ZOOM_RANGE.min}
            max={ZOOM_RANGE.max}
            step={ZOOM_RANGE.step}
            color="secondary"
            aria-label={PHOTO_CROP_TEXTS.zoom}
            onChange={handleZoomChange}
          />
        </S.ZoomControl>
      </S.CropControls>

      <Dialog.Footer>
        <Button type="button" variant="contained" color="primary" onClick={onCancel}>
          {PHOTO_CROP_TEXTS.cancel}
        </Button>
        <Button
          type="button"
          variant="contained"
          color="secondary"
          disabled={!area}
          loading={applying}
          onClick={handleApply}
        >
          {PHOTO_CROP_TEXTS.apply}
        </Button>
      </Dialog.Footer>
    </Dialog>
  );
}
