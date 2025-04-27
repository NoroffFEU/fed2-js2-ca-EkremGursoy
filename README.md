# JavaScript Social Media Client (FED2-24)

Welcome to the **JavaScript Social Media Client**, the front‑end application for a simple social networking platform. Built as part of the Front‑end Development 2 (JS2) course assignment, this project demonstrates modern JavaScript (ES6+), modular design, and Tailwind CSS styling with Vite as the build tool.

---

## Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running Locally](#running-locally)
- [API Reference](#api-reference)
- [Deployment](#deployment)



---

## Overview

This application provides a clean, responsive interface for users to:

- Register and authenticate with Noroff Auth API
- Create, read, update, and delete posts
- Comment on and react to posts (group work feature)
- Follow and unfollow other users
- Browse individual user profiles
- Search through posts by keyword

The app uses ES6 modules, modular routing, and a layout manager to dynamically load pages in a multipage architecture.

---

## Live Demo

View the deployed application on Vercel: [https://fed2-js2-ca-ekrem-gursoy.vercel.app/](https://fed2-js2-ca-ekrem-gursoy.vercel.app/)

---

## Features

| Feature                | Description                                                      |
|------------------------|------------------------------------------------------------------|
| User Registration      | Create a new account via `/auth/register`                        |
| User Login             | Authenticate existing users via `/auth/login`                    |
| Post Feed              | Browse all posts on the home page                                |
| Single Post View       | View detailed post with comments and reactions                   |
| Create / Edit / Delete | Full CRUD operations on your own posts                           |
| Follow / Unfollow      | Manage user relationships                                        |
| Search Posts           | Real-time search bar to filter posts by content                  |
| Profile Management     | View and update your profile details                             |
| Comments & Reactions   | Leave comments and emoji reactions on posts (group assignment)    |

---

## Tech Stack

- **Language:** JavaScript (ES6+)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Module Loading:** ES Modules (import/export)
- **Deployment:** Vercel (Static Build)

---

## Getting Started

### Prerequisites

- Node.js >= 16.x
- npm (or yarn)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

Start the development server with:
```bash
npm run dev
```

Open `http://localhost:5173` in your browser to view the app.

Build for production:
```bash
npm run build
npm run preview
```

---

## API Reference

All API calls use the [Noroff API v2](https://docs.noroff.dev/docs/v2). Key endpoints:

- **Auth:**
  - `POST /auth/register`
  - `POST /auth/login`
- **Posts:**
  - `GET /social/posts`
  - `POST /social/posts`
  - `PUT /social/posts/:id`
  - `DELETE /social/posts/:id`
- **Profiles:**
  - `GET /social/profiles/:name`
  - `PUT /social/profiles/:name`

Refer to `src/js/api/constants.js` for full URL definitions.

---

## Deployment

This project is configured for Vercel. The `vercel.json` specifies `dist` as the output folder.

1. Connect your Git repository to Vercel.
2. Set environment variables in the Vercel dashboard.
3. Deploy! Automatic builds will run on every push to `main`.

---


