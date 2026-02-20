package helpers

import (
	"testing"
	"time"

	"github.com/raunak173/bms-go/models"
)

func TestGenerateSeatsForShowTime(t *testing.T) {
	seats := GenerateSeatsForShowTime(1)

	expectedCount := 5 * 10 // 5 rows, 10 seats per row
	if len(seats) != expectedCount {
		t.Errorf("expected %d seats, got %d", expectedCount, len(seats))
	}

	// Check first and last seat
	if seats[0].SeatNumber != "A1" {
		t.Errorf("expected first seat A1, got %s", seats[0].SeatNumber)
	}
	if seats[len(seats)-1].SeatNumber != "E10" {
		t.Errorf("expected last seat E10, got %s", seats[len(seats)-1].SeatNumber)
	}

	// All seats should be available initially
	for i, seat := range seats {
		if !seat.IsAvailable || seat.IsReserved || seat.IsBooked {
			t.Errorf("seat %d (%s) should be available: IsAvailable=%v IsReserved=%v IsBooked=%v",
				i, seat.SeatNumber, seat.IsAvailable, seat.IsReserved, seat.IsBooked)
		}
		if seat.Price != 250 {
			t.Errorf("seat %s expected price 250, got %f", seat.SeatNumber, seat.Price)
		}
		if seat.ShowTimeID != 1 {
			t.Errorf("seat %s expected ShowTimeID 1, got %d", seat.SeatNumber, seat.ShowTimeID)
		}
	}
}

func TestCreateSeatMatrix(t *testing.T) {
	seats := []models.Seat{
		{SeatNumber: "A1", IsAvailable: true, IsReserved: false, IsBooked: false, Price: 250},
		{SeatNumber: "A2", IsAvailable: false, IsReserved: true, IsBooked: false, Price: 250},
		{SeatNumber: "B1", IsAvailable: true, IsReserved: false, IsBooked: false, Price: 300},
	}

	matrix := CreateSeatMatrix(seats)

	if len(matrix["A"]) != 2 {
		t.Errorf("expected 2 seats in row A, got %d", len(matrix["A"]))
	}
	if len(matrix["B"]) != 1 {
		t.Errorf("expected 1 seat in row B, got %d", len(matrix["B"]))
	}

	// Check A1 data (matrix["A"][0] is already map[string]interface{})
	a1 := matrix["A"][0]
	if a1["seat_number"] != "A1" {
		t.Errorf("expected seat_number A1, got %v", a1["seat_number"])
	}
	if p, ok := a1["price"].(float32); !ok || p != 250 {
		t.Errorf("expected price 250, got %v", a1["price"])
	}

	// Check A2 is reserved
	a2 := matrix["A"][1]
	if a2["is_reserved"] != true {
		t.Errorf("expected A2 to be reserved, got %v", a2["is_reserved"])
	}
}

func TestCreateSeatMatrix_EmptySeatNumber(t *testing.T) {
	// Edge case: empty seat number - should skip without panic
	seats := []models.Seat{
		{SeatNumber: "", IsAvailable: true, IsReserved: false, IsBooked: false, Price: 250},
		{SeatNumber: "A1", IsAvailable: true, IsReserved: false, IsBooked: false, Price: 250},
	}
	matrix := CreateSeatMatrix(seats)
	// Empty seat should be skipped, only A1 should appear
	if len(matrix) != 1 || len(matrix["A"]) != 1 {
		t.Errorf("expected 1 row with 1 seat, got %v", matrix)
	}
}

func TestFormatShowTime(t *testing.T) {
	tm, _ := time.Parse("15:04", "15:04")
	result := FormatShowTime(tm)
	if result != "15:04" {
		t.Errorf("expected 15:04, got %s", result)
	}
}
