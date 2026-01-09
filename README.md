
# GSL Talent Finder - Candidate & Booking Management Platform

This is a [Next.js](https://nextjs.org/) application built with Firebase Studio. It serves as a platform to connect educational institutions (Clients) with qualified teaching staff (Candidates).

## Core Technologies

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **AI Integration**: [Genkit (Firebase AI)](https://firebase.google.com/docs/genkit)
- **Data Fetching**: Native `fetch` API
- **Deployment**: Firebase App Hosting

## Project Structure

The project is organized following Next.js App Router conventions.

```
.
├── src
│   ├── app
│   │   ├── (app)               # Main authenticated application routes
│   │   │   ├── browse-candidates
│   │   │   ├── bookings
│   │   │   ├── dashboard
│   │   │   └── ... (other pages)
│   │   ├── api                 # API routes (if any)
│   │   ├── globals.css         # Global styles and Tailwind directives
│   │   └── layout.tsx          # Root layout
│   ├── components
│   │   ├── ui                  # ShadCN UI components
│   │   └── ...                 # Custom application components
│   ├── lib
│   │   ├── data-service.ts     # Handles fetching and transforming data from the external API
│   │   ├── mock-data.ts        # Contains mock data for non-candidate entities (bookings, jobs, etc.)
│   │   ├── types.ts            # TypeScript type definitions
│   │   └── utils.ts            # Utility functions
│   └── ai
│       ├── flows               # Genkit AI flows for features like review generation
│       └── genkit.ts           # Genkit initialization and configuration
├── public                      # Static assets
├── package.json                # Project dependencies and scripts
└── next.config.ts              # Next.js configuration
```

## How It Works

### Data Fetching

The application fetches candidate data from an external Open API endpoint. This is handled by a dedicated service located at `src/lib/data-service.ts`.

- **`fetchCandidates()`**: This is the primary function for getting a list of all candidates. It fetches data from the API and transforms it into the `Candidate` type defined in `src/lib/types.ts`.
- **`fetchCandidateById()`**: This function retrieves a single candidate by their ID.
- **Data Transformation**: The API response has a different structure than the one used internally. The `transformCandidateData` function maps the fields from the API to the application's `Candidate` type. For example:
    - The candidate's `role` is derived from `apiCandidate.candidate_type.name`.
    - `first_name` and `last_name` are combined into `name`.
    - The `details` array from the API is mapped to the `qualifications` array in the app.

This approach decouples the application from the specific structure of the external API, making it easier to manage changes in the future.

### Authentication & Routing

The application uses a role-based system (`client` vs. `candidate`). The main authenticated section of the app lives in the `(app)` route group. The entry point is `src/app/(app)/layout.tsx`, which wraps all pages in a consistent layout.

### AI Features

Generative AI functionality is powered by **Genkit**. The AI logic is organized into "flows" located in `src/ai/flows/`. These are server-side functions that can be called from React components to perform tasks like:

- Generating reviews for candidates.
- Finding the best candidate match based on criteria.
- Powering the AI assistant chatbot.

## Getting Started

To run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.
