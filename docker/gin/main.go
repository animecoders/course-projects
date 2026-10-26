package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
)

func main() {
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

	if err := router.Run(":3000"); err != nil && err != http.ErrServerClosed {
		log.Fatal(err)
	}
}
