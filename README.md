# Expense Tracker Backend API

A scalable, production-ready backend API for an Expense Tracker application.

This project is built with **Node.js, Express, and MongoDB**, following a **clean layered architecture** designed for long-term maintainability, security, and extensibility.

---

## 🎯 Purpose

The goal of this backend is to provide a **robust foundation** for an expense tracking system that supports:

- Secure authentication (cookie-based)
- Clean separation of concerns
- Scalable architecture for future features
- Consistent API responses
- Centralized error handling
- Easy onboarding for new developers

This repository currently focuses on **core infrastructure and application setup**. Feature modules will be added incrementally.

---

## 🧱 Architecture Overview

The project follows a **layered architecture**:

- **Controllers** – Handle HTTP requests and responses
- **Services** – Contain business logic
- **Repositories (Queries)** – Handle database access
- **Models** – Define data schemas
- **Middlewares** – Cross-cutting concerns (auth, errors, request ID)
- **Utils** – Shared helpers and utilities

This structure ensures:

- High testability
- Clear responsibility boundaries
- Minimal coupling between layers

---

## 🔐 Authentication Strategy

- Authentication is **cookie-based**
- Tokens are stored in **HTTP-only cookies**
- No tokens are exposed to frontend JavaScript
- Designed to be secure against XSS attacks

---

## ⚙️ Tech Stack

- **Node.js**
- **Express**
- **MongoDB (Mongoose)**
- **ES Modules (ESM)**
- **JWT (cookie-based auth)**
- **bcrypt (password hashing)**

---
