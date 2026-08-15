import React from 'react';
import Card from '../common/Card';
import { Delete } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { colorToHex } from '../../utils/colorMap';
import { mapSubcategory } from '../../utils/categoryMapper';

export default function WardrobeItemCard({ item, onDelete, onClick }) {
    const { t } = useTranslation();

    // Show the specific garment type (Camisa / Polo / Camiseta …) rather than the
    // coarse bucket. For tops, prefer the sub-type (inferred from the name when
    // unset); otherwise fall back to the translated category.
    const sub = item.category === 'tops' ? (item.subcategory || mapSubcategory(item.name)) : null;
    const typeLabel = sub
        ? t(`wardrobe.filters.subcategories.${sub}`)
        : t(`wardrobe.filters.categories.${item.category}`, item.category);

    return (
        <Card hoverable onClick={() => onClick && onClick(item)} className="relative group">
            <Card.Image src={item.image} alt={item.name} className="h-48" />
            {item.demo && (
                <span className="absolute top-2 left-2 text-[10px] font-medium px-2 py-0.5 rounded-full bg-brand-gold/90 text-white-pure shadow-sm">
                    {t('wardrobe.sampleBadge', 'Exemplo')}
                </span>
            )}
            <Card.Body>
                <Card.Title className="truncate">{item.name}</Card.Title>
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
                    className="absolute top-2 right-2 grid place-items-center h-11 w-11 bg-white-pure/90 rounded-full shadow-sm text-grey-medium hover:text-status-error active:text-status-error transition-opacity [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
                    aria-label={t('common.delete', 'Excluir')}
                    title={t('common.delete', 'Excluir')}
                >
                    <Delete fontSize="small" />
                </button>
            )}
        </Card>
    );
}
