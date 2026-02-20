package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/Snehil208001/BookMyShowApp/controllers"
	"github.com/Snehil208001/BookMyShowApp/middleware"
)

func UserRoutes(c *gin.Engine) {
	User := c.Group("/user")
	{
		User.POST("/login", controllers.Login)
		User.POST("/signup", controllers.SignUp)
		User.GET("/me", middleware.RequireAuth, controllers.GetMe)
		User.POST("/logout", middleware.RequireAuth, controllers.Logout)
	}
}
