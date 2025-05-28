# Suricata Log Analysis Dashboard

A real-time log analysis dashboard for Suricata IDS/IPS logs, featuring a modern Next.js frontend and FastAPI backend.

## Project Structure

```
suricata_project_final_year/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── services/
│   │   └── utils/
│   ├── data/
│   │   └── eve.json
│   └── logs/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── public/
│   └── styles/
└── README.md
```

## Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- pnpm (recommended) or npm
- Git

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (optional but recommended):
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # Linux/Mac
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Place your Suricata `eve.json` log file in the `backend/data` directory.

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   # Using pnpm (recommended)
   pnpm install

   # Using npm
   npm install
   ```

## Running the Application

### Backend

1. Make sure you're in the backend directory and your virtual environment is activated (if using one).

2. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```

   The backend will be available at: http://localhost:8000

   You can access the API documentation at: http://localhost:8000/docs

### Frontend

1. Make sure you're in the frontend directory.

2. Start the Next.js development server:
   ```bash
   # Using pnpm
   pnpm dev

   # Using npm
   npm run dev
   ```

   The frontend will be available at: http://localhost:3000

## Features

- Real-time log analysis
- Protocol distribution visualization
- Alert type analysis
- Threat detection and analysis
- Security suggestions
- Traffic pattern analysis
- High severity alert monitoring

## API Endpoints

- `GET /api/v1/analyze`: Get analysis of Suricata logs
- `GET /`: API information and documentation

## Development

### Backend Development

- The backend is built with FastAPI
- Main application code is in `backend/app/main.py`
- API routes are defined in `backend/app/api/endpoints.py`
- Log analysis logic is in `backend/app/services/`

### Frontend Development

- The frontend is built with Next.js 13+ and TypeScript
- Uses Tailwind CSS for styling
- Main page components are in `frontend/app/`
- Reusable components are in `frontend/components/`

## Troubleshooting

### Common Issues

1. **Backend Connection Error**
   - Ensure the backend server is running on port 8000
   - Check if the virtual environment is activated
   - Verify all dependencies are installed

2. **Frontend Build Issues**
   - Clear the `.next` directory and node_modules
   - Run `pnpm install` or `npm install` again
   - Check for any TypeScript errors

3. **Missing Log Data**
   - Ensure `eve.json` is present in `backend/data/`
   - Verify the log file format is correct
   - Check file permissions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 