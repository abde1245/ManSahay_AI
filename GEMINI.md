# Project Overview

This project, "mansahay-ai," is a web-based mental health AI assistant. It provides a safe and supportive space for users to chat about their feelings and receive real-time analysis of their mental state. The application uses the Gemini API to power its conversational AI and includes features like real-time risk analysis, coping activity suggestions, and the ability to find and book appointments with mental health professionals.

The frontend is built with React and TypeScript, using Vite as a build tool. The UI is designed to be empathetic and user-friendly, with a dashboard that provides live analysis of the user's mood and risk level.

## Building and Running

### Prerequisites

*   Node.js and npm (or yarn)
*   A Gemini API key

### Installation

1.  Clone the repository.
2.  Install the dependencies:

    ```bash
    npm install
    ```

### Running the Development Server

1.  Create a `.env` file in the root of the project and add your Gemini API key:

    ```
    GEMINI_API_KEY=your_api_key
    ```

2.  Start the development server:

    ```bash
    npm run dev
    ```

    The application will be available at `http://localhost:3000`.

### Building for Production

To create a production build, run:

```bash
npm run build
```

The production files will be located in the `dist` directory. To preview the production build, run:

```bash
npm run preview
```

## Development Conventions

*   **Technology Stack:** React, TypeScript, Vite, Tailwind CSS.
*   **Code Style:** The code follows standard React and TypeScript conventions.
*   **Component-Based Architecture:** The UI is built with a clear component-based architecture, with components located in the `src/components` directory.
*   **State Management:** The application uses React hooks for state management. The main application state is managed in the `App.tsx` component.
*   **Services:** The application interacts with the Gemini API through a dedicated `geminiService.ts` file located in the `src/services` directory.
*   **Security:** The Gemini API key is exposed on the client-side in `vite.config.ts`, which is a security risk. This should be addressed by moving the API key to a backend service.

## Key Files

*   `App.tsx`: The root component of the application. It manages the chat state, user input, and UI components.
*   `services/geminiService.ts`: The core of the application's AI functionality. It defines the tools for the Gemini model, initializes the Gemini client, and handles communication with the API.
*   `components/Dashboard.tsx`: The dashboard component that displays real-time risk analysis, a music player, and system status.
*   `types.ts`: Contains the type definitions for the application.
*   `vite.config.ts`: The Vite configuration file. It defines the development server settings, build configurations, and aliases.
*   `package.json`: The project's configuration file, which includes dependencies and scripts.
