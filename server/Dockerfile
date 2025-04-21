# --------------------------------------
# 🔧 Build Stage
# --------------------------------------
FROM golang:1.24-alpine AS build

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

WORKDIR /app

COPY --from=build /app/main .

EXPOSE 8080

CMD ["./main"]
