## Local Setup Instructions

Here is how to get the BookLeaf Author Portal running on your local machine.

### Prerequisites

Make sure you have these ready before starting:

- Node.js (v18 or higher)
- MongoDB (either running locally or a MongoDB Atlas URI)
- A Google Gemini API Key

### Backend & Database Setup

Open your terminal and set up the Node.js backend first.

cd backend
npm install

Create a `.env` file in the root of the `backend/` folder and add your specific variables:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key

The application requires the provided sample dataset to function. Run the seed script to populate your database:
npm run seed

Once the database is seeded, start the server:
npm run dev

### Frontend Setup

Open a second terminal window to set up the React application.

cd frontend
npm install

Create a `.env` file in the root of the `frontend/` folder and link it to the local backend:
VITE_API_URL=http://localhost:5000/api

Start the Vite development server:
npm run dev

### Project Structure

This project implements a Domain-Grouped Architecture on the frontend to prevent component spaghetti, and a strict MVC pattern on the backend to separate concerns.

```text
bookleaf-support-portal/
├── backend/
│   ├── controllers/      # Route logic and database interactions
│   ├── middleware/       # JWT auth and Role-Based Access Control (RBAC)
│   ├── models/           # Mongoose schemas (User, Ticket, Book)
│   ├── routes/           # Express API endpoints
│   ├── services/         # Air-gapped AI integration (Gemini)
│   ├── seed.js           # Database seeding script for sample data
│   └── server.js         # Entry point & Express server setup
│
└── frontend/
    ├── public/           # Static assets
    ├── src/
    │   ├── assets/       # Images and UI icons
    │   ├── components/   # Reusable UI components (grouped by domain)
    │   │   └── tickets/  # Ticket-specific components (e.g., TicketQueueItem)
    │   ├── layouts/      # Dashboard wrappers (AuthorLayout, AdminLayout)
    │   ├── pages/        # Route entry points
    │   │   ├── admin/    # Admin dashboard views
    │   │   ├── auth/     # Login view
    │   │   └── author/   # Author portal views
    │   ├── utils/        # Axios API configurations and interceptors
    │   ├── App.jsx       # React Router setup
    │   └── main.jsx      # React DOM entry

###  Test credentials
When both servers are running (usually on localhost:5000 and localhost:5173), you can use these accounts to test the role-based access control.

Admin / Operations Team:
* Email: admin@bookleaf.com
* Password: admin123

Author Portal:
* Email: rohit.kapoor@email.com
* Password: password123
(Note: You can use any author email from the seeded JSON dataset. All passwords default to password123).

###  Architecture Decisions

For this project, I chose the MERN stack (MongoDB, Express, React, Node.js). Since the 5-day timeline required balancing clean code with fast delivery, I made specific architectural choices to prioritize maintainability and security for the MVP.

## Frontend: Hybrid Domain-Grouped Architecture
Instead of dumping every component into a single `src/components` folder, I structured the React frontend by feature domains (e.g., `components/tickets/`, `components/books/`, `components/auth/`).
* **Why I made this choice:** In standard type-based structures, finding all the pieces of a specific feature gets messy as the app grows. Grouping by domain keeps the ticket UI completely isolated from the book rendering logic, which makes debugging much faster and prevents "spaghetti code."
* **Real-time Updates:** The prompt asked for real-time or near-real-time updates. I implemented HTTP polling using a `setInterval` inside a custom hook rather than building a WebSocket server. For an MVP, polling completely satisfies the "near real-time" requirement while keeping the backend infrastructure simple and focused on the core REST API.

## Backend: Strict MVC & Role-Based Access
The Node.js backend follows a strict separation of concerns, separating routing, controllers, and external services.
* **Why I made this choice:** I wanted to make sure my database queries weren't mixed directly into the route definitions.
* **Security & Auth:** I used JWT for authentication, storing the token in `sessionStorage` on the frontend so it clears when the tab closes. I built a custom middleware to handle Role-Based Access Control (RBAC). If an author tries to fetch tickets, the controller strictly filters by their decoded token ID. If an admin makes the same request, the middleware grants them global read/write access.

##  AI Integration: The Air-Gap Approach
I used the Google Gemini SDK for the auto-classification and response drafting.
* **Why I made this choice:** The most critical decision here was to keep the AI completely isolated on the backend inside a dedicated `aiService.js` file. The frontend has zero AI logic and no direct access to the LLM. I did this to ensure the `GEMINI_API_KEY` is never exposed to the client's browser bundle, which is a major security vulnerability.

## 🔌 API Documentation

For a detailed breakdown of all endpoints, authentication requirements, and AI service routes, please see the **[API Documentation](API_DOCS.md)**.

### AI Integration Details

The AI feature (powered by Google Gemini) acts as an assistant for the admin team to auto-classify incoming tickets, assign a priority score, and draft initial responses. All of this logic is kept strictly on the Node.js backend inside a dedicated `aiService.js` utility to keep the API key completely secure from the frontend.

### Prompt Strategy
Getting the AI to sound like a real BookLeaf support agent rather than a generic bot required strict constraints. I passed the provided BookLeaf Knowledge Base directly into the model's system instructions so it actually knows the company policies (like the 80/20 royalty split, the ₹1,000 payout threshold, and the 48-hour SLAs).

To ensure the output is reliably handled by the frontend, I forced the AI to respond using a strict JSON schema containing exactly three fields: `category`, `priority`, and `draftResponse`. This prevents the model from returning conversational text or markdown that would break the JSON parser and the UI.

### Cost Management (Token Optimization)
To avoid wasting tokens and racking up API costs, I kept the data payload as small as possible. When an author submits a ticket, I don't send their entire account history or past ticket arrays to the LLM. The AI only receives the specific `subject` and `description` of that exact ticket. Because the BookLeaf knowledge base is passed as a static system instruction, the token usage per request stays highly predictable and minimal.

### Error Handling & Graceful Degradation
One of the core requirements was making sure the app doesn't break if the AI API goes down, times out, or gets rate-limited. I wrapped the AI call in a `try/catch` block inside the service.

If the Gemini API fails, the service catches the error but intentionally *does not* throw an exception back to the controller (which would crash the entire ticket creation process). Instead, it returns a safe, hardcoded fallback object. It automatically sets the ticket priority to "Unassigned" and injects a `[SYSTEM WARNING]` into the draft response, alerting the admin that the AI failed due to high traffic. This guarantees that the author's ticket is always safely saved to the database and the operations team can just type out the response manually without the workflow breaking.

##  Product Thinking & Extra Features

Beyond the core requirements, I prioritized making the portal feel like a production-ready tool by focusing on edge cases, user workflows, and data integrity:

* **Smart Ticket Sorting & SLA Management:** The admin dashboard dynamically sorts the queue so the oldest and most urgent tickets surface at the top. This ensures critical queries aren't ignored and SLAs are maintained.
* **Complete Ticket Lifecycle:** Tickets can be marked as "Closed" once resolved, but I implemented a "Reopen" feature. This handles real-world scenarios where an admin closes a ticket by mistake, or an author needs to ask a follow-up question, keeping the entire conversation history intact.
* **Strict Workflow Boundaries:** While Admins have global access to view and manage all tickets, the ability to *create* a new support query is strictly locked to the Author role. This prevents operations staff from accidentally creating dummy tickets and polluting the database.
* **Graceful Empty States:** The application safely handles "zero-data" scenarios. If an author has newly published books with no royalties yet, or if the admin queue is empty, the UI displays contextual placeholders instead of broken tables or blank screens.
* **Defensive UI:** If the background polling connection drops, the UI surfaces a user-friendly toast notification rather than failing silently, ensuring the admin is always aware of their connection status.
* **Smart System Fallbacks:** If the AI service fails, the fallback architecture explicitly sets the ticket priority to "Unassigned" and injects a system warning. This safely forces manual triage by the operations team without breaking the application.

### Known Limitations & Future Improvements

Since this was built within a 5-day timeline, I had to prioritize core functionality over perfect scalability. If I had more time to evolve this into a production-ready system, here is what I would improve:

1. **Decoupled Authentication:** Right now, authors and admins log in through the exact same page. While this works for an MVP, it creates a weird UX where admins see a "Sign Up" button. In a real application, I would move the admin login to a completely separate hidden route (like `/ops-auth`) so it could be locked down with Enterprise SSO (like Okta or Google Workspace).
2. **Replacing Polling with WebSockets:** To meet the "near-real-time" requirement for ticket updates, I used HTTP polling (`setInterval`) on the frontend. It gets the job done, but it's inefficient because it constantly queries the database. Given more time, I would replace this with WebSockets (using Socket.io) or Server-Sent Events (SSE) to push updates only when they actually happen.
3. **Database Pagination:** The admin ticket queue currently fetches and loads every single ticket at once. If BookLeaf actually scaled this to their 22,000+ catalog, sending that much data would slow down the network and the browser. I would need to implement cursor-based pagination on the `/api/tickets` endpoint.
4. **AI Knowledge Base Scaling:** Currently, the entire BookLeaf policy guide is passed as a static string into the LLM's system instructions. It works well because the provided rules are relatively short. However, if the company policy guide was 50 pages long, passing that on every query would waste a massive amount of tokens. I would eventually move the policies into a vector database and use RAG (Retrieval-Augmented Generation) so the AI only pulls the specific rules it needs for that exact ticket.

```
