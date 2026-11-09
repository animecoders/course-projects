# Gin version

From this directory, download the Go module dependencies and run the app. Set `PORT` in `.env` to choose the listening port (defaults to `3000` if omitted):

```sh
go mod download
go run .
```

The homepage is at http://localhost:3000 by default. This app serves its local `public` directory under `/static/` (and the banner at `/banner.jpg`).
