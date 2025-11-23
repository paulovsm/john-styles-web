import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import ChatInterface from '../components/chat/ChatInterface';

export default function ChatPage() {
    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto">
                <ChatInterface />
            </div>
        </MainLayout>
    );
}
