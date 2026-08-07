import React, { useEffect, useState } from 'react';
import Card from '../common/Card';
import { Link } from 'react-router-dom';
import { Collections } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { firestoreService } from '../../services/storage/firestoreService';

export default function RecentLooks() {
    const { currentUser } = useAuth();
    const { t } = useTranslation();
    const [looks, setLooks] = useState(null); // null = loading

    useEffect(() => {
        let active = true;
        if (!currentUser) return;
        firestoreService.getGalleryItems(currentUser.uid).then((items) => {
            if (active) setLooks(Array.isArray(items) ? items.slice(0, 4) : []);
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
                    <div className="grid grid-cols-4 gap-3">
                        {[0, 1, 2, 3].map((i) => (
                            <div key={i} className="aspect-[3/4] rounded-md bg-grey-light animate-pulse" />
                        ))}
                    </div>
                ) : looks.length === 0 ? (
                    <p className="text-sm text-grey-medium py-4">
                        {t('dashboard.noLooks', 'Você ainda não salvou nenhum look. Experimente no Provador Virtual.')}
                    </p>
                ) : (
                    <div className="grid grid-cols-4 gap-3">
                        {looks.map((look) => (
                            <Link key={look.id} to="/gallery" className="block aspect-[3/4] rounded-md overflow-hidden bg-grey-light">
                                <img src={look.imageUrl} alt={t('dashboard.recentLooks', 'Looks recentes')} className="w-full h-full object-cover hover:opacity-90" loading="lazy" style={{ imageOrientation: 'from-image' }} />
                            </Link>
                        ))}
                    </div>
                )}
            </Card.Body>
        </Card>
    );
}
