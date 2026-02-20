package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/Snehil208001/BookMyShowApp/helpers"
	"github.com/Snehil208001/BookMyShowApp/initializers"
	"github.com/Snehil208001/BookMyShowApp/models"
)

func GetAllMovies(c *gin.Context) {
	var movies []models.Movie
	limit := 5
	l := c.Query("limit")
	if l != "" {
		parsedLimit, err := strconv.Atoi(l)
		if err == nil {
			limit = parsedLimit
		}
	}
	offset := 0
	o := c.Query("offset")
	if o != "" {
		parsedOffset, err := strconv.Atoi(o)
		if err == nil {
			offset = parsedOffset
		}
	}
	name := ""
	n := c.Query("name")
	if n != "" {
		name = n
	}
	query := initializers.Db.Model(&models.Movie{})
	if name != "" {
		query = query.Where("title ILIKE ?", "%"+name+"%") // ILIKE for case-insensitive search
	}
	// Now my query will have movies with particular name only, now we will add pagination on that query only
	sort := "asc"
	s := c.Query("sort")
	if s == "desc" {
		sort = "desc"
	}

	var totalMovies int64
	query.Count(&totalMovies)
	//We will count total movies also relevant to the query

	query.Limit(limit).Offset(offset).Order("title " + sort).Find(&movies)
	// query.Limit(limit).Offset(offset).Find(&movies)
	nextOffset := offset + limit
	if nextOffset >= int(totalMovies) {
		nextOffset = -1 // No more movies to load
	}
	c.JSON(200, gin.H{
		"movies":       movies,
		"total_movies": totalMovies,
		"next_offset":  nextOffset,
	})
}

type MovieRequestBody struct {
	Title       string `json:"title" validate:"required,min=2,max=50"`
	Description string `json:"desc" validate:"required"`
	Duration    string `json:"duration" validate:"required"`
	Poster      string `json:"poster"`
}

func CreateMovie(c *gin.Context) {
	var body MovieRequestBody
	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	if err := validate.Struct(body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errors": err.Error()})
		return
	}
	//We are checking we are authorized or not
	user, _ := c.Get("user")
	//We get userDetails, because we need to check that we are admin or not
	userDetails := user.(models.User)
	if !userDetails.IsAdmin {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized, admin access required"})
		return
	}
	movie := models.Movie{
		Title:       body.Title,
		Description: body.Description,
		Duration:    body.Duration,
		Poster:      body.Poster,
	}
	result := initializers.Db.Create(&movie)
	if result.Error != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	c.JSON(http.StatusCreated, gin.H{
		"movie": movie,
	})
}

func GetMovieByID(c *gin.Context) {
	movieID := c.Param("id")
	var movie models.Movie
	if err := initializers.Db.Preload("Venues").First(&movie, movieID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Movie not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"movie": movie,
	})
}

type UpdateMovieBody struct {
	Poster string `json:"poster"`
}

func UpdateMoviePoster(c *gin.Context) {
	user, _ := c.Get("user")
	userDetails := user.(models.User)
	if !userDetails.IsAdmin {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized, admin access required"})
		return
	}
	movieID := c.Param("id")
	var body UpdateMovieBody
	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	var movie models.Movie
	if err := initializers.Db.First(&movie, movieID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Movie not found"})
		return
	}
	movie.Poster = body.Poster
	if err := initializers.Db.Save(&movie).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update poster"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"movie": movie})
}

type VenueWithShowTimes struct {
	VenueID   uint              `json:"venue_id"`
	VenueName string            `json:"venue_name"`
	ShowTimes []models.ShowTime `json:"show_times"`
}

func GetVenuesByMovieID(c *gin.Context) {
	movieID := c.Param("id")
	var showTimes []models.ShowTime
	/// Retrieve the show times for the given movie ID, preloading the associated venue and movie
	if err := initializers.Db.Preload("Venue").Preload("Movie").Where("movie_id = ?", movieID).Find(&showTimes).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No showtimes found for this movie"})
		return
	}
	// Create a map to club venues with their show times
	//Creating a map of venueId : object
	venueMap := make(map[uint]gin.H)
	for _, showTime := range showTimes {
		venueID := showTime.Venue.ID
		showTimeObj := gin.H{"id": showTime.ID, "timing": showTime.Timing}
		if venue, exists := venueMap[venueID]; exists {
			existingTimes, ok := venue["show_times"].([]gin.H)
			if !ok {
				existingTimes = []gin.H{}
			}
			venue["show_times"] = append(existingTimes, showTimeObj)
		} else {
			venueMap[venueID] = gin.H{
				"id":         showTime.Venue.ID,
				"name":       showTime.Venue.Name,
				"location":   showTime.Venue.Location,
				"movie_name": showTime.Movie.Title,
				"show_times": []gin.H{showTimeObj},
			}
		}
	}
	// Convert the map to a list for the response
	var venues []gin.H
	for _, venue := range venueMap {
		venues = append(venues, venue)
	}
	c.JSON(http.StatusOK, gin.H{
		"venues": venues,
	})
}

func UploadMoviePoster(c *gin.Context) {
	user, _ := c.Get("user")
	//We get userDetails, because we need to check that we are admin or not
	userDetails := user.(models.User)
	if !userDetails.IsAdmin {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized, admin access required"})
		return
	}
	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// Get the file headers
	// Check if the "poster" key exists and has at least one file
	files, exists := form.File["poster"]
	if !exists || len(files) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded under 'poster' key"})
		return
	}
	// Save the first file in the form (assuming single file upload)
	fileHeader := files[0]
	f, err := fileHeader.Open()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error opening file"})
		return
	}
	defer f.Close()
	uploadedURL, err := helpers.SaveFile(f, fileHeader)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error saving file"})
		return
	}
	// Retrieve the movie ID from the form (assuming it's passed as "movie_id")
	movieID := c.Param("id")
	var movie models.Movie
	if err := initializers.Db.First(&movie, "id = ?", movieID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Movie not found"})
		return
	}

	// Update the Movie's Poster field with the uploaded URL
	movie.Poster = uploadedURL
	if err := initializers.Db.Save(&movie).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save movie poster URL"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"url": uploadedURL,
	})
}
