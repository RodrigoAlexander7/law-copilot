# ⚖️ Law Copilot

![Status](https://img.shields.io/badge/Status-Active-success)
![Deployment](https://img.shields.io/badge/Deployment-Google_Cloud-blue?logo=google-cloud)
![License](https://img.shields.io/badge/License-MIT-yellow)

[English](#-english) | [Español](#-español)

---

## 🇬🇧 English

**Law Copilot** is an intelligent legal assistant powered by Artificial Intelligence, designed to analyze, summarize, and answer questions about legal documents using advanced **RAG (Retrieval-Augmented Generation)** techniques.

The core strength of this system lies in its specialized **Vector Database**, which has been deeply indexed with fundamental Peruvian legal frameworks. This allows for highly accurate, context-aware responses grounded in specific regulations.

🔗 **Live Demo:** [law-copilot.rodrygoleu.me](https://law-copilot.rodrygoleu.me)

### 📚 Knowledge Base (Vector DB)

The vector database is currently loaded and optimized with the following documents:

- **Political Constitution of Peru**
- **Civil Code**
- **Consumer Protection and Defense Code**
- **Law to Prevent, Punish and Eradicate Violence against Women**

### 🚀 Key Features

- **Specialized RAG:** Semantic search focused on Peruvian law.
- **Document Processing:** Extraction and analysis of text from complex PDFs.
- **Advanced AI Models:** Integration with **Google Gemini** and **OpenAI**.
- **Vector Search:** Uses **FAISS** for efficient indexing and retrieval.
- **Modern Interface:** Fast and responsive frontend built with **Next.js 16**.

### 🛠️ Tech Stack

This project uses a modern microservices architecture.

#### **Backend (API & A.I.)**

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688?logo=fastapi&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-Integration-green)
![FAISS](https://img.shields.io/badge/Vector_DB-FAISS-blue)
![Gemini](https://img.shields.io/badge/AI-Google_Gemini-8E75B2)

#### **Frontend**

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwindcss&logoColor=white)

#### **Infrastructure**

![Google Cloud](https://img.shields.io/badge/Cloud-Google_Cloud_Platform-4285F4?logo=google-cloud&logoColor=white)
![Docker](https://img.shields.io/badge/Container-Docker-2496ED?logo=docker&logoColor=white)

---

## 🇪🇸 Español

**Law Copilot** es un asistente legal inteligente potenciado por Inteligencia Artificial y **RAG (Retrieval-Augmented Generation)**. Permite a los usuarios interactuar con documentos legales de manera natural y precisa.

Su principal fortaleza reside en su **Base de Datos Vectorial**, la cual ha sido cargada y optimizada con normativas fundamentales de la legislación peruana, permitiendo respuestas fundamentadas y reduciendo alucinaciones.

🔗 **Demo en vivo:** [law-copilot.rodrygoleu.me](https://law-copilot.rodrygoleu.me)

### 📚 Base de Conocimiento (Vector DB)

La base de datos vectorial contiene la indexación completa de:

- **Constitución Política del Perú**
- **Código Civil**
- **Ley de Protección y Defensa al Consumidor**
- **Ley de Violencia contra la Mujer**

### 🚀 Características Principales

- **RAG Especializado:** Búsqueda semántica sobre leyes peruanas específicas.
- **Procesamiento de Documentos:** Ingesta y análisis de PDFs complejos.
- **Modelos de IA:** Integración híbrida con **Google Gemini** y **OpenAI**.
- **Búsqueda Vectorial:** Uso de **FAISS** para recuperación de alta velocidad.
- **Interfaz Moderna:** Frontend construido con **Next.js 16**.

### 🛠️ Tecnologías Utilizadas

#### **Backend (API & A.I.)**

El núcleo de la inteligencia del proyecto.
- **Framework:** FastAPI + Uvicorn
- **AI Orchestration:** LangChain
- **Vector Store:** FAISS (CPU)
- **Embeddings:** Sentence-Transformers
- **AI Providers:** Google GenAI, OpenAI

#### **Frontend (Interfaz de Usuario)**

* **Framework:** Next.js 16 (React 19)
- **Estilos:** TailwindCSS v4
- **Lenguaje:** TypeScript

### 📦 Instalación Local

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

---
Made with ❤️ by [Rodrygo](https://github.com/RodrigoAlexander7)
