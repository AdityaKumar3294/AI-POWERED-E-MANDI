from fastapi import FastAPI

app = FastAPI(title="AI E-Mandi AI Service")


@app.get("/")
def home():
    return {
        "message": "AI E-Mandi AI Service is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }