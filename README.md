# ✈️ SkyBrief

> AI-powered aviation weather briefing system for pilots, student pilots, and aviation enthusiasts.

SkyBrief is a full-stack web application that provides real-time aviation weather analysis using METAR, TAF, and Route Briefing. It converts complex aviation weather reports into an easy-to-understand operational briefing with intelligent GO / CAUTION / NO-GO recommendations.

---

## Features

### METAR Analysis
- Real-time METAR retrieval
- Weather decoding
- Visibility analysis
- Ceiling analysis
- Cloud layer information
- Wind information
- Flight category
- GO / CAUTION / NO-GO decision

---

### TAF Analysis
- Complete TAF decoding
- Forecast timeline
- Weather transitions
- BECMG analysis
- TEMPO analysis
- Operational recommendations for every forecast period

---

### Route Briefing
- Departure weather
- Destination weather
- Route comparison
- Operational decision engine
- Intelligent route risk assessment

---

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Axios

### Backend

- FastAPI
- Python

### APIs

- NOAA Aviation Weather Center

---

## Architecture

React + Vite
        │
     Axios API
        │
     FastAPI Backend
        │
 Aviation Weather Data
        │
 METAR / TAF Parsing
        │
 GO • CAUTION • NO-GO

---

## Project Structure

```
SkyBrief
│
├── backend
│   ├── services
│   ├── data
│   ├── routers
│   ├── main.py
│   └── requirements.txt
│
├── frontend
│   ├── src
│   ├── public
│   └── package.json
│
├── docs
├── datasets
└── README.md
```

---

## Screenshots

### Dashboard

*(Coming Soon)*

### METAR Analysis

*(Coming Soon)*

### TAF Analysis

*(Coming Soon)*

### Route Briefing

*(Coming Soon)*

---

## Installation

### Clone repository

```bash
git clone https://github.com/shivambhosle/SkyBrief.git
```

### Backend

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload
```

### Frontend

```bash
cd frontend

npm install

npm run dev
```

---

## API Endpoints

### METAR

```
GET /briefing/{icao}
```

### TAF

```
GET /taf/{icao}
```

### Route Briefing

```
GET /route/{departure}/{destination}
```

---

## Future Improvements

- Interactive route map
- NOTAM integration
- SIGMET integration
- Airport search
- Flight planning
- PDF briefing export
- User authentication

---

## Author

**Shivam Bhosle**

B.Tech Engineering

SkyBrief Project

---

## License

This project is licensed under the MIT License.