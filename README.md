# SimpAns AI Mobile

The mobile application is built with React Native and TypeScript, and communicates with the SimpAns AI backend API for authentication, document processing, and AI-powered question answering.

## 📱 Download Android APK

[⬇️ Download SimpAnsAI APK](https://github.com/SEAwadhesh/simpans-ai-mobile/releases/download/v1.0.0/SimpAnsAI-v1.0.0-debug.apk)

# SimpAns AI

SimpAns AI is an AI-powered document question-answering application that allows users to upload PDF documents and ask questions about their content. It is an intelligent document assistant that helps users upload PDFs, retrieve relevant information, and ask questions in natural language. Built around a retrieval-augmented generation (RAG) workflow, the platform transforms document content into searchable knowledge and delivers contextual answers based on the uploaded material.

## What It Does

- Upload and validate PDF documents
- Extract and structure content from uploaded files
- Split documents into searchable chunks
- Generate embeddings using Gemini
- Store and retrieve vector data in Pinecone
- Answer user questions with grounded, document-based responses

## Why It Matters

Organizations, students, and professionals regularly depend on PDFs, manuals, reports, textbooks, and technical documentation to access critical knowledge. SimpAns AI converts this information into an intelligent, searchable knowledge layer powered by AI, enabling users to ask direct questions and receive accurate, source-based answers without manually scanning long documents. Whether preparing for exams, reviewing technical material, or extracting insights from business documents, the platform accelerates learning, research, and decision-making with greater speed, clarity, and confidence.

## Architecture

┌──────────────────────────┐
│ React Native App │
│ │
│ Authentication │
│ PDF / Documents │
│ Chat UI │
│ Navigation │
└────────────┬─────────────┘
│
│ REST API
▼
┌──────────────────────────┐
│ Express Backend │
│ │
│ Authentication │
│ Document Processing │
│ RAG Pipeline │
│ AI Requests │
└────────────┬─────────────┘
│
┌─────┴─────┐
▼ ▼
┌───────────┐ ┌──────────────┐
│ Supabase │ │ Pinecone │
│ │ │ │
│ Auth │ │ Vector Store │
│ Database │ │ Embeddings │
│ Storage │ │ │
└───────────┘ └──────┬───────┘
│
▼
┌─────────────┐
│ Google │
│ Gemini │
└─────────────┘

## Tech Stack

- Frontend: React Native, TypeScript, Redux Toolkit
- Backend: Node.js, Express, TypeScript
- AI: Google Gemini
- Vector Database: Pinecone
- Storage/Auth: Supabase

AI / RAG

PDF
↓
Text Extraction
↓
Text Splitting
↓
Embeddings
↓
Pinecone Vector Database
↓
Relevant Context Retrieval
↓
Gemini LLM
↓
Answer

🚀 Getting Started

Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- Java JDK
- Android Studio
- Android SDK
- Android Emulator or physical Android device
- React Native development environment

Check Node.js:

node -v

Check npm:

npm -v

Check Java:

java -version

📦 Installation

Clone the repository:

git clone https://github.com/SEAwadhesh/simpans-ai-mobile.git

Navigate to the project:

cd simpans-ai-mobile

Install dependencies:

npm install

🔧 API Configuration

The application communicates with the SimpAns AI backend.

For Android Emulator, the local development API can use:

http://10.0.2.2:5000

For a physical Android device, use the development machine's local network IP address when required.

For production, configure the application to use the deployed backend API.

Example: https://simpans-ai-backend.onrender.com

▶️ Running the Application

Start Metro:

npm start

Run Android:

npm run android

Alternatively:

npx react-native run-android

🧪 Development

Start Metro with cache reset:

npx react-native start --reset-cache

Clean Android build:

cd android
./gradlew clean
cd ..

On Windows PowerShell:

cd android
.\gradlew clean
cd ..

📱 Android APK

Generate a debug APK:

cd android
.\gradlew assembleDebug

The generated APK will normally be available under:

android/app/build/outputs/apk/debug/

For a release build:

cd android
.\gradlew assembleRelease

Before distributing a production release, configure signing and production environment settings appropriately.

🔐 Authentication

The application maintains the user's authentication/session information locally using AsyncStorage.
The app uses storage keys for authentication/session data, including:

simpans_token
simpans_user

The application also supports a demo-login flow for testing the application without going through the complete registration process.

🌐 Backend

The mobile application communicates with the SimpAns AI backend.

Production backend:
https://simpans-ai-backend.onrender.com

Git Project:
https://github.com/SEAwadhesh/simpans-ai-backend.git

The backend is responsible for:

- Authentication
- PDF processing
- Document management
- AI requests
- Embedding generation
- Vector search
- RAG processing
- Communication with Supabase, Pinecone, and Gemini

🔒 Security

The application should follow these security practices:

- Never commit API keys to Git
- Never expose Supabase service-role keys in the mobile application
- Keep backend secrets on the server
- Use authenticated API requests
- Validate uploaded files on the backend
- Use private document storage
- Do not store sensitive credentials in source code

🐛 Troubleshooting

Metro cache problems

npx react-native start --reset-cache

Android build problems

cd android
.\gradlew clean
cd ..

Then:

npm start -- --reset-cache

And run:

npx react-native run-android

Android Emulator cannot connect to localhost

Android Emulator uses:

10.0.2.2

instead of:

localhost

Therefore:

http://10.0.2.2:5000

can be used to access a backend running on the development computer.

Physical Android device

Make sure:

- Phone and computer are on the same network
- Backend is accessible from the phone
- Firewall allows the backend port
- The API URL uses the computer's local network IP

## API Reference

The platform exposes the following backend endpoints.

### Public Endpoints

#### POST /api/auth/signup

Register a new user account.

#### POST /api/auth/login

Authenticate an existing user.

#### POST /api/auth/demo

Start a demo session for local testing.

#### GET /api/auth/status

Check backend and integration availability.

### Authenticated Endpoints

#### GET /api/documents

List all documents for the authenticated user.

#### GET /api/documents/:id

Fetch a single document record.

#### POST /api/documents

Upload a PDF file and begin document processing.

#### POST /api/documents/seed

Create and index a sample PDF for testing.

#### POST /api/documents/:id/retry

Retry processing for a failed document.

#### DELETE /api/documents/:id

Delete a document and its related indexed data.

#### POST /api/chat

Ask a question against a specific uploaded document.

## Summary

SimpAns AI combines document intelligence, semantic search, and generative AI to make PDF content interactive and queryable. It is designed as a practical, scalable foundation for intelligent document workflows and AI-powered knowledge access.

⭐ If you find this project useful, consider giving the repository a star.
