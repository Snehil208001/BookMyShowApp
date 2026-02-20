package controllers

import (
	"testing"

	"github.com/gin-gonic/gin"
)

func init() {
	gin.SetMode(gin.TestMode)
}

func TestGetAllMovies_NoAuthRequired(t *testing.T) {
	// This test requires DB - skip if we can't connect
	// For unit testing without DB, we'd need to refactor for dependency injection
	t.Skip("Requires database connection - run with: go test -v -run Integration ./... when DB is available")
}

func TestMovieRequestBody_Validation(t *testing.T) {
	// Test validation rules for MovieRequestBody
	validBody := MovieRequestBody{
		Title:       "Test Movie",
		Description: "A test description",
		Duration:    "2h",
	}
	if err := validate.Struct(validBody); err != nil {
		t.Errorf("valid body should pass: %v", err)
	}

	invalidBody := MovieRequestBody{
		Title:       "A", // too short (min=2)
		Description: "",
		Duration:    "",
	}
	if err := validate.Struct(invalidBody); err == nil {
		t.Error("invalid body should fail validation")
	}
}

func TestVenueRequestBody_Validation(t *testing.T) {
	// Test validation rules for VenueRequestBody (from venue.go)
	validBody := VenueRequestBody{
		Name:     "Test Venue",
		Location: "Test City",
	}
	if err := validate.Struct(validBody); err != nil {
		t.Errorf("valid venue body should pass: %v", err)
	}

	invalidBody := VenueRequestBody{
		Name:     "",
		Location: "",
	}
	if err := validate.Struct(invalidBody); err == nil {
		t.Error("invalid venue body should fail validation")
	}
}
