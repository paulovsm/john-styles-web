import React, { useCallback, useState } from 'react';
import Cropper from 'react-easy-crop';
import { Crop, ZoomIn } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';
import Button from './Button';

/**
 * Lets the user frame the part of a photo that matters before it is compressed.
 *
 * The crop area is reported in pixels of the oriented image, which is exactly
 * what `cropImage` in utils/imageUtils expects — see the note there about EXIF.
 *
 * Cropping stays optional: "use the whole photo" resolves with no area, so the
 * original framing survives and nobody is forced through this step.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {string} props.imageSrc - object URL or data URL of the selected file
 * @param {number} [props.aspect] - fixed ratio; omit for a free-form crop
 * @param {(area: {x,y,width,height}|null) => void} props.onConfirm
 * @param {() => void} props.onCancel
 */
export default function ImageCropModal({ isOpen, imageSrc, aspect, onConfirm, onCancel, title }) {
    const { t } = useTranslation();
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [areaPixels, setAreaPixels] = useState(null);

    const handleCropComplete = useCallback((_area, croppedAreaPixels) => {
        setAreaPixels(croppedAreaPixels);
    }, []);

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onCancel} title={title || t('imageCrop.title')} size="lg">
            <div className="space-y-4">
                <p className="text-sm text-grey-medium">{t('imageCrop.description')}</p>

                {/* The cropper measures its container, so it needs a real height. */}
                <div className="relative h-[52vh] min-h-[260px] w-full overflow-hidden rounded-lg bg-brand-navy">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={handleCropComplete}
                        restrictPosition={false}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <ZoomIn className="shrink-0 text-grey-medium" fontSize="small" aria-hidden="true" />
                    <input
                        type="range"
                        min={1}
                        max={4}
                        step={0.05}
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        aria-label={t('imageCrop.zoom')}
                        className="h-11 w-full accent-brand-navy"
                    />
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <Button type="button" variant="outline" onClick={() => onConfirm(null)}>
                        {t('imageCrop.useWholePhoto')}
                    </Button>
                    <Button type="button" onClick={() => onConfirm(areaPixels)}>
                        <Crop className="mr-2" fontSize="small" />
                        {t('imageCrop.confirm')}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
