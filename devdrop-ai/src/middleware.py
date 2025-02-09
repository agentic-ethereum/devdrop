from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import time
import logging
import os

# Configure logger
logger = logging.getLogger("custom_logger")
logger.setLevel(logging.INFO)
formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
handler = logging.FileHandler("FileLog.log") 
handler.setFormatter(formatter)
logger.addHandler(handler)

# Environment-based configurations
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "").split(",") or [
    "localhost:3000"
]
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "").split(",") or [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
]

def register_middleware(app: FastAPI):
    @app.middleware("http")
    async def custom_logging(request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        processing_time = time.time() - start_time

        message = {
            "client": f"{request.client.host}:{request.client.port}",
            "method": request.method,
            "url": request.url.path,
            "status_code": response.status_code,
            "processing_time": f"{processing_time:.2f}s",
        }
        logger.info(message)
        return response

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        #allow_origins=ALLOWED_ORIGINS
        allow_headers=["*"],
        allow_credentials=True,
        allow_methods=["*"],
    )

    app.add_middleware(
        TrustedHostMiddleware,
        #allowed_hosts=ALLOWED_HOSTS,
        allowed_hosts = ["*"]
    )
