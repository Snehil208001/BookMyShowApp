package initializers

import "github.com/Snehil208001/BookMyShowApp/models"

func SyncDB() {
	Db.AutoMigrate(
		&models.Movie{},
		&models.User{},
		&models.Venue{},
		&models.ShowTime{},
		&models.Seat{},
		&models.Order{},
	)
}
