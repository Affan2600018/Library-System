const express = require("express");
const path = require("path");
const { loadBooks, saveBooks } = require("./bookStore");
const logRequest = require("./logger");

const app = express();

app.use(logRequest);
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function getNextId(books)
{
  if (books.length === 0)
  {
    return 1;
  }

  return Math.max(...books.map(x => x.id)) + 1;
}

function validateBook(book)
{
  if (typeof book.title !== "string" || book.title.trim() === "")
  {
    return "title is required";
  }

  if (typeof book.author !== "string" || book.author.trim() === "")
  {
    return "author is required";
  }

  if (typeof book.year !== "number" || !Number.isInteger(book.year) || book.year < 1900 || book.year > 2026)
  {
    return "year must be a number between 1900 and 2026";
  }

  if (typeof book.available !== "boolean")
  {
    return "available must be true or false";
  }

  return null;
}

app.get("/books", (req, res) =>
{
  let books = loadBooks();

  if (req.query.available !== undefined)
  {
    if (req.query.available !== "true" && req.query.available !== "false")
    {
      return res.status(400).json({ message: "available must be true or false" });
    }

    const wanted = req.query.available === "true";
    books = books.filter(x => x.available === wanted);
  }

  res.json(books);
});

app.get("/books/search", (req, res) =>
{
  const title = req.query.title;

  if (!title)
  {
    return res.status(400).json({ message: "title query is required" });
  }

  const books = loadBooks();
  const result = books.filter(x => x.title.toLowerCase().includes(title.toLowerCase()));

  res.json(result);
});

app.get("/books/:id", (req, res) =>
{
  const id = Number(req.params.id);
  const books = loadBooks();
  const book = books.find(x => x.id === id);

  if (!book)
  {
    return res.status(404).json({ message: "Book not found" });
  }

  res.json(book);
});

app.post("/books", (req, res) =>
{
  const body = req.body || {};

  const newBook =
  {
    title: body.title,
    author: body.author,
    year: body.year,
    available: body.available === undefined ? true : body.available
  };

  const error = validateBook(newBook);

  if (error)
  {
    return res.status(400).json({ message: error });
  }

  const books = loadBooks();

  const book =
  {
    id: getNextId(books),
    title: newBook.title.trim(),
    author: newBook.author.trim(),
    year: newBook.year,
    available: newBook.available
  };

  books.push(book);
  saveBooks(books);
  res.status(201).json(book);
});

app.put("/books/:id/borrow", (req, res) =>
{
  const id = Number(req.params.id);
  const books = loadBooks();
  const book = books.find(x => x.id === id);

  if (!book)
  {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!book.available)
  {
    return res.status(400).json({ message: "Book is already borrowed" });
  }

  book.available = false;
  saveBooks(books);
  res.json(book);
});

app.put("/books/:id", (req, res) =>
{
  const id = Number(req.params.id);
  const books = loadBooks();
  const book = books.find(x => x.id === id);

  if (!book)
  {
    return res.status(404).json({ message: "Book not found" });
  }

  const body = req.body || {};

  const updated =
  {
    title: body.title !== undefined ? body.title : book.title,
    author: body.author !== undefined ? body.author : book.author,
    year: body.year !== undefined ? body.year : book.year,
    available: body.available !== undefined ? body.available : book.available
  };

  const error = validateBook(updated);

  if (error)
  {
    return res.status(400).json({ message: error });
  }

  book.title = updated.title.trim();
  book.author = updated.author.trim();
  book.year = updated.year;
  book.available = updated.available;

  saveBooks(books);
  res.json(book);
});

app.delete("/books/:id", (req, res) =>
{
  const id = Number(req.params.id);
  const books = loadBooks();
  const book = books.find(x => x.id === id);

  if (!book)
  {
    return res.status(404).json({ message: "Book not found" });
  }

  saveBooks(books.filter(x => x.id !== id));
  res.json({ message: "Deleted" });
});

app.use((err, req, res, next) =>
{
  res.status(400).json({ message: "Invalid JSON data" });
});

app.listen(3000, () =>
{
  console.log("Server running on http://localhost:3000");
});
