# PartyGraph - Meta Llama 4 Hackathon NYC Top 6 Finalist

Built for the Llamacon NYC Hackathon ([06/01/2025]).
https://cerebralvalley.ai/e/llama-4-hackathon-nyc-f673085d

*PartyGraph: new york central event finder, powered by Llama.*

## The Problem

*   Platforms like Eventbrite and DoNYC prioritize large, ticketed, or sponsored events, burying smaller, community-driven gathering. Small events are hard to find unless you're in-the-know.
*   Users can’t find events that “feel” right—search is limited to keywords, categories, or dates.
*   Events are presented in isolation, with no sense of how they relate to others or fit into a broader cultural landscape.

## Core Features

*   Graph-Based Event Discovery: Circular event nodes and rectangular tag nodes visualized in a dynamic semantic graph.
*   LLaMA 4 Integration:
    *   Parses raw flyer images, URLs, or text into structured event data.
    *   Generates tags, summaries, and vibe-based associations using long-context understanding.
*   Natural Language Search: Discover events by describing your mood or past preferences.
*   Democratized Event Landscape: No hierarchy—grassroots events and major festivals live in the same visual space.

## Tech Stack

*   **Backend / Data**: Typescript, Meta LLaMA 4 API (multimodal + semantic search), Perplexity Search (Data Scraping)
*   **Frontend**: Next.js, Tailwind CSS, PostCSS
*   **Deployment**: Vercel

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployed on Vercel

Open [https://www.partygraph.app/](https://www.partygraph.app/) to see the deployed version

## Team

*   PartyGraph
*   David (dcsan) - [GitHub](https://github.com/dcsan)
*   Ting (tinglu12) - [GitHub](https://github.com/tinglu12)
*   Ben (bencrystal) - [GitHub](https://github.com/bencrystal)
*   Hannah (hannahqkim) - [GitHub](https://github.com/hannahqkim)


## Acknowledgements

*   Powered by **Meta Llama**.
*   Thanks to Cerebral Valley and Meta for the opportunity to build this project.