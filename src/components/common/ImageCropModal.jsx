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
 * react-easy-crop has no free-form mode — it falls back to 4:3 when no ratio is
 * given, which silently forced landscape on the phone photos this is mostly fed.
 * The ratio is picked here instead, defaulting to portrait.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {string} props.imageSrc - object URL or data URL of the selected file
 * @param {number} [props.aspect] - starting ratio; the user can switch
 * @param {(area: {x,y,width,height}|null) => void} props.onConfirm
 * @param {() => void} props.onCancel
 */
const RATIOS = [
    { id: 'portrait', value: 3 / 4, labelKey: 'imageCrop.ratioPortrait' },
    { id: 'square', value: 1, labelKey: 'imageCrop.ratioSquare' },
    { id: 'landscape', value: 4 / 3, labelKey: 'imageCrop.ratioLandscape' },
];

export default function ImageCropModal({ isOpen, imageSrc, aspect = 3 / 4, onConfirm, onCancel, title }) {
    const { t } = useTranslation();
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [areaPixels, setAreaPixels] = useState(null);
    const [ratio, setRatio] = useState(aspect);

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
                        aspect={ratio}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={handleCropComplete}
                        restrictPosition={false}
                    />
                </div>

                <fieldset className="flex flex-wrap items-center gap-2">
                    <legend className="sr-only">{t('imageCrop.ratioLabel')}</legend>
                    <span className="text-sm text-grey-medium">{t('imageCrop.ratioLabel')}:</span>
                    {RATIOS.map(({ id, value, labelKey }) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => setRatio(value)}
                            aria-pressed={ratio === value}
                            className={`min-h-11 rounded-md border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy ${
                                ratio === value
                                    ? 'border-brand-navy bg-brand-navy text-white-pure'
                                    : 'border-control-border text-grey-dark hover:border-brand-navy'
                            }`}
                        >
                            {t(labelKey)}
                        </button>
                    ))}
                </fieldset>

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
