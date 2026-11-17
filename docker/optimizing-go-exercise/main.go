package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
)

type Config struct {
	Greeting string `json:"greeting"`
}

func loadConfig() Config {
	data, err := os.ReadFile("config.json")
	if err != nil {
		log.Fatal(err)
	}
	var cfg Config
	if err := json.Unmarshal(data, &cfg); err != nil {
		log.Fatal(err)
	}
	return cfg
}

func main() {
	cfg := loadConfig()
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(cfg)
	})
	log.Println("Listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
