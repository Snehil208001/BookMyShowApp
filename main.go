package main

import (
	"github.com/gin-gonic/gin"
	"github.com/raunak173/bms-go/initializers"
	"github.com/raunak173/bms-go/routes"
)

func init() {
	initializers.LoadEnv()
	initializers.ConnectToDB()
	initializers.SyncDB()
	initializers.CreateAWSUploader()
}

var R = gin.Default()

func main() {
	// CORS for frontend (allow common Vite dev ports)
	R.Use(func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		allowed := map[string]bool{
			"http://localhost:5173": true, "http://localhost:5174": true, "http://localhost:5175": true, "http://localhost:5176": true,
			"http://localhost:5177": true, "http://localhost:5178": true, "http://localhost:5179": true, "http://localhost:5180": true,
			"http://localhost:5181": true, "http://localhost:5182": true,
			"http://127.0.0.1:5173": true, "http://127.0.0.1:5174": true, "http://127.0.0.1:5175": true, "http://127.0.0.1:5176": true,
			"http://127.0.0.1:5181": true, "http://127.0.0.1:5182": true,
		}
		if allowed[origin] {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		}
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})
	routes.MovieRoutes(R)
	routes.UserRoutes(R)
	routes.VenueRoutes(R)
	routes.SeatRoutes(R)
	routes.OrderRoutes(R)
	R.Run()
}
