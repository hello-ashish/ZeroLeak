# How to Run ZeroLeak on Windows

Welcome to ZeroLeak! This step-by-step tutorial will guide you through setting up and running the complete project (both the backend and frontend) on your Windows machine.

## Prerequisites

Before you begin, ensure you have the following installed on your Windows machine:
1. **[Git](https://git-scm.com/download/win)**: To download the project from GitHub.
2. **[Node.js](https://nodejs.org/)**: The runtime environment for the project (LTS version is recommended). Installing Node.js also installs `npm` (Node Package Manager).

## Step 1: Download the Project

Open your **Command Prompt (cmd)** or **PowerShell** and navigate to the folder where you want to store the project. Then, clone the repository:

```powershell
git clone <YOUR_GITHUB_REPOSITORY_URL_HERE>
cd ZeroLeak
```

*(Replace `<YOUR_GITHUB_REPOSITORY_URL_HERE>` with the actual link to your GitHub repository.)*

---

## Step 2: Set Up and Run the Backend (NestJS)

The backend handles the data, questions, and tests. It needs to be running for the frontend to work.

1. In your terminal, navigate into the `backend` folder:
   ```powershell
   cd backend
   ```
2. Install all the required dependencies:
   ```powershell
   npm install
   ```
3. Start the backend development server:
   ```powershell
   npm run start:dev
   ```
4. You should see logs indicating the NestJS server is running. **Leave this terminal window open and running.**

---

## Step 3: Set Up and Run the Frontend (Next.js)

The frontend is the web application interface. You will need to open a **new terminal window** to run this alongside the backend.

1. Open a **new** Command Prompt or PowerShell window.
2. Navigate to the `ZeroLeak/frontend` folder:
   ```powershell
   cd path\to\ZeroLeak\frontend
   ```
3. Install the required dependencies:
   ```powershell
   npm install
   ```
4. Start the frontend development server:
   ```powershell
   npm run dev
   ```

---

## Step 4: Access the Application

Once both the backend and frontend servers are running:
- Open your favorite web browser (Chrome, Edge, Firefox, etc.).
- Navigate to **[http://localhost:3000](http://localhost:3000)** to view the application!

*(Note: Depending on your exact configuration, the Next.js frontend usually runs on port 3000. If it defaults to a different port, the terminal running the frontend will tell you which link to open.)*

## Troubleshooting
- **`'npm' is not recognized as an internal or external command`**: This means Node.js is not installed correctly or not added to your Windows PATH. Restart your terminal or reinstall Node.js.
- **Port already in use**: If either server fails to start because the port is in use, you can usually stop the existing process or restart your computer. To stop a server in the terminal, click on the terminal window and press `Ctrl + C`.
