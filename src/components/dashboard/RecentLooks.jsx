import React, { useEffect, useState } from 'react';
import Card from '../common/Card';
import { Link } from 'react-router-dom';
import { Collections, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { firestoreService } from '../../services/storage/firestoreService';
import { useHorizontalCarousel } from '../../hooks/useHorizontalCarousel';

export default function RecentLooks() {
    const { currentUser } = useAuth();
    const { t } = useTranslation();
    const [looks, setLooks] = useState(null); // null = loading
    const { scroller, canScroll, scrollByDir } = useHorizontalCarousel(looks?.length ?? 0);

    useEffect(() => {
        let active = true;
        if (!currentUser) return;
        // Ask for only what this card renders instead of downloading the whole
        // gallery and discarding all but the newest few.
        firestoreService.getGalleryItems(currentUser.uid, 8).then((items) => {
            if (active) setLooks(Array.isArray(items) ? items.slice(0, 8) : []);
        });
        return () => { active = false; };
    }, [currentUser]);

    return (
        <Card className="h-full">
            <Card.Body>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <div className="bg-brand-navy/10 p-2 rounded-full mr-3">
                            <Collections className="text-brand-navy" />
                        </div>
                        <Card.Title as="h2">{t('dashboard.recentLooks', 'Looks recentes')}</Card.Title>
                    </div>
                    {looks && looks.length > 0 && (
                        <Link to="/gallery" className="inline-flex min-h-11 items-center text-sm font-medium text-brand-navy hover:opacity-80">
                            {t('dashboard.viewAll', 'Ver todos')}
                        </Link>
                    )}
                </div>

                {looks === null ? (
                    <div className="flex gap-3">
                        {[0, 1].map((i) => (
                            <div key={i} className="aspect-[3/4] w-1/2 rounded-md bg-grey-light animate-pulse" />
                        ))}
                    </div>
                ) : looks.length === 0 ? (
                    <p className="text-sm text-grey-medium py-4">
                        {t('dashboard.noLooks', 'Você ainda não salvou nenhum look. Experimente no Provador Virtual.')}
                    </p>
                ) : (
                    <div className="relative">
                        <div
                            ref={scroller}
                            className="flex gap-3 overflow-x-auto overscroll-x-contain snap-x snap-mandatory scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        >
                            {looks.map((look, index) => (
                                <Link
                                    key={look.id}
                                    to="/gallery"
                                    className="snap-start shrink-0 w-[46%] sm:w-48 block aspect-[3/4] rounded-md overflow-hidden bg-grey-light"
                                >
                                    <img
                                        src={look.imageUrl}
                                        alt={t('gallery.savedLookNumber', { number: index + 1 })}
                                        className="w-full h-full object-cover hover:opacity-90"
                                        loading="lazy"
                                        style={{ imageOrientation: 'from-image' }}
                                    />
                                </Link>
                            ))}
                        </div>
                        {canScroll && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => scrollByDir(-1)}
                                    aria-label={t('common.previous', 'Anterior')}
                                    className="absolute left-1 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-control-border bg-white-pure/90 shadow-sm hover:bg-white-pure focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy lg:grid"
                                >
                                    <ChevronLeft fontSize="small" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => scrollByDir(1)}
                                    aria-label={t('common.next', 'Próximo')}
                                    className="absolute right-1 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-control-border bg-white-pure/90 shadow-sm hover:bg-white-pure focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy lg:grid"
                                >
                                    <ChevronRight fontSize="small" />
                                </button>
                            </>
                        )}
                    </div>
                )}
            </Card.Body>
        </Card>
    );
}
