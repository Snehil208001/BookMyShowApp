package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Name        string `json:"name" gorm:"not null" validate:"required,min=2,max=50"`
	Email       string `json:"email" gorm:"not null;unique" validate:"email,required"`
	Password    string `json:"-" gorm:"not null" validate:"required"` // Never expose in API responses
	PhoneNumber string `json:"phone_number"` // Optional - not used when OTP is disabled
	Otp         string `json:"-"` // Internal use only, never expose
	IsAdmin     bool   `json:"isAdmin"`
}
