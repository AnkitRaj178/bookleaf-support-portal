# BookLeaf Support Portal:

**Candidate:** Ankit
**Role:** Full-Stack Developer

## 1. Approach & Priorities

When approaching this 5-day assignment, my primary goal was to build an MVP that goes beyond basic CRUD operations and actually handles the messy reality of user data and system failures. I focused my approach on three core pillars: scalable architecture, secure AI integration, and practical product thinking.

- **Maintainable Architecture:** Using the MERN stack, I avoided a standard type-based folder structure for the React frontend and instead used a Domain-Grouped Architecture. By grouping files by feature (e.g., isolating ticket UI from book data), the codebase is much easier to navigate and prevents component spaghetti as it scales. The Node.js backend follows a strict MVC pattern where routes, database controllers, and external services are fully decoupled.
- **Air-Gapped AI Security:** Exposing LLM keys in a frontend bundle is a massive vulnerability. To prevent this, the Google Gemini integration is completely air-gapped on the backend. The frontend has zero AI logic; it only requests data, while the backend `aiService.js` acts as a secure black box.
- **Product Thinking & Resilience:** I built the UI to handle edge cases gracefully, such as implementing contextual empty states for authors with no royalties, and dynamic SLA sorting so admins see the oldest, most urgent tickets first. Most importantly, I built a robust fallback system for the AI. If the Gemini API times out, the service safely intercepts the error and returns a custom `[SYSTEM WARNING]` draft with an "Unassigned" priority, ensuring the workflow never crashes and forcing manual triage.

## 2. Technical Trade-offs

Due to the 5-day timeline, I made a few deliberate engineering trade-offs to deliver a complete MVP:

- **Unified Login:** Authors and admins currently share the exact same login page. This was faster to build, but in a real application, I would separate them to avoid UX confusion and allow admins to use Enterprise SSO.
- **HTTP Polling vs. WebSockets:** To meet the "near-real-time" requirement, I used `setInterval` polling on the frontend. It works perfectly for this scale and avoids the backend overhead of setting up a WebSocket server, but it is less resource-efficient.
- **No Pagination:** The admin dashboard loads the entire ticket queue at once. This works perfectly for the provided sample dataset, but I would need to implement cursor-based pagination to handle BookLeaf's actual 22,000+ book catalog.

## 3. Evolving to a Production System

If given the opportunity to scale this MVP into a production-ready system for BookLeaf's actual catalog, I would prioritize the following architectural upgrades:

- **B2E Identity Decoupling:** I would completely split the authentication routing. Authors would keep the consumer-facing `/login`, while Admins would move to an unadvertised `/admin-portal` route. This eliminates UI conflicts and allows the operations team to secure their portal behind Enterprise SSO (like Okta or Google Workspace).
- **Event-Driven Real-Time Architecture:** To replace the frontend HTTP polling, I would implement WebSockets (via Socket.io) backed by a Redis message broker. This allows the server to push ticket updates to the UI only when database mutations actually occur, drastically reducing unnecessary network traffic.
- **Cursor-Based Pagination:** At scale, loading the entire queue would cause severe browser lag and database strain. I would implement cursor pagination on the `/api/tickets` endpoint for efficient, infinite-scroll data fetching.
- **AI Knowledge Base Scaling (RAG):** Currently, the entire BookLeaf policy guide is hardcoded into the AI's system prompt. As the company rulebook grows, this approach will waste tokens and hit context window limits. I would migrate the policies into a vector database (like Pinecone) and implement Retrieval-Augmented Generation (RAG) so the model dynamically pulls only the specific rules relevant to the current ticket.
