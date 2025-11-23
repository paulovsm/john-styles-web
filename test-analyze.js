// import fetch from 'node-fetch'; // Not needed in Node 18+
import fs from 'fs';

async function testAnalyze() {
    try {
        // Create a simple 1x1 pixel base64 image
        const base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

        const response = await fetch('http://localhost:3000/api/gemini-image-analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: base64Image, language: 'pt' }),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`API Error: ${response.status} - ${text}`);
        }

        const data = await response.json();
        console.log("API Response:", JSON.stringify(data, null, 2));

        if (data.name && data.category && data.color && data.style) {
            console.log("SUCCESS: Response contains expected fields.");
        } else {
            console.error("FAILURE: Response missing expected fields.");
            process.exit(1);
        }

    } catch (error) {
        console.error("Test Failed:", error);
        process.exit(1);
    }
}

testAnalyze();
