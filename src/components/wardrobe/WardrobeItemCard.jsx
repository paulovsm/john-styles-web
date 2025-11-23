import React from 'react';
import Card from '../common/Card';
import { Delete } from '@mui/icons-material';

export default function WardrobeItemCard({ item, onDelete, onClick }) {
    return (
        <Card hoverable onClick={() => onClick && onClick(item)} className="relative group">
            <Card.Image src={item.image} alt={item.name} className="h-48" />
            <Card.Body>
                <Card.Title className="truncate">{item.name}</Card.Title>
                <Card.Subtitle className="capitalize">{item.category}</Card.Subtitle>
                <div className="mt-2 flex flex-wrap gap-1">
                    {item.colors && item.colors.map((color, index) => (
                        <span key={index} className="inline-block w-3 h-3 rounded-full border border-grey-light" style={{ backgroundColor: color }} title={color}></span>
                    ))}
                </div>
            </Card.Body>
            {onDelete && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                    }}
                    className="absolute top-2 right-2 p-1 bg-white-pure rounded-full shadow-sm text-grey-medium hover:text-status-error opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Item"
                >
                    <Delete fontSize="small" />
                </button>
            )}
        </Card>
    );
}
