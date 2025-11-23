# John Styles - Personal Fashion Assistant

John Styles is an intelligent web application designed to help you manage your wardrobe and receive personalized fashion advice. Powered by Google's Gemini AI and integrated with Firebase, it offers a seamless experience for organizing your clothes and discovering new outfits.

## Features

- **AI Chat Assistant**: Chat with "John Styles" to get outfit recommendations and style tips.
- **Wardrobe Management**: Upload and categorize your clothing items.
- **Outfit Analysis**: Get AI-driven feedback on your outfits.
- **Virtual Fitting Room**: Visualize how different items look together.
- **Multi-language Support**: Available in English, Portuguese, and Spanish.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend/Services**: Firebase (Authentication, Firestore), Express (Proxy Server)
- **AI**: Google Gemini AI (@google/genai)
- **Integration**: N8N Webhooks

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:paulovsm/john-styles-web.git
   cd john-styles-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory based on `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your API keys and configuration values:
   - `GOOGLE_AI_API_KEY`: Your Google Gemini API key.
   - `VITE_FIREBASE_API_KEY`: Firebase API Key.
   - `VITE_FIREBASE_AUTH_DOMAIN`: Firebase Auth Domain.
   - `VITE_FIREBASE_PROJECT_ID`: Firebase Project ID.
   - `VITE_N8N_WEBHOOK_URL`: Webhook URL for the N8N agent.

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev`: Starts the frontend and backend proxy concurrently.
- `npm run build`: Builds the application for production.
- `npm run lint`: Runs ESLint.
- `npm run preview`: Previews the production build.

## License

[MIT](LICENSE)
