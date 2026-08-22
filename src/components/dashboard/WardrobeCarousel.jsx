import React from 'react';
import Card from '../common/Card';
import { Link } from 'react-router-dom';
import { Checkroom, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useWardrobeContext } from '../../contexts/WardrobeContext';
import { resolveGarmentType } from '../../utils/garmentTaxonomy';
import { useHorizontalCarousel } from '../../hooks/useHorizontalCarousel';

/**
 * Full-width strip of the user's wardrobe photos on the dashboard. Horizontal
 * scroll-snap carousel with arrows, so it stays compact regardless of how many
 * pieces the closet holds.
 */
export default function WardrobeCarousel() {
    const { allItems } = useWardrobeContext();
    const { t } = useTranslation();
    const { scroller, canScroll, scrollByDir } = useHorizontalCarousel(allItems.length);

    const typeLabel = (item) => {
        const type = resolveGarmentType(item);
        return type ? t(`wardrobe.types.${type}`) : t('wardrobe.types.unclassified');
    };

    return (
        <Card>
            <Card.Body>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <div className="bg-brand-navy/10 p-2 rounded-full mr-3">
                            <Checkroom className="text-brand-navy" />
                        </div>
                        <Card.Title as="h2" className="whitespace-nowrap">{t('wardrobe.title', 'Meu Guarda-roupa')}</Card.Title>
                    </div>
                    {allItems.length > 0 && (
                        <Link to="/wardrobe" className="inline-flex min-h-11 items-center text-sm font-medium text-brand-navy hover:opacity-80">
                            {t('dashboard.viewAll', 'Ver todos')}
                        </Link>
                    )}
                </div>

                {allItems.length === 0 ? (
                    <p className="text-sm text-grey-medium py-4">
                        {t('dashboard.emptyWardrobe', 'Seu guarda-roupa está vazio. Adicione peças para começar.')}
                    </p>
                ) : (
                    <div className="relative">
                        <div
                            ref={scroller}
                            className="flex gap-4 overflow-x-auto overscroll-x-contain snap-x scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        >
                            {allItems.map((item) => (
                                <Link key={item.id} to="/wardrobe" className="snap-start shrink-0 w-40">
                                    <div className="aspect-[3/4] rounded-card overflow-hidden bg-grey-light border border-grey-light">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                            style={{ imageOrientation: 'from-image' }}
                                        />
                                    </div>
                                    <p className="mt-2 break-words text-sm font-medium text-brand-navy lg:truncate" title={item.name}>{item.name}</p>
                                    <p className="text-xs text-grey-medium">{typeLabel(item)}</p>
                                </Link>
                            ))}
                        </div>
                        {canScroll && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => scrollByDir(-1)}
                                    aria-label={t('common.previous', 'Anterior')}
                                    className="absolute left-1 top-[38%] hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-control-border bg-white-pure/90 shadow-sm hover:bg-white-pure focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy lg:grid"
                                >
                                    <ChevronLeft fontSize="small" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => scrollByDir(1)}
                                    aria-label={t('common.next', 'Próximo')}
                                    className="absolute right-1 top-[38%] hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-control-border bg-white-pure/90 shadow-sm hover:bg-white-pure focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy lg:grid"
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
