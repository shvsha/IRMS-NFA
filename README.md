Integrated Report Monitoring System (IRMS)

A web-based system for managing and monitoring warehouse stock book reports, with multi-stage evaluation workflows for WSR and WSI reports.

---

📋 Prerequisites

Make sure you have the following installed before setting up the project:

- [Python 3.11] (https://www.python.org/downloads/release/python-3110/)
- [Node.js] (https://nodejs.org/) (v18 or higher)
- [Git] (https://git-scm.com/)
- [Thunder Client] (VS Code extension)

---

🚀 Getting Started

1. Clone the Repository

```bash
git clone https://github.com/shvsha/Integrated-Report-Monitoring-System---QA-BSM.git
cd Integrated-Report-Monitoring-System---QA-BSM
```

---

🖥️ Backend Setup

> Make sure you're using **Python 3.11** to avoid SSL issues.

```bash
# 1. Navigate to the backend folder
cd backend

# 2. Create virtual environment
python -m venv myenv

# 3. Activate it
myenv\Scripts\activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Navigate to the project folder
cd RMSProject

# 6. Run migrations
python manage.py migrate

# 7. Start the server
python manage.py runserver
```

Backend will be running at: **http://localhost:8000**

---

🌐 Frontend Setup

Open a **new terminal** for this step.

```bash
# 1. Navigate to the frontend folder (from project root)
cd frontend

# 2. Install dependencies
npm install

# 3. Install Tailwind CSS Animate
npm install tailwindcss-animate

# 4. Start the development server
npm run dev
```

Frontend will be running at: **http://localhost:5173**

---

👤 Creating Your First User

> Since the database is **local**, it is not pushed to GitHub. Each member needs to create their own users.

With **both servers running**, use Thunder Client to create users via the API.

## **Create the Admin User**
This is required first since the system has no users by default.

Method: POST
URL: http://localhost:8000/api/users/
Body (JSON):

```bash
{
    "fname": "Admin",
    "mI": "A",
    "lname": "User",
    "email": "admin@nfa.gov.ph",
    "user_level": "Admin",
    "dept": "Quality Assurance",
    "position": "Quality Assurance Officer",
    "WHCode": "010501A",
    "Office_id": "OF-001",
    "username": "admin",
    "password": "admin123",
    "confirmPassword": "admin123"
}
```

Try logging in in the system 😃

```bash
Username: admin
Password: admin123
```

---

🔐 User Roles

To fully utilize the system, you need to create the following users **after** logging in as Admin:

| Role | Description |
|------|-------------|
| **Warehouse Supervisor** | Creates and submits stock book reports |
| **Asst. Branch Manager** | Second-stage evaluator (Signatory) |
| **Accountant 3** | Third-stage evaluator (Signatory) |
| **Branch Manager** | Final-stage evaluator (Signatory) |

> You can create Warehouse Supervisors and Signatories directly through the system after logging in as Admin. No need to use Thunder Client for those. 🎉

---

📁 Project Structure

```
RMS-Research/
├── backend/
│   ├── myenv/              # Virtual environment (not pushed to GitHub)
│   ├── RMSProject/
│   │   ├── api/
│   │   ├── audit/
│   │   ├── authentication/
│   │   ├── notification/
│   │   ├── reports/
│   │   ├── users/
│   │   ├── db.sqlite3      # Local database (not pushed to GitHub)
│   │   └── manage.py
│   └── requirements.txt
└── frontend/
    ├── src/
    ├── node_modules/       # Not pushed to GitHub
    └── package.json
```

---

## ⚠️ Notes

- The **database is local** — each member has their own `db.sqlite3` and must create their own users.
- Always use **Python 3.11** when creating the virtual environment to avoid SSL errors.
- Run the **backend and frontend simultaneously** in separate terminals.
- Never push `myenv/`, `node_modules/`, or `db.sqlite3` to GitHub.
