Smart Fishing Regulation System
Overview
A modular web application that simulates fishing activities and prevents overfishing using DSA. It monitors fish populations, enforces catch limits, and suggests safe fishing zones.
Tech Stack
Frontend: React + Tailwind
Backend: Bun + Express
Database: MySQL
API Calls: Axios (1.13.6)
Maps: Google Maps API
Charts: Chart.js
Users
Fisherman: Perform fishing and get suggestions
Admin: Manage data and rules
Researcher: Analyze trends
Core Features
- Fish stock monitoring
- Fishing simulation (zone + effort)
- Catch limit enforcement
- Risk detection
- Safe zone suggestion (Graph)
- Protected species (Priority Queue)
- Google Maps integration
Architecture
React Frontend → Express Backend → MySQL → DSA Layer
DSA Used
Graph: Find nearest safe zones
Priority Queue: Identify endangered species
Folder Structure
root/
  backend/
    ├── src/
    │ ├── routes/ # API endpoints
    │ ├── controllers/ # Request handling logic
    │ ├── models/ # DB schemas
    │ ├── middleware/ # Auth & validation
    │ ├── dsa/ # Graph + Priority Queue (CORE)
    │ ├── services/ # Business logic
    │ ├── config/ # DB & env config
    │ └── app.js # Entry point
    │
    ├── package.json
    ├── .env
    └── index.js
    ├── dsa/
        ├── graph.js
        ├── priorityQueue.js
  frontend/
    ├── src/
    │ ├── pages/ # Route views
    │ ├── components/ # Reusable UI
    │ ├── context/ # Global state
    │ ├── hooks/ # Custom hooks
    │ ├── services/ # Axios API calls
    │ ├── utils/ # Helpers
    │ ├── App.jsx
    │ ├── main.jsx
    │ └── index.css
    │
    ├── package.json
    └── tailwind.config.js
  database/
    ├── schema.sql
    ├── seed.sql
    └── migrations/


Workflow
Select Zone → Select Effort → Calculate Catch → Check Limit → Update DB → Detect Risk → Suggest Zone
Team Roles
Frontend, Backend, Database, DSA, Integration
