import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import Loading from '../components/common/Loading';
import { firestoreService } from '../services/storage/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Collections, CalendarToday, Style } from '@mui/icons-material';

export default function GalleryPage() {
    const { currentUser } = useAuth();
    const { t } = useTranslation();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadGallery() {
            if (currentUser) {
                try {
                    const galleryItems = await firestoreService.getGalleryItems(currentUser.uid);
                    setItems(galleryItems);
                } catch (error) {
                    console.error('Error loading gallery:', error);
                } finally {
                    setLoading(false);
                }
            }
        }

        loadGallery();
    }, [currentUser]);

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <MainLayout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-serif font-bold text-fleek-navy">{t('gallery.title', 'Galeria de Looks')}</h1>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loading type="spinner" size={40} />
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-12 bg-white-pure rounded-lg border border-grey-light">
                    <Collections className="h-16 w-16 mx-auto mb-4 text-grey-light" />
                    <h3 className="text-lg font-medium text-fleek-navy mb-2">{t('gallery.emptyTitle', 'Sua galeria está vazia')}</h3>
                    <p className="text-grey-medium">{t('gallery.emptyDescription', 'Gere looks no Provador Virtual e salve-os aqui.')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <div key={item.id} className="bg-white-pure rounded-lg shadow-sm border border-grey-light overflow-hidden hover:shadow-md transition-shadow">
                            <div className="relative aspect-[3/4] bg-grey-light">
                                <img
                                    src={item.imageUrl}
                                    alt="Saved Look"
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            </div>
                            <div className="p-4">
                                <div className="flex items-center text-xs text-grey-medium mb-2">
                                    <CalendarToday className="h-3 w-3 mr-1" />
                                    <span>{formatDate(item.createdAt)}</span>
                                </div>
                                {item.prompt && (
                                    <div className="mt-2 text-sm text-grey-dark line-clamp-2" title={item.prompt}>
                                        <span className="font-medium text-fleek-navy mr-1"><Style className="h-3 w-3 inline mr-1" />Prompt:</span>
                                        {item.prompt}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </MainLayout>
    );
}
