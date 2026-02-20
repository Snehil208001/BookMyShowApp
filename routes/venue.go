package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/Snehil208001/BookMyShowApp/controllers"
	"github.com/Snehil208001/BookMyShowApp/middleware"
)

func VenueRoutes(c *gin.Engine) {
	Venue := c.Group("/venues")
	{
		Venue.GET("/", controllers.GetAllVenues)
		Venue.POST("/", middleware.RequireAuth, controllers.CreateVenue)
		Venue.POST("/:id/movies/add", middleware.RequireAuth, controllers.AddMoviesInVenue)
		Venue.GET("/:id", controllers.GetVenueByID)
		Venue.POST("/:id/timings/add", middleware.RequireAuth, controllers.AddShowTimings)
	}
}
