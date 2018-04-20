package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
	"github.com/graphql-go/graphql"
	"github.com/kelseyhightower/envconfig"
	"github.com/mmcdole/gofeed"
	"github.com/rs/zerolog"
	"gopkg.in/tylerb/graceful.v1"
)

type Settings struct {
	Host string `envconfig:"HOST" required:"true"`
	Port string `envconfig:"PORT" required:"true"`
}

var err error
var s Settings
var router *mux.Router
var schema graphql.Schema
var log = zerolog.New(os.Stderr).Output(zerolog.ConsoleWriter{Out: os.Stderr})

func main() {
	err = envconfig.Process("", &s)
	if err != nil {
		log.Fatal().Err(err).Msg("couldn't process envconfig.")
	}

	zerolog.SetGlobalLevel(zerolog.DebugLevel)

	// define routes
	router = mux.NewRouter()

	router.Path("/feed").Methods("GET").HandlerFunc(
		func(w http.ResponseWriter, r *http.Request) {
			url := r.URL.Query().Get("url")
			fp := gofeed.NewParser()
			feed, err := fp.ParseURL(url)
			if err != nil {
				log.Error().Err(err).Str("url", url).Msg("error parsing feed")
				http.Error(w, err.Error(), 400)
				return
			}

			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(feed)
		},
	)
	router.Path("/favicon.ico").Methods("GET").HandlerFunc(
		func(w http.ResponseWriter, r *http.Request) {
			http.ServeFile(w, r, "./powerup/icon.png")
			return
		})

	router.PathPrefix("/powerup/").Methods("GET").HandlerFunc(
		func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")

			if r.URL.Path[len(r.URL.Path)-5:] == ".html" {
				http.ServeFile(w, r, "./powerup/basic.html")
				return
			}

			if r.URL.Path == "/powerup/icon.svg" {
				color := "#" + r.URL.Query().Get("color")
				if color == "#" {
					color = "#999999"
				}
				w.Header().Set("Content-Type", "image/svg+xml")
				fmt.Fprintf(w, `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     id="RSSicon"
     viewBox="0 0 8 8" width="256" height="256">

  <title>RSS feed icon</title>

  <style type="text/css">
    .button {stroke: none; fill: %s;}
    .symbol {stroke: none; fill: white;}
  </style>

  <rect   class="button" width="8" height="8" rx="1.5" />
  <circle class="symbol" cx="2" cy="6" r="1" />
  <path   class="symbol" d="m 1,4 a 3,3 0 0 1 3,3 h 1 a 4,4 0 0 0 -4,-4 z" />
  <path   class="symbol" d="m 1,2 a 5,5 0 0 1 5,5 h 1 a 6,6 0 0 0 -6,-6 z" />

</svg>
                `, color)
				return
			}

			http.ServeFile(w, r, "."+r.URL.Path)
		},
	)

	// start the server
	log.Info().Str("port", os.Getenv("PORT")).Msg("listening.")
	graceful.Run(":"+os.Getenv("PORT"), 10*time.Second, router)
}
