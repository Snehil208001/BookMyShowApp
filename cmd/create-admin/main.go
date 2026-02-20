package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/Snehil208001/BookMyShowApp/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}

	dsn := os.Getenv("DB_URL")
	if dsn == "" {
		log.Fatal("DB_URL not set in .env")
	}
	db, err := gorm.Open(postgres.Open(dsn))
	if err != nil {
		log.Fatal("Error connecting to DB:", err)
	}

	email := "snehil123@gmail.com"
	password := "123456"

	hash, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	if err != nil {
		log.Fatal("Error hashing password:", err)
	}

	admin := models.User{
		Name:     "Admin",
		Email:    email,
		Password: string(hash),
		IsAdmin:  true,
	}

	var existing models.User
	if err := db.Where("email = ?", email).First(&existing).Error; err == nil {
		// User exists - update to admin
		db.Model(&existing).Updates(map[string]interface{}{
			"password": string(hash),
			"is_admin": true,
		})
		log.Printf("Updated existing user to admin: %s / %s\n", email, password)
	} else {
		db.Create(&admin)
		log.Printf("Created admin: %s / %s\n", email, password)
	}
}
