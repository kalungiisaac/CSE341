# How to run it

Run npm install and npm start from the project root in the terminal.

Visit http://localhost:8080/api-docs to see the Swagger API documentation.

Run frontend/index.html with live server or just paste the file path into a browser.

## Environment variables

Don't forget to create the .env file. If you are unsure of how to do this, watch the stretch solution video.

### Deploying the frontend (GitHub Pages / Static hosts)

The frontend is a static site. If the API/backend is hosted separately (recommended), the frontend must be configured to call that API URL when deployed.

One simple approach is to inject a small runtime variable in your deployed index.html before the app's script bundle. Example (insert before the main bundle script tag):

<script>window.__API_URL__ = 'https://your-backend.example.com';</script>

The frontend will use window.__API_URL__ when present. During local development the app will still use http://localhost:8080 by default.

If you build the app using a bundler that supports environment variables (for example Create React App), you can instead set REACT_APP_API_URL at build time and reference it in the code.

### Video Walkthrough

[Video Explanation of Stretch Assignment](https://youtu.be/S25ggtvC4AM)
