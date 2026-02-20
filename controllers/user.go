package controllers

import (
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/golang-jwt/jwt/v5"
	"github.com/raunak173/bms-go/initializers"
	"github.com/raunak173/bms-go/models"
	"golang.org/x/crypto/bcrypt"
)

var validate = validator.New()

type UserRequestBody struct {
	Name        string `json:"name" validate:"required,min=2,max=50"`
	Email       string `json:"email" validate:"email,required"`
	Password    string `json:"password" validate:"required"`
	PhoneNumber string `json:"phone_number"` // Optional - no validation
}

func SignUp(c *gin.Context) {
	var body UserRequestBody

	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	if err := validate.Struct(body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errors": err.Error()})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(body.Password), 10)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash the password"})
		return
	}

	user := models.User{
		Name:        body.Name,
		Email:       body.Email,
		Password:    string(hash),
		PhoneNumber: body.PhoneNumber,
		IsAdmin:     false,
	}

	// Check if email already exists
	var existingUser models.User
	initializers.Db.Where("email = ?", body.Email).First(&existingUser)
	if existingUser.ID != 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email already exists"})
		return
	}

	result := initializers.Db.Create(&user)
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create the user", "details": result.Error.Error()})
		return
	}

	// Return the created user as a response
	c.JSON(http.StatusCreated, gin.H{
		"user": user,
	})
}

func Login(c *gin.Context) {
	var body struct {
		Email    string `json:"email" validate:"required,email"`
		Password string `json:"password" validate:"required,min=5"`
	}

	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	if err := validate.Struct(body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errors": err.Error()})
		return
	}

	var user models.User
	initializers.Db.Where("email = ?", body.Email).First(&user)

	if user.ID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email or password"})
		return
	}

	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.Password))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email or password"})
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": user.ID,                                   // Subject (User ID)
		"exp": time.Now().Add(time.Hour * 24 * 7).Unix(), // Token expiration time
	})

	tokenString, err := token.SignedString([]byte(os.Getenv("SECRET")))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create token"})
		return
	}

	// Set the token in a cookie (for web)
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("Authorization", tokenString, 3600*24*7, "", "", false, true)

	// Also return token in body for mobile apps (Bearer auth)
	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"user":    user,
		"token":   tokenString,
	})
}

func GetMe(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"user": user})
}

func Logout(c *gin.Context) {
	c.SetCookie("Authorization", "", -1, "", "", false, true)
	c.JSON(http.StatusOK, gin.H{"message": "Logged out"})
}
