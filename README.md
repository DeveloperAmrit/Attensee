# Project Setup Guide

Welcome! This guide walks you through setting up the project, which consists of a **Node.js/Express backend**, a **React/Vite frontend**, and a **Flask backend** for additional API support.

---

## Prerequisites

- **Node.js** (for backend & frontend)
- **npm** (comes with Node.js)
- **Python 3.x** (for Flask backend)
- **Visual Studio & Build Tools** (for compiling Python dependencies)
- **CMake** (for compiling Python dependencies)
- **MongoDB Atlas account** (for database)
- **Git** (for cloning the repo)

---

## 1. Fork & Clone the Repository

1. Fork this repository to your own GitHub account.
2. Clone your fork to your local machine:

   ```sh
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

---

## 2. Backend (Node.js + Express)

### Setup

1. Navigate to the backend directory:

   ```sh
   cd backend
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Create a `.env` file in the `backend` folder and add:

   ```
   DB_USERNAME=
   PASSWORD=
   JWT_SECRET=
   ```

   - **DB_USERNAME** & **PASSWORD**: Register at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) to get these credentials.
   - **JWT_SECRET**: Generate a strong random string with:

     ```sh
     node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
     ```

4. Start the backend server:

   ```sh
   npm start
   ```

   - Note the port (typically `5000`).

---

## 3. Frontend (React + Vite + TailwindCSS)

### Setup

1. Move to the parent directory, then to the frontend folder:

   ```sh
   cd ..
   cd frontend2
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Configure API endpoints:

   - Open `src/data/data.js`
   - Set:
     ```js
     export const API_BASE = 'http://localhost:5000';
     export const flaskAPIBase = 'http://localhost:5001';
     ```

4. Ensure the backend is running (see previous step).

5. Start the frontend:

   ```sh
   npm run dev
   ```

---

## 4. Flask Backend

### Setup

1. Move to the parent directory, then to the flask backend:

   ```sh
   cd ..
   cd flask_backend
   ```

2. **Install required tools:**
   - [Visual Studio (Community Edition)](https://visualstudio.microsoft.com/)
   - [Build Tools for Visual Studio 2022](https://aka.ms/vs/17/release/vs_BuildTools.exe)
     - Make sure to **tick 'Add to PATH'** during installation.
   - [CMake](https://cmake.org/download/)
     - Again, **add to PATH**.

   > **Tip:** Install these tools anywhere, preferably on `C:/`.

3. **Model File:**
   - Download [shape_predictor_68_face_landmarks.dat](https://github.com/davisking/dlib-models/raw/master/shape_predictor_68_face_landmarks.dat)
   - Place the `.dat` file in the `flask_backend` folder.

4. **Environment Variables:**
   - Create a `.env` file in the `flask_backend` folder with:
     ```
     DB_USERNAME=
     PASSWORD=
     JWT_SECRET=
     ```
   - Use the same values as in the Node backend.

5. (Optional) Install Python dependencies (if requirements file is provided):

   ```sh
   pip install -r requirements.txt
   ```

---

## 5. Running the Project

- **Start the Node backend**: `cd backend && npm start`
- **Start the Flask backend**: `cd flask_backend && python app.py` or similar command
- **Start the React frontend**: `cd frontend2 && npm run dev`

Your app should now be running with:
- Node backend on `localhost:5000`
- Flask backend on `localhost:5001`
- Frontend on `localhost:5173` (or as specified by Vite)

---

## Troubleshooting

- Ensure all `.env` files are created and filled correctly.
- Make sure MongoDB Atlas cluster is accessible.
- If you encounter compilation errors in the Flask backend, double-check Build Tools and CMake installation.
- For any issues, check logs/output in each terminal and verify all services are running.

---

## Credits

- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Node.js](https://nodejs.org/)
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Flask](https://flask.palletsprojects.com/)
- [dlib models](https://github.com/davisking/dlib-models)

---
