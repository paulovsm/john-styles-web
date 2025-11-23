import React, { createContext, useContext, useState, useEffect } from 'react';
import { useChatHistory } from '../hooks/useChatHistory';
import { n8nService } from '../services/api/n8nService';
import { storageService } from '../services/storage/hybridStorageService';
import { useAuth } from './AuthContext';

const ConversationContext = createContext();

export function useConversationContext() {
    return useContext(ConversationContext);
}

export function ConversationProvider({ children }) {
    const { history, addMessage, clearHistory } = useChatHistory();
    const { currentUser } = useAuth();
    const [isTyping, setIsTyping] = useState(false);
    const [agentState, setAgentState] = useState('idle'); // idle, analyzing, trending, recommending

    // Persistent State
    const [userProfile, setUserProfile] = useState(null);
    const [wardrobeItems, setWardrobeItems] = useState([]);
    const [trends, setTrends] = useState([]);
    const [recommendations, setRecommendations] = useState(null);

    // Load from localStorage on mount
    useEffect(() => {
        const storedProfile = storageService.getUserProfile();
        if (storedProfile && Object.keys(storedProfile).length > 0) setUserProfile(storedProfile);

        const storedWardrobe = storageService.getWardrobe();
        if (storedWardrobe && storedWardrobe.length > 0) setWardrobeItems(storedWardrobe);
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        if (userProfile) storageService.saveUserProfile(userProfile);
    }, [userProfile]);

    useEffect(() => {
        if (wardrobeItems.length > 0) storageService.saveWardrobe(wardrobeItems);
    }, [wardrobeItems]);

    const processMessage = async (text) => {
        setIsTyping(true);
        setAgentState('processing'); // Generic state as n8n handles the rest

        try {
            // 1. Add user message to history
            addMessage({ role: 'user', content: text });

            // 2. Call n8n Webhook
            const responseText = await n8nService.sendMessage(text, {
                userId: currentUser?.uid,
                userProfile,
                wardrobeItems,
                chatHistory: history
            });

            // 3. Add Agent Response
            addMessage({ role: 'model', content: responseText });

            // Note: In this new architecture, n8n manages the logic.
            // If n8n returns structured data (e.g. updated profile), we should handle it here.
            // For now, we assume text response.

        } catch (error) {
            console.error("Error processing message:", error);
            addMessage({ role: 'model', content: "Desculpe, estou com dificuldades para conectar ao meu cérebro agora." });
        } finally {
            setIsTyping(false);
            setAgentState('idle');
        }
    };

    const value = {
        history,
        addMessage, // Keep for manual additions if needed
        processMessage, // New main entry point
        clearHistory,
        isTyping,
        agentState,
        userProfile,
        wardrobeItems,
        trends,
        recommendations
    };

    return (
        <ConversationContext.Provider value={value}>
            {children}
        </ConversationContext.Provider>
    );
}
