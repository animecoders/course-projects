from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles


BASE_DIR = Path(__file__).resolve().parent
PUBLIC_DIR = BASE_DIR / "public"

app = FastAPI()
app.mount("/static", StaticFiles(directory=PUBLIC_DIR), name="static")


@app.get("/", include_in_schema=False)
def home() -> FileResponse:
    return FileResponse(PUBLIC_DIR / "home.html")


@app.get("/banner.jpg", include_in_schema=False)
def banner() -> FileResponse:
    return FileResponse(PUBLIC_DIR / "banner.jpg", media_type="image/jpeg")
