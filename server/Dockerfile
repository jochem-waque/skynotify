FROM golang:1.24 AS build
WORKDIR /usr/src/app

COPY go.mod go.sum ./
RUN go mod download && go mod verify

COPY . .
RUN go build -v -o /usr/local/bin/app ./cmd


FROM golang:1.24
WORKDIR /app

COPY --from=build /usr/local/bin/app .
COPY firebase.json .

CMD ["./app"]