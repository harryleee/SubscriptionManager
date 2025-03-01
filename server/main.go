package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"strings"
	"time"
)

type Subscription struct {
	ID            int     `json:"id"`
	Name          string  `json:"name"`
	Price         float64 `json:"price"`
	Currency      string  `json:"currency"`
	Period        string  `json:"period"`
	FirstBillDate string  `json:"firstBillDate"`
	Icon          string  `json:"icon"`
}

type UserSubscriptions struct {
	Subscriptions []Subscription `json:"subscriptions"`
}

// In-memory storage for users and their subscriptions
var storage = map[string]UserSubscriptions{
	"ABCDEF": {
		Subscriptions: []Subscription{
			{ID: 1, Name: "YouTube Premium", Price: 11.99, Currency: "USD", Period: "monthly", FirstBillDate: "2023-01-01", Icon: "https://simpleicons.org/icons/youtube.svg"},
			{ID: 2, Name: "Spotify", Price: 9.99, Currency: "USD", Period: "monthly", FirstBillDate: "2023-02-15", Icon: "https://simpleicons.org/icons/spotify.svg"},
		},
	},
	"XYZ789": {
		Subscriptions: []Subscription{
			{ID: 1, Name: "Netflix", Price: 15.49, Currency: "USD", Period: "monthly", FirstBillDate: "2023-03-01", Icon: "https://simpleicons.org/icons/netflix.svg"},
			{ID: 2, Name: "Amazon Prime", Price: 14.99, Currency: "USD", Period: "monthly", FirstBillDate: "2023-05-01", Icon: "https://simpleicons.org/icons/amazon.svg"},
		},
	},
}

// CORS middleware to allow cross-origin requests
func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next(w, r)
	}
}

func generateRandomToken() string {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
	b := make([]byte, 32)
	for i := range b {
		b[i] = chars[rand.Intn(len(chars))]
	}
	return string(b)
}

func getSubscriptionsByToken(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	token := r.URL.Query().Get("token")
	if token == "" {
		http.Error(w, "Token is required", http.StatusBadRequest)
		return
	}

	subs, exists := storage[token]
	if !exists {
		http.Error(w, "Token not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(subs)
}

func getSubscriptionsByTokenPath(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 3 || parts[2] == "" {
		http.Error(w, "Token is required", http.StatusBadRequest)
		return
	}

	token := parts[2]
	subs, exists := storage[token]
	if !exists {
		http.Error(w, "Token not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(subs)
}

func createNewToken(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	newToken := generateRandomToken()
	storage[newToken] = UserSubscriptions{Subscriptions: []Subscription{}}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"token": newToken})
}

func syncSubscriptions(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var payload struct {
		Subscriptions []Subscription `json:"subscriptions"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, fmt.Sprintf("Invalid request body: %v", err), http.StatusBadRequest)
		return
	}

	token := r.URL.Query().Get("token")
	if token == "" {
		http.Error(w, "Token is required", http.StatusBadRequest)
		return
	}

	newSubs := payload.Subscriptions
	for i := range newSubs {
		newSubs[i].ID = i + 1
	}

	storage[token] = UserSubscriptions{Subscriptions: newSubs}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(storage[token])
}

func main() {
	rand.Seed(time.Now().UnixNano())

	http.HandleFunc("/sub", corsMiddleware(getSubscriptionsByToken))
	http.HandleFunc("/sub/", corsMiddleware(getSubscriptionsByTokenPath))
	http.HandleFunc("/sub/new_token", corsMiddleware(createNewToken))
	http.HandleFunc("/sub/sync", corsMiddleware(syncSubscriptions))

	log.Println("Server starting on :8082...")
	log.Fatal(http.ListenAndServe(":8082", nil))
}
