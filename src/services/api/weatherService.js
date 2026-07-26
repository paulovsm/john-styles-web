/**
 * Minimal weather lookup via Open-Meteo (free, no API key, CORS-enabled).
 * Used to make the daily outfit suggestion weather-aware.
 */
export const weatherService = {
    async getCurrent(lat, lon) {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Weather request failed');
        const data = await res.json();
        return {
            tempC: Math.round(data.current?.temperature_2m),
            code: data.current?.weather_code,
        };
    },
};

/**
 * Maps an Open-Meteo WMO weather code to a coarse condition key for i18n/icons.
 */
export function weatherCondition(code) {
    if (code === 0) return 'clear';
    if (code >= 1 && code <= 3) return 'cloudy';
    if (code >= 45 && code <= 48) return 'fog';
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
    if (code >= 71 && code <= 77) return 'snow';
    if (code >= 95) return 'storm';
    return 'cloudy';
}
