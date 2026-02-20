package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/Snehil208001/BookMyShowApp/helpers"
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

	log.Println("Seeding database...")

	// 1. Create test user
	hash, _ := bcrypt.GenerateFromPassword([]byte("password123"), 10)
	user := models.User{
		Name:     "Test User",
		Email:    "test@example.com",
		Password: string(hash),
		IsAdmin:  false,
	}
	if err := db.Where("email = ?", user.Email).First(&models.User{}).Error; err == gorm.ErrRecordNotFound {
		db.Create(&user)
		log.Println("Created test user: test@example.com / password123")
	} else {
		log.Println("Test user already exists")
	}

	// 2. Create admin user
	adminHash, _ := bcrypt.GenerateFromPassword([]byte("admin123"), 10)
	admin := models.User{
		Name:     "Admin",
		Email:    "admin@example.com",
		Password: string(adminHash),
		IsAdmin:  true,
	}
	if err := db.Where("email = ?", admin.Email).First(&models.User{}).Error; err == gorm.ErrRecordNotFound {
		db.Create(&admin)
		log.Println("Created admin: admin@example.com / admin123")
	}

	// 3. Create movies with posters (TMDB + reliable fallbacks for broken URLs)
	movies := []models.Movie{
		{Title: "Inception", Description: "A mind-bending thriller about dreams within dreams. A thief who steals corporate secrets through dream-sharing technology.", Duration: "2h 28m", Poster: "https://image.tmdb.org/t/p/w500/1E5baAaEse26fej7uHcjOgEE2t2.jpg"},
		{Title: "The Dark Knight", Description: "Batman faces the Joker in Gotham City. Chaos and order collide in this epic superhero film.", Duration: "2h 32m", Poster: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg"},
		{Title: "Interstellar", Description: "A team of explorers travel through a wormhole in space in search of a new home for humanity.", Duration: "2h 49m", Poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"},
		{Title: "Avengers: Endgame", Description: "The Avengers assemble once more to reverse Thanos' snap and restore the universe.", Duration: "3h 1m", Poster: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg"},
		{Title: "Dune", Description: "A noble family becomes embroiled in a war for control of the galaxy's most valuable asset.", Duration: "2h 35m", Poster: "https://m.media-amazon.com/images/M/MV5BOTEwYWFjYmItZWJmNi00MGExLWI1MjktYzRiYjJkNzhiMWIxXkEyXkFqcGdeQXNuZXNodQ@@._V1_SX300.jpg"},
		{Title: "Oppenheimer", Description: "The story of J. Robert Oppenheimer and his role in the development of the atomic bomb.", Duration: "3h 0m", Poster: "https://m.media-amazon.com/images/M/MV5BMDBmYTZjNjUtN2M1MS00MTQ2LTk2ODgtNzc2M2QyZGE5NTVjXkEyXkFqcGdeQXVyNzAwMjU2MTY@._V1_SX300.jpg"},
		{Title: "Spider-Man: No Way Home", Description: "Peter Parker's identity is revealed to the world, leading to multiverse chaos.", Duration: "2h 28m", Poster: "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg"},
		{Title: "Top Gun: Maverick", Description: "After thirty years, Maverick is still pushing the envelope as a top naval aviator.", Duration: "2h 10m", Poster: "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg"},
	}
	for _, m := range movies {
		var existing models.Movie
		if db.Where("title = ?", m.Title).First(&existing).Error == gorm.ErrRecordNotFound {
			db.Create(&m)
			log.Println("Created movie:", m.Title)
		} else {
			db.Model(&existing).Update("poster", m.Poster)
		}
	}

	// 4. Create venues
	venues := []models.Venue{
		{Name: "PVR Cinemas", Location: "Mumbai"},
		{Name: "INOX", Location: "Delhi"},
		{Name: "Cinepolis", Location: "Bangalore"},
	}
	for _, v := range venues {
		var existing models.Venue
		if db.Where("name = ? AND location = ?", v.Name, v.Location).First(&existing).Error == gorm.ErrRecordNotFound {
			db.Create(&v)
			log.Println("Created venue:", v.Name, "-", v.Location)
		}
	}

	// 5. Link movies to venues and add showtimes
	var inception models.Movie
	var pvr models.Venue
	db.Where("title = ?", "Inception").First(&inception)
	db.Where("name = ?", "PVR Cinemas").First(&pvr)

	if inception.ID != 0 && pvr.ID != 0 {
		db.Model(&pvr).Association("Movies").Append(&inception)

		var count int64
		db.Model(&models.ShowTime{}).Where("movie_id = ? AND venue_id = ?", inception.ID, pvr.ID).Count(&count)
		if count == 0 {
			showtimes := []string{"10:00", "14:00", "18:00", "21:00"}
			for _, t := range showtimes {
				st := models.ShowTime{Timing: t, MovieID: inception.ID, VenueID: pvr.ID}
				db.Create(&st)
				seats := helpers.GenerateSeatsForShowTime(st.ID)
				db.Create(&seats)
			}
			log.Println("Added showtimes for Inception at PVR Cinemas")
		}
	}

	// Add Dark Knight to both venues
	var darkKnight models.Movie
	var inox models.Venue
	db.Where("title = ?", "The Dark Knight").First(&darkKnight)
	db.Where("name = ?", "INOX").First(&inox)

	if darkKnight.ID != 0 && pvr.ID != 0 {
		db.Model(&pvr).Association("Movies").Append(&darkKnight)
		var count int64
		db.Model(&models.ShowTime{}).Where("movie_id = ? AND venue_id = ?", darkKnight.ID, pvr.ID).Count(&count)
		if count == 0 {
			for _, t := range []string{"11:00", "15:00", "19:00"} {
				st := models.ShowTime{Timing: t, MovieID: darkKnight.ID, VenueID: pvr.ID}
				db.Create(&st)
				db.Create(helpers.GenerateSeatsForShowTime(st.ID))
			}
			log.Println("Added showtimes for The Dark Knight at PVR Cinemas")
		}
	}

	if darkKnight.ID != 0 && inox.ID != 0 {
		db.Model(&inox).Association("Movies").Append(&darkKnight)
		var count int64
		db.Model(&models.ShowTime{}).Where("movie_id = ? AND venue_id = ?", darkKnight.ID, inox.ID).Count(&count)
		if count == 0 {
			for _, t := range []string{"12:00", "16:00", "20:00"} {
				st := models.ShowTime{Timing: t, MovieID: darkKnight.ID, VenueID: inox.ID}
				db.Create(&st)
				db.Create(helpers.GenerateSeatsForShowTime(st.ID))
			}
			log.Println("Added showtimes for The Dark Knight at INOX")
		}
	}

	// Add Interstellar, Avengers, Dune, Oppenheimer, Spider-Man, Top Gun to venues
	var interstellar, avengers, dune, oppenheimer, spiderman, topgun models.Movie
	var cinepolis models.Venue
	db.Where("title = ?", "Interstellar").First(&interstellar)
	db.Where("title = ?", "Avengers: Endgame").First(&avengers)
	db.Where("title = ?", "Dune").First(&dune)
	db.Where("title = ?", "Oppenheimer").First(&oppenheimer)
	db.Where("title = ?", "Spider-Man: No Way Home").First(&spiderman)
	db.Where("title = ?", "Top Gun: Maverick").First(&topgun)
	db.Where("name = ?", "Cinepolis").First(&cinepolis)

	for _, pair := range []struct {
		movie *models.Movie
		venue *models.Venue
		times []string
	}{
		{&interstellar, &pvr, []string{"09:00", "13:00", "17:00"}},
		{&interstellar, &cinepolis, []string{"11:00", "15:00", "20:00"}},
		{&avengers, &pvr, []string{"10:30", "14:30", "19:00"}},
		{&avengers, &inox, []string{"11:30", "15:30", "20:00"}},
		{&dune, &inox, []string{"12:00", "16:00", "21:00"}},
		{&dune, &cinepolis, []string{"14:00", "18:00", "22:00"}},
		{&oppenheimer, &pvr, []string{"10:00", "14:00", "19:30"}},
		{&oppenheimer, &inox, []string{"11:00", "15:00", "20:00"}},
		{&spiderman, &pvr, []string{"12:30", "16:30", "21:00"}},
		{&spiderman, &cinepolis, []string{"13:00", "17:00", "21:30"}},
		{&topgun, &inox, []string{"09:30", "13:30", "18:00"}},
		{&topgun, &cinepolis, []string{"10:30", "14:30", "19:00"}},
	} {
		if pair.movie.ID != 0 && pair.venue.ID != 0 {
			db.Model(pair.venue).Association("Movies").Append(pair.movie)
			var c int64
			db.Model(&models.ShowTime{}).Where("movie_id = ? AND venue_id = ?", pair.movie.ID, pair.venue.ID).Count(&c)
			if c == 0 {
				for _, t := range pair.times {
					st := models.ShowTime{Timing: t, MovieID: pair.movie.ID, VenueID: pair.venue.ID}
					db.Create(&st)
					db.Create(helpers.GenerateSeatsForShowTime(st.ID))
				}
				log.Println("Added showtimes for", pair.movie.Title, "at", pair.venue.Name)
			}
		}
	}

	log.Println("Seed complete! You can now:")
	log.Println("  - Login: test@example.com / password123")
	log.Println("  - Admin: admin@example.com / admin123")
}
