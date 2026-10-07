const form = document.getElementById("bookForm");
const titleInput = document.getElementById("title");
const authorInput = document.getElementById("author");
const yearInput = document.getElementById("year");
const availableInput = document.getElementById("available");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const formTitle = document.getElementById("formTitle");
const message = document.getElementById("message");
const tableBody = document.getElementById("tableBody");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const availableFilter = document.getElementById("availableFilter");
const filterBtn = document.getElementById("filterBtn");
const showAllBtn = document.getElementById("showAllBtn");

let editId = null;
let currentUrl = "/books";

async function loadBooks(url)
{
  if (url)
  {
    currentUrl = url;
  }

  const response = await fetch(currentUrl);
  const books = await response.json();

  tableBody.innerHTML = "";

  if (!response.ok)
  {
    message.textContent = books.message;
    return;
  }

  books.forEach(function (b)
  {
    const row = document.createElement("tr");

    row.innerHTML =
      "<td>" + b.id + "</td>" +
      "<td>" + b.title + "</td>" +
      "<td>" + b.author + "</td>" +
      "<td>" + b.year + "</td>" +
      "<td>" + (b.available ? "Available" : "Borrowed") + "</td>" +
      "<td></td>";

    const actions = row.lastChild;

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", function ()
    {
      startEdit(b);
    });
    actions.appendChild(editBtn);

    const borrowBtn = document.createElement("button");

    if (b.available)
    {
      borrowBtn.textContent = "Borrow";
      borrowBtn.addEventListener("click", function ()
      {
        borrowBook(b.id);
      });
    }
    else
    {
      borrowBtn.textContent = "Return";
      borrowBtn.addEventListener("click", function ()
      {
        returnBook(b.id);
      });
    }

    actions.appendChild(borrowBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", function ()
    {
      deleteBook(b.id);
    });
    actions.appendChild(deleteBtn);

    tableBody.appendChild(row);
  });
}

function startEdit(b)
{
  editId = b.id;
  titleInput.value = b.title;
  authorInput.value = b.author;
  yearInput.value = b.year;
  availableInput.checked = b.available;
  formTitle.textContent = "Edit Book " + b.id;
  saveBtn.textContent = "Update";
  cancelBtn.classList.remove("hidden");
  message.textContent = "";
}

function resetForm()
{
  editId = null;
  form.reset();
  availableInput.checked = true;
  formTitle.textContent = "Add Book";
  saveBtn.textContent = "Add";
  cancelBtn.classList.add("hidden");
}

async function borrowBook(id)
{
  const response = await fetch("/books/" + id + "/borrow", { method: "PUT" });
  const result = await response.json();

  if (!response.ok)
  {
    message.textContent = result.message;
  }
  else
  {
    message.textContent = "";
  }

  loadBooks();
}

async function returnBook(id)
{
  await fetch("/books/" + id,
  {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ available: true })
  });

  message.textContent = "";
  loadBooks();
}

async function deleteBook(id)
{
  await fetch("/books/" + id, { method: "DELETE" });
  loadBooks();
}

form.addEventListener("submit", async function (event)
{
  event.preventDefault();

  const data =
  {
    title: titleInput.value,
    author: authorInput.value,
    year: yearInput.value === "" ? undefined : Number(yearInput.value),
    available: availableInput.checked
  };

  let url = "/books";
  let method = "POST";

  if (editId !== null)
  {
    url = "/books/" + editId;
    method = "PUT";
  }

  const response = await fetch(url,
  {
    method: method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await response.json();

  if (!response.ok)
  {
    message.textContent = result.message;
    return;
  }

  message.textContent = "";
  resetForm();
  loadBooks();
});

cancelBtn.addEventListener("click", function ()
{
  resetForm();
  message.textContent = "";
});

searchBtn.addEventListener("click", function ()
{
  message.textContent = "";
  const text = searchInput.value.trim();

  if (text === "")
  {
    loadBooks("/books");
  }
  else
  {
    loadBooks("/books/search?title=" + encodeURIComponent(text));
  }
});

filterBtn.addEventListener("click", function ()
{
  message.textContent = "";

  if (availableFilter.value === "")
  {
    loadBooks("/books");
  }
  else
  {
    loadBooks("/books?available=" + availableFilter.value);
  }
});

showAllBtn.addEventListener("click", function ()
{
  message.textContent = "";
  searchInput.value = "";
  availableFilter.value = "";
  loadBooks("/books");
});

loadBooks();
