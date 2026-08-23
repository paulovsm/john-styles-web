import React from 'react';
import Card from '../common/Card';
import { Delete } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { colorToHex } from '../../utils/colorMap';
import { resolveGarmentType } from '../../utils/garmentTaxonomy';
import { getWardrobeThumbnailUrl } from '../../utils/imageUtils';

export default function WardrobeItemCard({ item, onDelete, onClick }) {
    const { t } = useTranslation();

    const type = resolveGarmentType(item);
    const typeLabel = type
        ? t(`wardrobe.types.${type}`)
        : t('wardrobe.types.unclassified');

    return (
        <Card hoverable onClick={() => onClick && onClick(item)} className="relative group">
            <Card.Image src={getWardrobeThumbnailUrl(item)} alt={item.name} className="h-48" />
            {item.demo && (
                <span className="absolute top-2 left-2 text-[10px] font-medium px-2 py-0.5 rounded-full bg-brand-gold/90 text-white-pure shadow-sm">
                    {t('wardrobe.sampleBadge', 'Exemplo')}
                </span>
            )}
            <Card.Body>
                <Card.Title as="h2" className="break-words lg:truncate">{item.name}</Card.Title>
                <Card.Subtitle>{typeLabel}</Card.Subtitle>
                <div className="mt-2 flex flex-wrap gap-1">
                    {item.colors && item.colors.map((color, index) => {
                        const hex = colorToHex(color);
                        // Render a swatch only when we can resolve the color; otherwise
                        // show the name as a small chip so info isn't lost.
                        return hex ? (
                            <span
                                key={index}
                                className="inline-block w-3 h-3 rounded-full border border-grey-light"
                                style={{ backgroundColor: hex }}
                                title={color}
                            />
                        ) : (
                            <span key={index} className="text-[10px] leading-4 px-1.5 rounded-full bg-grey-light text-grey-dark">
                                {color}
                            </span>
                        );
                    })}
                </div>
            </Card.Body>
            {onDelete && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                    }}
                    className="absolute top-2 right-2 grid place-items-center h-11 w-11 bg-white-pure/90 rounded-full shadow-sm text-grey-medium hover:text-status-error-content active:text-status-error-content transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
                    aria-label={t('common.delete', 'Excluir')}
                    title={t('common.delete', 'Excluir')}
                >
                    <Delete fontSize="small" />
                </button>
            )}
        </Card>
    );
}
