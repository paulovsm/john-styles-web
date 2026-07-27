import React, { useMemo } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { useNavigate } from 'react-router-dom';
import { AutoAwesome, Checkroom, Thermostat, CalendarMonth, Event } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useWardrobeContext } from '../../contexts/WardrobeContext';
import { pickOutfitOfTheDay } from '../../utils/outfitOfTheDay';
import { preferStylesForFormality } from '../../hooks/useDailyContext';
import { calendarService } from '../../services/api/calendarService';

export default function OutfitOfTheDay({ weather, dailyContext }) {
    const { allItems } = useWardrobeContext();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const cold = weather?.status === 'ready' && weather.cold;
    const calendarConnected = dailyContext?.connected;
    const formality = dailyContext?.formality;

    const outfit = useMemo(() => {
        const preferStyles = calendarConnected ? preferStylesForFormality(formality) : [];
        return pickOutfitOfTheDay(allItems, undefined, { cold, preferStyles });
    }, [allItems, cold, calendarConnected, formality]);

    const tryOn = () => navigate('/try-on', { state: { preselect: outfit.map((i) => i.id) } });

    const connectCalendar = async () => {
        try { await calendarService.connect(); } catch { /* surfaced by redirect */ }
    };

    return (
        <Card className="h-full">
            <Card.Body>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                        <div className="bg-brand-gold/15 p-2 rounded-full mr-3">
                            <AutoAwesome className="text-brand-gold-dark" />
                        </div>
                        <Card.Title>{t('dashboard.outfitOfDay', 'Look do dia')}</Card.Title>
                    </div>
                    <div className="flex items-center gap-3">
                        {weather?.status === 'ready' && (
                            <span className="inline-flex items-center gap-1 text-sm text-grey-medium">
                                <Thermostat fontSize="small" />
                                {weather.tempC}°C
                            </span>
                        )}
                        {outfit.length > 0 && (
                            <Button variant="primary" className="text-sm" onClick={tryOn}>
                                <AutoAwesome className="mr-2 h-4 w-4" />
                                {t('dashboard.tryOutfit', 'Provar')}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Calendar-derived context: headline, or a connect CTA */}
                {dailyContext?.connected && dailyContext.headline && (
                    <div className="mb-3 flex items-start gap-2 text-sm text-brand-navy bg-brand-navy/5 rounded-lg px-3 py-2">
                        <Event style={{ fontSize: 18 }} className="mt-0.5 shrink-0 text-brand-gold-dark" />
                        <span>{dailyContext.headline}</span>
                    </div>
                )}
                {dailyContext?.status === 'ready' && !dailyContext.connected && (
                    <button
                        type="button"
                        onClick={connectCalendar}
                        className="mb-3 inline-flex items-center gap-1.5 text-xs text-brand-gold-dark hover:underline"
                    >
                        <CalendarMonth style={{ fontSize: 16 }} />
                        {t('dashboard.connectCalendar', 'Conectar Google Agenda para sugestões pelo seu dia')}
                    </button>
                )}

                {outfit.length === 0 ? (
                    <div className="text-center py-8">
                        <Checkroom className="h-10 w-10 mx-auto mb-2 text-grey-light" />
                        <p className="text-sm text-grey-medium">
                            {t('dashboard.outfitEmpty', 'Adicione peças ao guarda-roupa para receber sugestões de look.')}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className={`grid gap-3 ${outfit.length === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
                            {outfit.map((item) => (
                                <div key={item.id} className="text-center">
                                    <div className="aspect-square rounded-md overflow-hidden bg-grey-light">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <p className="mt-1 text-xs text-grey-dark truncate" title={item.name}>{item.name}</p>
                                </div>
                            ))}
                        </div>
                        {cold && (
                            <p className="mt-3 text-xs text-brand-gold-dark">
                                {t('dashboard.weatherColdTip', 'Está frio — incluímos uma peça de agasalho no look.')}
                            </p>
                        )}
                    </>
                )}
            </Card.Body>
        </Card>
    );
}
