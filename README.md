
# Authentication Web Application

## Used tools

### Frontend:
- **React** (with **TypeScript**)
- **Vite**
- **TailwindCSS** for styling
- **ShadCN** for UI components
- **Redux** for state management

### Backend:
- **Django**
- **Django Rest Framework (DRF)**
- **JWT Authentication** for secure login

## Getting Started

### Prerequisites
- **Node.js**: v20.11.1
- **Python**: 3.11
- **npm**: Latest version
- **Django**: Installed in a virtual environment

### Installation

#### Backend (Django + DRF)
1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/yourproject.git
    ```
2. Navigate to the backend directory:
    ```bash
    cd backend
    ```
3. Install the Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4. Run migrations:
    ```bash
    python manage.py migrate
    ```
5. Create a `.env` file for environment variables which includes the secret key and the debug value
7. Run the backend server:
    ```bash
    python manage.py runserver
    ```

#### Frontend (Vite React TypeScript)
1. Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2. Install the frontend dependencies:
    ```bash
    npm install
    ```
3. Start the Vite development server:
    ```bash
    npm run dev
    ```

## Usage

Once both servers (backend and frontend) are running, you can access the frontend at `http://localhost:5173` and the backend at `http://localhost:8000`.

- **Authentication Flow**: 
    - User signs up/signs in through the frontend.
    - JWT token is generated by the backend and stored in the frontend for future authenticated requests.

