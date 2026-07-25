import React from 'react';
import Card from '../common/Card';
import { Delete } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { colorToHex } from '../../utils/colorMap';

export default function WardrobeItemCard({ item, onDelete, onClick }) {
    const { t } = useTranslation();

    return (
        <Card hoverable onClick={() => onClick && onClick(item)} className="relative group">
            <Card.Image src={item.image} alt={item.name} className="h-48" />
            <Card.Body>
                <Card.Title className="truncate">{item.name}</Card.Title>
                <Card.Subtitle className="capitalize">{item.category}</Card.Subtitle>
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
                    className="absolute top-2 right-2 p-1 bg-white-pure rounded-full shadow-sm text-grey-medium hover:text-status-error opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={t('common.delete', 'Excluir')}
                    title={t('common.delete', 'Excluir')}
                >
                    <Delete fontSize="small" />
                </button>
            )}
        </Card>
    );
}
