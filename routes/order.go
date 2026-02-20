package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/Snehil208001/BookMyShowApp/controllers"
	"github.com/Snehil208001/BookMyShowApp/middleware"
)

func OrderRoutes(c *gin.Engine) {
	Order := c.Group("/orders")
	{
		Order.GET("/", middleware.RequireAuth, controllers.GetOrders)
	}
}
