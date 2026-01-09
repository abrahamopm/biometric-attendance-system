<div align="center">

  <h1 style="font-size: 3rem; font-weight: bold; background: -webkit-linear-gradient(45deg, #6366f1, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
    Biometric Attendance System
  </h1>

  <p style="font-size: 1.2rem; color: #6b7280; font-family: 'Inter', sans-serif;">
    A Next-Gen, AI-Powered Attendance Solution for Modern Education
  </p>

  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#demo">Demo</a>
  </p>

  <br />

  ![Project Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge&logo=activity)
  ![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge&logo=scale)
  ![School Project](https://img.shields.io/badge/School-Project-orange?style=for-the-badge&logo=book)

</div>

<br />

---

## 📖 **About The Project**

Welcome to the **Biometric Attendance System**, a cutting-edge school project designed to revolutionize how attendance is tracked. By leveraging the power of **Artificial Intelligence** and **Computer Vision**, this application eliminates proxy attendance and ensures accurate, real-time tracking of students.

This system isn't just about security; it's about **efficiency**, **transparency**, and **modernizing** educational infrastructure.

### 🌟 **Key Features**

*   **🤖 Facial Recognition**: Seamless, touchless attendance marking using advanced OpenCV and Face Recognition libraries.
*   **⚡ Real-Time Dashboard**: Instant feedback and live updates for administrators and teachers.
*   **📊 Comprehensive Reports**: Exportable data analysis for attendance trends.
*   **🛡️ Secure Authentication**: JWT-based protection for all API endpoints.
*   **🎨 Modern UI/UX**: A stunning, responsive interface built with React, TailwindCSS, and Framer Motion animations.

---

## 🛠️ **Tech Stack**

This project uses a robust, full-stack architecture to deliver performance and reliability.

<details open>
<summary><strong>🖥️ Frontend (Client Side)</strong></summary>
<br />

| Technology | Badge | Description |
| :--- | :--- | :--- |
| **React** | ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) | The core UI library. |
| **Vite** | ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white) | For lightning-fast development. |
| **TypeScript** | ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) | Ensures type safety and code quality. |
| **TailwindCSS** | ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) | Utility-first CSS for rapid styling. |
| **Framer Motion** | ![Framer](https://img.shields.io/badge/Framer-black?style=for-the-badge&logo=framer&logoColor=blue) | For smooth, complex animations. |

</details>

<details open>
<summary><strong>⚙️ Backend (Server Side)</strong></summary>
<br />

| Technology | Badge | Description |
| :--- | :--- | :--- |
| **Django** | ![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white) | The high-level Python web framework. |
| **Django REST** | ![DRF](https://img.shields.io/badge/DJANGO-REST-ff1709?style=for-the-badge&logo=django&logoColor=white&color=ff1709&labelColor=gray) | Powerful toolkit for Web APIs. |
| **OpenCV** | ![OpenCV](https://img.shields.io/badge/OpenCV-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white) | Real-time computer vision library. |
| **Pandas** | ![Pandas](https://img.shields.io/badge/pandas-150458?style=for-the-badge&logo=pandas&logoColor=white) | Data manipulation and analysis. |

</details>

---

## 🚀 **Getting Started**

Follow these simple steps to set up the project locally on your machine.

### **Prerequisites**

*   **Node.js** (v18+)
*   **Python** (v3.10+)

### ** Installation Guide**

#### **1️⃣ Clone the Repository**
```bash
git clone https://github.com/your-username/biometric-attendance-system.git
cd biometric-attendance-system
```

#### **2️⃣ Backend Setup (Python/Django)**
Navigate to the backend folder and set up the virtual environment.

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate
```

Install dependencies and run migrations:

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
> The backend server will start at `http://127.0.0.1:8000/`

<br />

#### **3️⃣ Frontend Setup (React/Vite)**
Open a new terminal, navigate to the frontend folder, and install dependencies.

```bash
cd frontend
npm install
npm run dev
```
> The frontend application will start at `http://localhost:5173/`

---

## 📸 **Screenshots**

| **Dashboard** | **Login Page** |
|:---:|:---:|
| <img src="https://placehold.co/600x400/png?text=Dashboard+Preview" alt="Dashboard" width="100%"> | <img src="https://placehold.co/600x400/png?text=Login+Page+Preview" alt="Login Page" width="100%"> |

| **Attendance Scanning** | **User Profile** |
|:---:|:---:|
| <img src="https://placehold.co/600x400/png?text=Scanning+Interface" alt="Scanning" width="100%"> | <img src="https://placehold.co/600x400/png?text=User+Profile" alt="Profile" width="100%"> |

---

## 🤝 **Contributing**

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📬 **Contact**

For any inquiries or feedback, please reach out!

Developed with ❤️ for **School Project 2024**
