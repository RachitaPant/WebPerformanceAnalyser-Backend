# Website Performance Analysis API

A backend service built with **Node.js**, **Express**, and **TypeScript** that analyzes website performance using **Google Lighthouse** and **Puppeteer**.
It provides a simple REST API endpoint to run automated audits and return scores for performance, accessibility, SEO, and best practices.

## Features

* Analyze any public URL for performance metrics
* Get Lighthouse audit results in JSON format
* CORS-enabled for cross-origin requests
* Built with TypeScript for better maintainability

## Tech Stack

* **Node.js** – JavaScript runtime for backend
* **Express** – Lightweight web framework
* **TypeScript** – Static typing for JavaScript
* **Puppeteer** – Headless Chrome automation
* **Lighthouse** – Web performance auditing
* **CORS** – Cross-origin resource sharing

## API Endpoint

**POST** `/analyze`
**Request body (JSON):**

```json
{
  "url": "https://example.com"
}
```

**Response (JSON):**

```json
{
  "performance": 0.92,
  "accessibility": 0.88,
  "bestPractices": 0.90,
  "seo": 0.95
}
```

## Getting Started

### Prerequisites

* Node.js (v18+ recommended)
* npm or yarn

### Installation

```bash
git clone <repo-url>
cd backend-server
npm install
```

### Development

```bash
npm run dev
```

### Build & Run (Production)

```bash
npm run build
npm start
```

## Deployment

This project can be deployed on **Render**, **Railway**, or any Node.js hosting platform.
For Render:

1. Create a new Web Service
2. Set **Build Command**: `npm install && npm run build`
3. Set **Start Command**: `npm start`
4. Add `NODE_VERSION` in environment variables (optional, for consistency)


