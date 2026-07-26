import React, { useMemo } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { useNavigate } from 'react-router-dom';
import { AutoAwesome, Checkroom } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useWardrobeContext } from '../../contexts/WardrobeContext';
import { pickOutfitOfTheDay } from '../../utils/outfitOfTheDay';

export default function OutfitOfTheDay() {
    const { allItems } = useWardrobeContext();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const outfit = useMemo(() => pickOutfitOfTheDay(allItems), [allItems]);

    const tryOn = () => {
        navigate('/try-on', { state: { preselect: outfit.map((i) => i.id) } });
    };

    return (
        <Card className="h-full">
            <Card.Body>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <div className="bg-brand-gold/15 p-2 rounded-full mr-3">
                            <AutoAwesome className="text-brand-gold-dark" />
                        </div>
                        <Card.Title>{t('dashboard.outfitOfDay', 'Look do dia')}</Card.Title>
                    </div>
                    {outfit.length > 0 && (
                        <Button variant="primary" className="text-sm" onClick={tryOn}>
                            <AutoAwesome className="mr-2 h-4 w-4" />
                            {t('dashboard.tryOutfit', 'Provar')}
                        </Button>
                    )}
                </div>

                {outfit.length === 0 ? (
                    <div className="text-center py-8">
                        <Checkroom className="h-10 w-10 mx-auto mb-2 text-grey-light" />
                        <p className="text-sm text-grey-medium">
                            {t('dashboard.outfitEmpty', 'Adicione peças ao guarda-roupa para receber sugestões de look.')}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-3">
                        {outfit.map((item) => (
                            <div key={item.id} className="text-center">
                                <div className="aspect-square rounded-md overflow-hidden bg-grey-light">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <p className="mt-1 text-xs text-grey-dark truncate" title={item.name}>{item.name}</p>
                            </div>
                        ))}
                    </div>
                )}
            </Card.Body>
        </Card>
    );
}
