Assignment: Library Books API

Run:
  npm install
  node server.js

Open http://localhost:3000 for the page, or test the routes in Postman.
In Postman: Import > postman_collection.json, then send each request and take a screenshot of the request and response.
Every request is saved in requests.log.

Routes:
  GET    /books
  GET    /books/:id
  GET    /books?available=true
  GET    /books/search?title=...
  POST   /books
  PUT    /books/:id
  PUT    /books/:id/borrow
  DELETE /books/:id
