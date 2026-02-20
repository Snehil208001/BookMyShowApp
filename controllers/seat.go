package controllers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/Snehil208001/BookMyShowApp/helpers"
	"github.com/Snehil208001/BookMyShowApp/initializers"
	"github.com/Snehil208001/BookMyShowApp/models"
	"gorm.io/gorm/clause"
)

func GetSeatLayout(c *gin.Context) {
	showtimeID := c.Param("id")
	// Fetch the showtime with venue and movie
	var showTime models.ShowTime
	if err := initializers.Db.Preload("Seats").Preload("Venue").Preload("Movie").First(&showTime, showtimeID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ShowTime not found"})
		return
	}
	// If seats are fetched successfully, convert to a matrix format based on row and seat number
	seatMatrix := helpers.CreateSeatMatrix(showTime.Seats)

	venueName := ""
	movieName := ""
	if showTime.Venue.ID != 0 {
		venueName = showTime.Venue.Name + " - " + showTime.Venue.Location
	}
	if showTime.Movie.ID != 0 {
		movieName = showTime.Movie.Title
	}

	c.JSON(http.StatusOK, gin.H{
		"showtime":   showTime.Timing,
		"venue":      showTime.VenueID,
		"venue_name": venueName,
		"movie_name": movieName,
		"seats":      seatMatrix,
	})
}

func ReserveSeats(c *gin.Context) {
	user, _ := c.Get("user")
	userDetails := user.(models.User)
	userID := userDetails.ID

	var request struct {
		ShowID uint   `json:"show_id"`
		Seats  []uint `json:"seat_ids"`
	}
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Check for unique seat ids
	uniqueIDs := make(map[uint]bool)
	for _, id := range request.Seats {
		if uniqueIDs[id] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Duplicate seat IDs found"})
			return
		}
		uniqueIDs[id] = true
	}

	// Start a GORM transaction
	tx := initializers.Db.Begin()

	reservedAt := time.Now()

	// Reserve seats
	for _, seatID := range request.Seats {
		var seat models.Seat
		// Use FOR UPDATE to lock the seat row until transaction is complete
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
			Where("id = ? AND show_time_id = ?", seatID, request.ShowID).
			First(&seat).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusNotFound, gin.H{"error": "Seat not found"})
			return
		}
		// Check if the seat is available
		if !seat.IsAvailable || seat.IsReserved || seat.IsBooked {
			tx.Rollback()
			c.JSON(http.StatusConflict, gin.H{"error": "Seat is already booked or reserved"})
			return
		}

		// Reserve the seat and link to current user
		seat.IsReserved = true
		seat.IsAvailable = false
		seat.ReservedByUserID = &userID
		seat.ReservedAt = &reservedAt
		if err := tx.Save(&seat).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to reserve seat"})
			return
		}
	}

	// Commit the transaction
	tx.Commit()

	// Schedule a job to unreserve the seats after 10 minutes (per README)
	go helpers.UnReserveSeats(request.Seats, 10*time.Minute)

	c.JSON(http.StatusOK, gin.H{"message": "Seats reserved successfully for 10 minutes"})
}

// BookSeats function to book reserved seats
func BookSeats(c *gin.Context) {
	var request struct {
		ShowID uint   `json:"show_id"`
		Seats  []uint `json:"seat_ids"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Check for unique seat ids
	uniqueIDs := make(map[uint]bool)
	for _, id := range request.Seats {
		if uniqueIDs[id] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Duplicate seat IDs found"})
			return
		}
		uniqueIDs[id] = true
	}

	//We are checking we are authorized or not
	user, _ := c.Get("user")
	userDetails := user.(models.User)
	userId := userDetails.ID

	// Start a GORM transaction
	tx := initializers.Db.Begin()

	// Check if the seats are reserved and still valid
	var totalPrice float32
	var seats []models.Seat

	for _, seatID := range request.Seats {
		var seat models.Seat
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
			Where("id = ? AND show_time_id = ?", seatID, request.ShowID).
			First(&seat).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusNotFound, gin.H{"error": "Seat not found"})
			return
		}

		// Check if the seat is reserved and not yet booked
		if !seat.IsReserved || seat.IsBooked {
			tx.Rollback()
			c.JSON(http.StatusConflict, gin.H{"error": "Seat is not reserved or reservation expired"})
			return
		}

		// Only the user who reserved can book
		if seat.ReservedByUserID == nil || *seat.ReservedByUserID != userId {
			tx.Rollback()
			c.JSON(http.StatusForbidden, gin.H{"error": "You can only book seats you reserved"})
			return
		}

		// Add seat price to total
		totalPrice += seat.Price

		// Append seat to the list
		seats = append(seats, seat)
	}

	// Create an order
	order := models.Order{
		UserID:     userId,
		ShowTimeID: request.ShowID,
		TotalPrice: totalPrice,
		Seats:      seats,
	}

	if err := tx.Create(&order).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to create order"})
		return
	}

	// Mark the seats as booked and no longer reserved
	for i := range seats {
		seats[i].IsBooked = true
		seats[i].IsReserved = false
		if err := tx.Save(&seats[i]).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to book seat"})
			return
		}
	}

	// Commit the transaction
	tx.Commit()

	c.JSON(http.StatusOK, gin.H{
		"message":     "Seats booked successfully",
		"order_id":    order.ID,
		"total_price": totalPrice,
	})
}
