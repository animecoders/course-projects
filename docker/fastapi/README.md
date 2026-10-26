# FastAPI version

From this directory, install the dependencies and run the app:

```sh
python -m pip install -r requirements.txt
uvicorn main:app --reload --port 3000
```

The homepage is at http://localhost:3000. Static files in the local `public/` directory are also available under `/static/`.
