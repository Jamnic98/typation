# --------------------------------------
# 🔧 Build Stage
# --------------------------------------
FROM golang:1.24-alpine AS build

# Set the working directory
WORKDIR /app

# Copy Go module files and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the application
COPY . .

# Build the Go binary
RUN go build -o main ./cmd


# --------------------------------------
# 🚀 Production Stage
# --------------------------------------
FROM alpine:3.21

# Create a working directory
WORKDIR /app

# Copy the compiled binary from the build stage
COPY --from=build /app/main .

# Expose the application port
EXPOSE 8080

# Start the app
CMD ["./main"]
