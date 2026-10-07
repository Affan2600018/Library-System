const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "books.json");

function loadBooks()
{
  if (!fs.existsSync(file))
  {
    return [];
  }

  const text = fs.readFileSync(file, "utf8");

  if (text.trim() === "")
  {
    return [];
  }

  return JSON.parse(text);
}

function saveBooks(books)
{
  fs.writeFileSync(file, JSON.stringify(books, null, 2));
}

module.exports = { loadBooks, saveBooks };
