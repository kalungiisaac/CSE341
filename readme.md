# How to run it

Run npm install and npm start from the project root in the terminal.

Visit http://localhost:8080/api-docs to see the Swagger API documentation.

Run frontend/index.html with live server or just paste the file path into a browser.

## Environment variables

Don't forget to create the .env file. If you are unsure of how to do this, watch the stretch solution video.

### Video Walkthrough

[Video Explanation of Stretch Assignment](https://youtu.be/S25ggtvC4AM)

## Project Status (W04 Part 2)

- **CRUD implemented:** `contacts` and `professional` collections have GET, POST, PUT, DELETE routes.
- **Validation:** POST and PUT routes validate input and return `400` on bad input.
- **Error handling:** All routes use try/catch and return `400`/`500` as appropriate.
- **API docs:** Swagger exposed at `/api-docs` via `swagger.json`, including authentication endpoints.
- **Authentication:** GitHub OAuth login/logout is available through `/auth/login` and `/auth/logout`, and write routes now require authentication.

Create a `.env` file locally with your MongoDB connection string and GitHub OAuth credentials before running the server. See `.env.example`.
