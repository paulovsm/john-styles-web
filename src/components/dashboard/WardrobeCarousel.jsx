import React from 'react';
import Card from '../common/Card';
import { Link } from 'react-router-dom';
import { Checkroom, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useWardrobeContext } from '../../contexts/WardrobeContext';
import { mapSubcategory } from '../../utils/categoryMapper';
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
        const sub = item.category === 'tops' ? (item.subcategory || mapSubcategory(item.name)) : null;
        return sub
            ? t(`wardrobe.filters.subcategories.${sub}`)
            : t(`wardrobe.filters.categories.${item.category}`, item.category);
    };

    return (
        <Card>
            <Card.Body>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <div className="bg-brand-navy/10 p-2 rounded-full mr-3">
                            <Checkroom className="text-brand-navy" />
                        </div>
                        <Card.Title className="whitespace-nowrap">{t('wardrobe.title', 'Meu Guarda-roupa')}</Card.Title>
                    </div>
                    {allItems.length > 0 && (
                        <Link to="/wardrobe" className="text-sm font-medium text-brand-navy hover:opacity-80">
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
                            className="flex gap-4 overflow-x-auto snap-x scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                                    <p className="mt-2 text-sm font-medium text-brand-navy truncate" title={item.name}>{item.name}</p>
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
                                    className="absolute left-1 top-[38%] -translate-y-1/2 h-9 w-9 grid place-items-center rounded-full bg-white-pure/90 border border-grey-light shadow-sm hover:bg-white-pure"
                                >
                                    <ChevronLeft fontSize="small" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => scrollByDir(1)}
                                    aria-label={t('common.next', 'Próximo')}
                                    className="absolute right-1 top-[38%] -translate-y-1/2 h-9 w-9 grid place-items-center rounded-full bg-white-pure/90 border border-grey-light shadow-sm hover:bg-white-pure"
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
