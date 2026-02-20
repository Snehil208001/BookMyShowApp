package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/Snehil208001/BookMyShowApp/controllers"
	"github.com/Snehil208001/BookMyShowApp/middleware"
)

func SeatRoutes(c *gin.Engine) {
	Seat := c.Group("/seats")
	{
		Seat.GET("/showtime/:id", controllers.GetSeatLayout)
		Seat.POST("/showtime/reserve", middleware.RequireAuth, controllers.ReserveSeats)
		Seat.POST("/showtime/book", middleware.RequireAuth, controllers.BookSeats)
	}
}
