# Blue

A containerised service that provides real-time push notifications for Bluesky posts.

## Usage

1. Install Docker and Docker Compose
2. Clone or download the repository
3. Copy `example.env` to `.env` and fill in the empty values
4. Create a Firebase project with Cloud Messaging turned on
5. Place Firebase Admin SDK credentials in `server/firebase.json`
6. Place Firebase Web SDK credentials in `app/firebase.ts`
7. Run `docker compose build`
8. Run `docker compose up -d`

The service will now be running in the background. To make the service accessible from the outside on port 80, the following can be added to `app` in `docker-compose.yml`:

```yml
ports:
  - "80:3000"
```
