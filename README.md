# Personalized Healthcare Predictor 🏥🤖

Welcome to the **Personalized Healthcare Predictor** repository! This project leverages advanced Artificial Intelligence and Machine Learning algorithms to predict potential diseases based on a patient's symptoms, vitals, and history. It also features a robust recommendation system for medications and clinical paths.

This `README.md` is intended for developers, contributors, and teammates to quickly understand how the codebase is structured and how to run it locally.

---

## 🏗️ Codebase Structure & Architecture

The project is divided into several main components. Here is exactly how each part works:

### 1. The Frontend (Root Directory)
The user interface is built using standard HTML, CSS, and JavaScript, located right here in the root folder.
* **`index.html`, `login.html`, `prediction.html`, etc.** - The visual pages of the application.
* **`style.css`, `auth.css`, `contact.css`** - The stylesheets that make the application look modern and professional.
* **`js/`** - Contains frontend logic and animations (like the animated DNA background).
* **`server.py`** - A very simple, lightweight Python HTTP server. Its main job is to serve these HTML/CSS files to your browser at `http://localhost:8000`. It also contains some basic mock authentication logic that reads/writes to `data/users.json`.

### 2. The AI Backend (`/backend`)
This is the "brain" of the operation. It is a highly robust API built using **Flask**, **SQLAlchemy**, and **Scikit-Learn**. It connects to a cloud PostgreSQL database to store user histories and executes the heavy AI computations.
* **`backend/app.py`** - The main API server. It exposes endpoints like `/predict` and `/api/recommend/*` which the frontend uses to get AI predictions. It runs on port `5000`.
* **`backend/models.py`** - Defines the database schema (Users, PredictionHistory) using SQLAlchemy.
* **`backend/.env.example`** - A template for the environment variables needed to connect to the cloud PostgreSQL database.

### 3. Machine Learning Core (`/backend/ml`)
This folder contains the actual intelligent algorithms. 
* **`train_model.py`** - The training script for our core symptom-to-disease predictor. We use a **HistGradientBoostingClassifier** (a highly precise, lightweight gradient boosting algorithm) to analyze binary symptom arrays and output a diagnosis.
* **`train_recommendation_models.py`** - Scripts to build out the broader recommendation systems (e.g., TF-IDF content filtering, SVD, NLP Sentiment Analysis).
* **`*.pkl` files** - These are the saved (pickled) output models. Once trained, `app.py` loads these files directly into memory so it can answer predictions instantly without retraining.

### 4. Data & Research (`/data` & `/notebooks`)
* **`data/`** - Contains the raw CSV datasets containing thousands of disease/symptom mapping combinations used to train the models.
* **`notebooks/`** - Jupyter notebooks used by data scientists to explore the data, test out algorithms (like Random Forests), and visualize metrics before porting the final logic into the `backend/ml` Python scripts.

---

## 🚀 How to Run the Project Locally

Follow these steps to get the system running on your local machine.

### Step 1: Install Dependencies
Open your terminal, navigate to this project folder, and install the required Python packages for the backend:
```bash
pip install -r backend/requirements.txt
```

### Step 2: Setup the Cloud Database
To ensure all teammates share the exact same user data and history, the app connects to a cloud database.
1. Create a free PostgreSQL database on [Supabase](https://supabase.com) or [Neon](https://neon.tech).
2. Get your connection string (URI) from your database dashboard.
3. In the `backend/` folder, copy the `.env.example` file and rename it to `.env`.
4. Open `.env` and paste your URL into the `DATABASE_URL` variable.

### Step 3: Run the AI Backend (Flask)
The backend needs to be running to serve the ML predictions and talk to the database.
Open a terminal and run:
```bash
python backend/app.py
```
*You should see it indicate that the "Database tables are ready" and the server is running on port 5000.*

### Step 4: Run the Frontend Server
Open a **second, separate terminal window**, and run the simple frontend server:
```bash
python server.py
```

### Step 5: Open the App!
Open your web browser and go to:
**http://localhost:8000**

You can now log in, input symptoms, and watch the AI generate its diagnosis! 

---
*If you are a new contributor making changes to the Machine Learning logic, remember to run `python backend/ml/train_model.py` after modifying the ML scripts so that the `.pkl` files are re-generated before you run `app.py`.*
