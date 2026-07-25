import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { firestoreService } from '../../services/storage/firestoreService';

/**
 * Small read-only indicator of the user's remaining daily usage for a feature.
 * Enforcement is server-side; this only displays what the server has recorded.
 *
 * @param {'wardrobeAnalysis'|'lookGeneration'|'chat'} limitType
 * @param {number} [refreshKey] - change this to force a re-fetch (e.g. after an action)
 */
export default function UsageCounter({ limitType, refreshKey = 0, className = '' }) {
    const { t } = useTranslation();
    const [usage, setUsage] = useState(null);

    useEffect(() => {
        let active = true;
        firestoreService.getUsage(limitType).then((u) => {
            if (active) setUsage(u);
        });
        return () => { active = false; };
    }, [limitType, refreshKey]);

    if (!usage) return null;

    const low = usage.remaining <= 1;
    return (
        <p className={`text-xs ${low ? 'text-status-warning' : 'text-grey-medium'} ${className}`}>
            {t('usage.remaining', '{{remaining}} de {{limit}} restantes hoje', {
                remaining: usage.remaining,
                limit: usage.limit,
            })}
        </p>
    );
}
