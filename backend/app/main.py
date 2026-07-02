from fastapi import FastAPI

app = FastAPI(title="ShopSmart AI API")


@app.get("/health")
def health():
    return {"status": "ok", "service": "shopsmart-ai-backend"}