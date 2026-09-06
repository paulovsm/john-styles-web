import React, { createContext, useContext, useEffect } from 'react';
import { getCurrentExperience } from './experience';

const ExperienceContext = createContext(getCurrentExperience());

export function useExperience() {
    return useContext(ExperienceContext);
}

export function ExperienceProvider({ children }) {
    const experience = getCurrentExperience();

    useEffect(() => {
        const root = document.documentElement;
        const previousExperience = root.dataset.experience;
        let robots = document.head.querySelector('meta[name="robots"]');
        const previousRobots = robots?.getAttribute('content') || null;

        root.dataset.experience = experience.id;

        if (experience.isUniversal) {
            if (!robots) {
                robots = document.createElement('meta');
                robots.setAttribute('name', 'robots');
                document.head.appendChild(robots);
            }
            robots.setAttribute('content', 'noindex, nofollow');
        }

        return () => {
            if (previousExperience) root.dataset.experience = previousExperience;
            else delete root.dataset.experience;

            if (previousRobots) robots?.setAttribute('content', previousRobots);
            else robots?.remove();
        };
    }, [experience.id, experience.isUniversal]);

    return (
        <ExperienceContext.Provider value={experience}>
            {children}
        </ExperienceContext.Provider>
    );
}

