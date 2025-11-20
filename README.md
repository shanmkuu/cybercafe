# cybercafe
# React

A modern React-based project utilizing the latest frontend technologies and tools for building responsive web applications.

## 🚀 Features

- **React 18** - React version with improved rendering and concurrent features
- **Vite** - Lightning-fast build tool and development server
- **Redux Toolkit** - State management with simplified Redux setup
- **TailwindCSS** - Utility-first CSS framework with extensive customization
- **React Router v6** - Declarative routing for React applications
- **Data Visualization** - Integrated D3.js and Recharts for powerful data visualization
- **Form Management** - React Hook Form for efficient form handling
- **Animation** - Framer Motion for smooth UI animations
- **Testing** - Jest and React Testing Library setup

## 📋 Prerequisites

- Node.js (v14.x or higher)
- npm or yarn

## 🛠️ Installation

1. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
   
2. Start the development server:
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
react_app/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   ├── lib/ 
    ├── pages/          # Page components
│   ├── styles/         # Global styles and Tailwind configuration
│   ├── App.jsx         # Main application component
│   ├── Routes.jsx      # Application routes
│   └── index.jsx       # Application entry point
├── .env                # Environment variables
├── index.html          # HTML template
├── package.json        # Project dependencies and scripts
├── tailwind.config.js  # Tailwind CSS configuration
└── vite.config.js      # Vite configuration
```

## 🧩 Adding Routes

To add new routes to the application, update the `Routes.jsx` file:

```jsx
import { useRoutes } from "react-router-dom";
import HomePage from "pages/HomePage";
import AboutPage from "pages/AboutPage";

const ProjectRoutes = () => {
  let element = useRoutes([
    { path: "/", element: <HomePage /> },
    { path: "/about", element: <AboutPage /> },
    // Add more routes as needed
  ]);

  return element;
};
```

## 🎨 Styling

This project uses Tailwind CSS for styling. The configuration includes:

- Forms plugin for form styling
- Typography plugin for text styling
- Aspect ratio plugin for responsive elements
- Container queries for component-specific responsive design
- Fluid typography for responsive text
- Animation utilities

## 📱 Responsive Design

The app is built with responsive design using Tailwind CSS breakpoints.


## 📦 Deployment

---

## 🚀 Deployment Guide

### Overview

The **CyberCafe Tracker System** is a **local workstation program** built with **React** for the frontend and **Supabase** for the backend. It’s designed to run directly on computers within a cybercafé, allowing each workstation to operate independently while still syncing with a shared Supabase database in the cloud. This setup ensures that session data and user activity are centrally managed, even though the app runs locally.

---

### System Components

The system has three main components:

* The **frontend**, built with React, provides the login interface, dashboards, and tracking features.
* The **backend**, hosted on Supabase, manages user authentication, data storage, and API interactions.
* The **database**, also managed by Supabase, stores user accounts, session logs, machine identifiers, and security events.

---

### Local Workstation Setup

Each computer in the cybercafé will have a copy of the application installed locally. To prepare the system, build the React app using:

```bash
npm run build
```

This will generate a `build` folder containing the production files. Copy that folder to each workstation and start the local server by running:

```bash
npx serve -s build
```

After that, the system can be accessed by opening `http://localhost:3000` in a browser.

Each workstation connects securely to the Supabase backend. Environment variables should be set using a `.env` file that includes your project URL and API key, for example:

```env
REACT_APP_SUPABASE_URL=your-project-url  
REACT_APP_SUPABASE_ANON_KEY=your-anon-key  
```

These credentials enable the frontend to communicate safely with Supabase.

---

### Session Isolation

To ensure that user sessions on one machine do not affect others, every workstation is automatically assigned a **unique machine ID** when the application starts. All user activity, including logins and file actions, is tied to that specific machine ID. This provides complete isolation between sessions on different computers, even though they share the same cloud backend.

---

### Deep Freeze Compatibility

For cybercafés that use **Deep Freeze** to protect their systems, the application is designed to work without losing data. The app’s main folder should be placed on a **thawed drive or external partition**, so it isn’t wiped on reboot. Since all user data, logs, and session details are stored remotely in Supabase, each reboot restores a clean interface without deleting any actual records.

---

### Offline Usage

In cases where the internet connection is unavailable, the application can operate temporarily in **offline mode**. During this time, session data is stored locally using browser storage or a lightweight local database such as SQLite. Once the connection to Supabase is restored, the system automatically syncs all pending data to the cloud.

---

### Summary

In short, the **CyberCafe Tracker** runs as a local web application but uses **Supabase** as its central cloud backend. It supports session isolation per machine, is compatible with Deep Freeze environments, and can continue functioning during internet outages. All configuration and deployment steps can be handled by running the React build locally and linking it to your Supabase project using the provided environment settings.

---


```bash
npm run build
```

## 🙏 Acknowledgments

- Powered by React and Vite
- Styled with Tailwind CSS

Built with ❤️ by shan's digital fortress  visit (https://shanmkuu.vercel.app)
