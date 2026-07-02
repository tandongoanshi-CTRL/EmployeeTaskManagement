#  Employee Task Management System

Welcome to the repository for the Employee Task Management System. This application manages employee task assignments, status tracking, and maintains an automated background trail of audit logs.

The project is split cleanly into a **Django REST Framework** backend and an **Angular** frontend workspace.

---
!!PASSWORDS FOR LOGIN!!

(ADMIN)goanshi = 123456789Goanshi
employees:
ashok= As123456789
raja= 123456789Ra
gunjan=123456789Gu
rajni= 123456789Rajni
indra_jeet=123456789In
riddhi_singh=123456789Ri


##  Running the Django Backend

The backend manages the database, core REST APIs, and background logging tools.

### 
1. Navigate to the backend directory

cd backend


2. Create and Activate the Virtual Environment
If setting up on a brand-new laptop, create the environment first:

PowerShell:
python -m venv venv

Now activate it:
On Windows PowerShell:
PowerShell:
.\venv\Scripts\Activate.ps1

On Windows Command Prompt (cmd):
DOS:
.\venv\Scripts\activate.bat


3. Install Backend Packages
Install all required dependencies from the package manifest:

pip install -r requirements.txt


4. Apply Database Migrations
Initialize the local SQLite database schema:

python manage.py makemigrations
python manage.py migrate


5. Start the Development Server

python manage.py runserver 8001
Admin Dashboard: http://127.0.0.1:8001/admin/

Swagger API Documentation: http://127.0.0.1:8001/api/docs/




Running the Angular Frontend
The frontend provides the user interface workspace for monitoring task allocations.

1. Open a new terminal window and navigate to the frontend directory:

cd frontend


2. Install Node Packages
Download the workspace dependencies required for the user interface:

npm install


3. Start the Application
Launch the local web dev server:

npx nx serve employee-ui

Local Web URL: http://localhost:4200/