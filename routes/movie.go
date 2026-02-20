package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/Snehil208001/BookMyShowApp/controllers"
	"github.com/Snehil208001/BookMyShowApp/middleware"
)

func MovieRoutes(c *gin.Engine) {
	Movie := c.Group("/movies")
	{
		Movie.GET("/", controllers.GetAllMovies)
		Movie.POST("/", middleware.RequireAuth, controllers.CreateMovie)
		Movie.GET("/:id", controllers.GetMovieByID)
		Movie.GET("/venues/:id", controllers.GetVenuesByMovieID)
		Movie.PATCH("/:id/poster", middleware.RequireAuth, controllers.UpdateMoviePoster)
		Movie.POST("/upload/poster/:id", middleware.RequireAuth, controllers.UploadMoviePoster)
	}
}
