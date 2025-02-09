from fastapi import FastAPI
from .middleware import register_middleware
from .api.routes import router as api_router


app = FastAPI(title="Agentic Ethereum")
register_middleware(app)

app.include_router(api_router)