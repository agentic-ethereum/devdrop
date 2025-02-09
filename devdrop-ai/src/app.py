from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .middleware import register_middleware
from .api.routes import router as api_router


app = FastAPI(title="Agentic Ethereum")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,  # Must be False when using "*"
    allow_methods=["*"],
    allow_headers=["*"],
)

register_middleware(app)
app.include_router(api_router)