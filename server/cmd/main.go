package main

import (
	"github.com/gin-gonic/gin"
)

func main() {
	// Create a new Gin router
	r := gin.Default()

	// Define a simple route
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Hello, World!",
		})
	})

	// Start the server on port 8080
	r.Run(":8080")
}
