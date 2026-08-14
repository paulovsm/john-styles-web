import React, { useMemo, useRef } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { useNavigate } from 'react-router-dom';
import { AutoAwesome, Checkroom, Thermostat, CalendarMonth, Event, ChevronLeft, ChevronRight } from '@mui/icons-material';
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

    // Flag a weak recommendation so the card is honest about it (P1 #4): an
    // incomplete outfit (missing a core category) or a very thin wardrobe.
    const thinLook = outfit.length > 0 && (outfit.length < 3 || allItems.length < 6);

    const scroller = useRef(null);
    const scrollByDir = (dir) => {
        const el = scroller.current;
        if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
    };

    const tryOn = () => navigate('/try-on', { state: { preselect: outfit.map((i) => i.id) } });

    const connectCalendar = async () => {
        try { await calendarService.connect(); } catch { /* surfaced by redirect */ }
    };

    return (
        <Card className="h-full">
            <Card.Body>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center min-w-0">
                        <div className="bg-brand-gold/15 p-2 rounded-full mr-3">
                            <AutoAwesome className="text-brand-gold-dark" />
                        </div>
                        <Card.Title className="truncate">{t('dashboard.outfitOfDay', 'Look do dia')}</Card.Title>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
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
                {dailyContext?.status === 'ready' && !dailyContext.connected && dailyContext.reason !== 'not_configured' && (
                    <button
                        type="button"
                        onClick={connectCalendar}
                        className="mb-3 flex items-start gap-1.5 text-left text-xs text-brand-gold-dark hover:underline"
                    >
                        <CalendarMonth style={{ fontSize: 16 }} className="shrink-0 mt-0.5" />
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
                        <div className="relative">
                            <div ref={scroller} className="flex gap-3 overflow-x-auto snap-x scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                {outfit.map((item) => (
                                    <div key={item.id} className="snap-start shrink-0 w-[46%] sm:w-48 text-center">
                                        <div className="aspect-[3/4] rounded-md overflow-hidden bg-grey-light">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" style={{ imageOrientation: 'from-image' }} />
                                        </div>
                                        <p className="mt-1 text-xs text-grey-dark truncate" title={item.name}>{item.name}</p>
                                    </div>
                                ))}
                            </div>
                            {outfit.length > 3 && (
                                <>
                                    <button type="button" onClick={() => scrollByDir(-1)} aria-label={t('common.previous', 'Anterior')} className="absolute left-1 top-[42%] -translate-y-1/2 h-8 w-8 grid place-items-center rounded-full bg-white-pure/90 border border-grey-light shadow-sm hover:bg-white-pure"><ChevronLeft fontSize="small" /></button>
                                    <button type="button" onClick={() => scrollByDir(1)} aria-label={t('common.next', 'Próximo')} className="absolute right-1 top-[42%] -translate-y-1/2 h-8 w-8 grid place-items-center rounded-full bg-white-pure/90 border border-grey-light shadow-sm hover:bg-white-pure"><ChevronRight fontSize="small" /></button>
                                </>
                            )}
                        </div>
                        {thinLook && (
                            <p className="mt-3 text-[11px] text-grey-medium">
                                {t('dashboard.outfitThin', 'Guarda-roupa enxuto — adicione peças para recomendações melhores.')}
                            </p>
                        )}
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
