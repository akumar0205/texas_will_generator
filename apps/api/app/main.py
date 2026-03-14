from collections import defaultdict, deque
from time import time
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.api.routes import router
from app.core.config import settings
from app.db.session import Base, engine
from app.models import intake  # noqa: F401

app = FastAPI(title=settings.app_name)
app.include_router(router)

Base.metadata.create_all(bind=engine)

request_windows: dict[str, deque] = defaultdict(deque)


@app.middleware("http")
async def basic_security(request: Request, call_next):
    body_limited = 1024 * 1024
    if request.headers.get("content-length") and int(request.headers["content-length"]) > body_limited:
        return JSONResponse(status_code=413, content={"detail": "Payload too large"})

    client = request.client.host if request.client else "unknown"
    now = time()
    window = request_windows[client]
    while window and now - window[0] > 60:
        window.popleft()
    if len(window) >= settings.rate_limit_per_minute:
        return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded"})
    window.append(now)

    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    return response


@app.get("/health")
def health():
    return {"ok": True}
