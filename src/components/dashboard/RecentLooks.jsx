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
        firestoreService.getGalleryItems(currentUser.uid).then((items) => {
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
                        <Card.Title>{t('dashboard.recentLooks', 'Looks recentes')}</Card.Title>
                    </div>
                    {looks && looks.length > 0 && (
                        <Link to="/gallery" className="text-sm font-medium text-brand-navy hover:opacity-80">
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
                            className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        >
                            {looks.map((look) => (
                                <Link
                                    key={look.id}
                                    to="/gallery"
                                    className="snap-start shrink-0 w-[46%] sm:w-48 block aspect-[3/4] rounded-md overflow-hidden bg-grey-light"
                                >
                                    <img
                                        src={look.imageUrl}
                                        alt={t('dashboard.recentLooks', 'Looks recentes')}
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
                                    className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-full bg-white-pure/90 border border-grey-light shadow-sm hover:bg-white-pure"
                                >
                                    <ChevronLeft fontSize="small" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => scrollByDir(1)}
                                    aria-label={t('common.next', 'Próximo')}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-full bg-white-pure/90 border border-grey-light shadow-sm hover:bg-white-pure"
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
