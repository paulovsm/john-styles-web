import React, { useMemo } from 'react';
import { ShoppingBag, CheckCircle } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useWardrobeContext } from '../../contexts/WardrobeContext';
import { useUserProfileContext } from '../../contexts/UserProfileContext';
import { computeWardrobeInsights, shoppingSearchUrl } from '../../utils/wardrobeInsights';

/**
 * Wardrobe insights, rendered as a SUB-SECTION inside the "Resumo do
 * Guarda-roupa" card (not its own card). The heading is intentionally smaller
 * and styled differently from the card title, since it's a sub-topic.
 */
export default function InsightsCard() {
    const { allItems } = useWardrobeContext();
    const { profile } = useUserProfileContext();
    const { t } = useTranslation();

    const insights = useMemo(
        () => computeWardrobeInsights(allItems, profile),
        [allItems, profile]
    );

    if (insights.counts.total === 0) return null; // nothing to analyze yet

    return (
        <div className="mt-6 pt-5 border-t border-grey-light">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-grey-medium">
                {t('insights.title', 'Insights do guarda-roupa')}
            </h3>

            {/* Coverage */}
            <div className="mb-4">
                <div className="flex justify-between text-xs text-grey-medium mb-1">
                    <span>{t('insights.coverage', 'Cobertura do essencial')}</span>
                    <span>{insights.coverage}%</span>
                </div>
                <div className="h-2 bg-grey-light rounded-full overflow-hidden">
                    <div className="h-full bg-brand-navy transition-all" style={{ width: `${insights.coverage}%` }} />
                </div>
            </div>

            {insights.gaps.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-status-success-content">
                    <CheckCircle fontSize="small" />
                    {t('insights.complete', 'Seu guarda-roupa cobre o essencial. Boa!')}
                </div>
            ) : (
                <div className="space-y-3">
                    <p className="text-sm font-medium text-brand-navy">{t('insights.shopTitle', 'Complete seu guarda-roupa')}</p>
                    <ul className="space-y-2">
                        {insights.suggestions.map((s) => {
                            const noun = t(`insights.shopNoun.${s.category}`);
                            const color = s.color ? ` ${s.color}` : '';
                            const query = `${noun}${color} masculino`.trim();
                            return (
                                <li key={s.category} className="flex items-center justify-between gap-3">
                                    <span className="text-sm text-grey-dark">
                                        {s.severity === 'missing'
                                            ? t('insights.gapMissing', { item: t(`insights.categories.${s.category}`) })
                                            : t('insights.gapThin', { item: t(`insights.categories.${s.category}`) })}
                                    </span>
                                    <a
                                        href={shoppingSearchUrl(query)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="shrink-0 inline-flex min-h-11 items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-full bg-brand-navy text-white-pure hover:bg-opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2"
                                    >
                                        <ShoppingBag style={{ fontSize: 14 }} />
                                        {t('insights.shop', 'Buscar')}
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                    <p className="text-[11px] text-grey-medium">{t('insights.shopDisclaimer', 'Abre uma busca de compras em nova aba.')}</p>
                </div>
            )}
        </div>
    );
}
