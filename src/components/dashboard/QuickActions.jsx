import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { useNavigate } from 'react-router-dom';
import { Chat, AddAPhoto, History } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export default function QuickActions() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <Card className="h-full">
            <Card.Body>
                <Card.Title className="mb-4">{t('dashboard.quickActions')}</Card.Title>
                <div className="space-y-3">
                    <Button
                        variant="primary"
                        className="w-full justify-start"
                        onClick={() => navigate('/chat')}
                    >
                        <Chat className="mr-2 h-5 w-5" />
                        {t('dashboard.askJohn')}
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => navigate('/wardrobe')}
                    >
                        <AddAPhoto className="mr-2 h-5 w-5" />
                        {t('dashboard.addNewItem')}
                    </Button>
                    <Button
                        variant="text"
                        className="w-full justify-start"
                        onClick={() => navigate('/history')}
                    >
                        <History className="mr-2 h-5 w-5" />
                        {t('dashboard.viewHistory')}
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
}
