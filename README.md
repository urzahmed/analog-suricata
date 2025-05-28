# Log Analyzer and Anomaly Predictor

A full-stack application for monitoring system logs, detecting anomalies using machine learning, and providing actionable insights.

## Features

- Real-time log monitoring using Suricata
- Anomaly detection using Isolation Forest algorithm
- Modern web interface built with Next.js
- RESTful API built with FastAPI
- Actionable insights for detected anomalies
- Docker-based deployment

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)
- Suricata (for local development without Docker)

## Project Structure

```
.
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── core/           # Core functionality
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   ├── lib/          # Utility functions
│   │   └── types/        # TypeScript types
│   └── Dockerfile
├── logs/                  # Suricata logs directory
├── suricata/             # Suricata configuration
├── docker-compose.yml
└── README.md
```

## Setup

### Option 1: Using Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd log-analyzer
   ```

2. Create necessary directories:
   ```bash
   mkdir -p logs suricata
   ```

3. Start the services:
   ```bash
   docker-compose up -d
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Option 2: Local Development Setup

1. Install Suricata:

   **Windows:**
   - Download the latest Suricata Windows installer from [OISF's GitHub releases](https://github.com/OISF/suricata/releases)
   - Run the installer and follow the installation wizard
   - Add Suricata to your system PATH
   - Create the following directories:
     ```bash
     mkdir -p "C:\Program Files\Suricata\log"
     mkdir -p "C:\Program Files\Suricata\rules"
     ```

   **Linux (Ubuntu/Debian):**
   ```bash
   sudo add-apt-repository ppa:oisf/suricata-stable
   sudo apt-get update
   sudo apt-get install suricata
   ```

   **macOS:**
   ```bash
   brew install suricata
   ```

2. Configure Suricata:
   - Copy the default configuration:
     ```bash
     # Windows
     copy "C:\Program Files\Suricata\suricata.yaml" "C:\Program Files\Suricata\suricata.yaml.bak"
     
     # Linux/macOS
     sudo cp /etc/suricata/suricata.yaml /etc/suricata/suricata.yaml.bak
     ```
   - Edit the configuration file to enable JSON logging:
     ```yaml
     # Windows: C:\Program Files\Suricata\suricata.yaml
     # Linux/macOS: /etc/suricata/suricata.yaml
     
     # Enable JSON logging
     - eve-log:
         enabled: yes
         filetype: regular
         filename: C:\Program Files\Suricata\log\eve.json
         types:
           - alert
           - flow
     ```

3. Start Suricata:
   ```bash
   # Windows
   suricata -c "C:\Program Files\Suricata\suricata.yaml" -i <your-interface-name>
   
   # Linux/macOS
   sudo suricata -c /etc/suricata/suricata.yaml -i <your-interface-name>
   ```

4. Set up the backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Linux/macOS
   venv\Scripts\activate     # Windows
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

5. Set up the frontend:
   ```bash
   cd frontend
   npm install
   ```

6. Start the development servers:
   ```bash
   # Terminal 1 (Backend)
   cd backend
   uvicorn app.main:app --reload
   
   # Terminal 2 (Frontend)
   cd frontend
   npm run dev
   ```

## Development

### Backend

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate     # Windows
   ```

2. Install dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. Run the development server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

- `GET /api/logs` - Get all logs
- `GET /api/logs/anomalies` - Get only anomalous logs
- `POST /api/suggest-action` - Get action suggestion for an anomaly
- `POST /api/analyze-logs` - Trigger log analysis

## Troubleshooting

### Suricata Issues

1. **Cannot find network interface:**
   - List available interfaces:
     ```bash
     # Windows
     ipconfig /all
     
     # Linux
     ip addr
     
     # macOS
     ifconfig
     ```
   - Use the correct interface name in the Suricata command

2. **Permission denied:**
   - Run Suricata with administrator/root privileges
   - Ensure the log directory is writable

3. **No logs being generated:**
   - Check Suricata configuration file
   - Verify the log directory path
   - Ensure the interface is capturing traffic

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 