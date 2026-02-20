package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/Snehil208001/BookMyShowApp/initializers"
	"github.com/Snehil208001/BookMyShowApp/models"
)

type OrderResponse struct {
	ID         uint     `json:"id"`
	TotalPrice float32  `json:"total_price"`
	Seats      []string `json:"seats"`
	MovieName  string   `json:"movie_name"`
	VenueName  string   `json:"venue_name"`
	Showtime   string   `json:"showtime"`
}

func GetOrders(c *gin.Context) {
	user, _ := c.Get("user")
	userDetails := user.(models.User)
	userId := userDetails.ID

	var orders []models.Order
	if err := initializers.Db.Where("user_id = ?", userId).
		Preload("Seats").
		Find(&orders).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No order found for the given id"})
		return
	}

	var orderResponses []OrderResponse
	for _, order := range orders {
		var seatNumbers []string
		for _, seat := range order.Seats {
			seatNumbers = append(seatNumbers, seat.SeatNumber)
		}
		movieName, venueName, showtime := "", "", ""
		var st models.ShowTime
		if err := initializers.Db.Preload("Venue").Preload("Movie").First(&st, order.ShowTimeID).Error; err == nil {
			showtime = st.Timing
			if st.Venue.ID != 0 {
				venueName = st.Venue.Name + " - " + st.Venue.Location
			}
			if st.Movie.ID != 0 {
				movieName = st.Movie.Title
			}
		}
		orderResponses = append(orderResponses, OrderResponse{
			ID:         order.ID,
			TotalPrice: order.TotalPrice,
			Seats:      seatNumbers,
			MovieName:  movieName,
			VenueName:  venueName,
			Showtime:   showtime,
		})
	}

	c.JSON(200, gin.H{
		"orders": orderResponses,
	})
}
