package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println(".env not found; using environment defaults")
	}

	publicDir := "public"
	if _, err := os.Stat(filepath.Join(publicDir, "home.html")); err != nil {
		log.Fatalf("find public/home.html: %v", err)
	}

	router := gin.Default()
	router.Static("/static", publicDir)
	router.StaticFile("/banner.jpg", filepath.Join(publicDir, "banner.jpg"))
	router.GET("/", func(c *gin.Context) {
		c.File(filepath.Join(publicDir, "home.html"))
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	if err := router.Run(":" + port); err != nil && err != http.ErrServerClosed {
		log.Fatal(err)
	}
}
