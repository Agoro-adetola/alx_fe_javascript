const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";
let quotes = JSON.parse(localStorage.getItem("quotes")) || [];

// DOM Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const categorySelect = document.getElementById("categorySelect");
const categoryFilter = document.getElementById("categoryFilter");
const filteredQuotes = document.getElementById("filteredQuotes");
const newQuoteBtn = document.getElementById("newQuote");
const manualSyncBtn = document.getElementById("manualSyncBtn");

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Notify user
function notifyUser(message) {
  const notice = document.createElement("div");
  notice.textContent = message;
  notice.className = "notice";
  notice.style.background = "#fffae6";
  notice.style.border = "1px solid #ffd700";
  notice.style.padding = "0.5rem";
  notice.style.marginTop = "1rem";
  document.body.insertBefore(notice, document.body.firstChild);
  setTimeout(() => notice.remove(), 5000);
}

// Merge quotes (server wins on conflict)
function mergeQuotes(serverQuotes, localQuotes) {
  const map = new Map();
  serverQuotes.forEach(q => map.set(q.text, q));
  localQuotes.forEach(q => {
    if (!map.has(q.text)) {
      map.set(q.text, q);
    }
  });
  return Array.from(map.values());
}

// Fetch quotes from server (mock API)
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverPosts = await response.json();

    // Convert posts to quote format
    const serverQuotes = serverPosts.slice(0, 10).map(post => ({
      text: post.title,
      category: "Placeholder"
    }));

    return serverQuotes;
  } catch (error) {
    console.error("Error fetching from server:", error);
    notifyUser("Failed to fetch quotes from server.");
    return [];
  }
}

// Sync quotes with server
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  const localQuotes = JSON.parse(localStorage.getItem("quotes")) || [];
  const mergedQuotes = mergeQuotes(serverQuotes, localQuotes);

  localStorage.setItem("quotes", JSON.stringify(mergedQuotes));
  quotes = mergedQuotes;

  populateCategories();
  filterQuotes();
  notifyUser("Quotes synced with server!");
}

// Periodic sync every 30 seconds
setInterval(syncQuotes, 30000);
manualSyncBtn?.addEventListener("click", syncQuotes);

// Save selected filter
function saveSelectedFilter(category) {
  localStorage.setItem("selectedFilter", category);
}

// Load selected filter
function loadSelectedFilter() {
  return localStorage.getItem("selectedFilter") || "all";
}

// Populate category dropdowns
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categorySelect.innerHTML = "";
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  categories.forEach(cat => {
    const option1 = document.createElement("option");
    option1.value = cat;
    option1.textContent = cat;
    categorySelect.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = cat;
    option2.textContent = cat;
    categoryFilter.appendChild(option2);
  });

  categoryFilter.value = loadSelectedFilter();
  filterQuotes();
}

// Show a random quote from selected category
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  const filtered = quotes.filter(q => q.category === selectedCategory);
  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filtered.length);
  const selectedQuote = filtered[randomIndex].text;
  quoteDisplay.textContent = selectedQuote;

  sessionStorage.setItem("lastViewedQuote", selectedQuote);
}
newQuoteBtn.addEventListener("click", showRandomQuote);

// Filter quotes by category
function filterQuotes() {
  const selected = categoryFilter.value;
  saveSelectedFilter(selected);
  filteredQuotes.innerHTML = "";

  const visibleQuotes = selected === "all"
    ? quotes
    : quotes.filter(q => q.category === selected);

  if (visibleQuotes.length === 0) {
    filteredQuotes.textContent = "No quotes found for this category.";
    return;
  }

  visibleQuotes.forEach(q => {
    const quoteEl = document.createElement("div");
    quoteEl.textContent = `“${q.text}” — ${q.category}`;
    quoteEl.style.marginBottom = "0.5rem";
    filteredQuotes.appendChild(quoteEl);
  });
}

// Create and inject the quote form
function createAddQuoteForm() {
  const formContainer = document.getElementById("quoteFormContainer");

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.type = "text";
  textInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.onclick = addQuote;

  formContainer.appendChild(textInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);
}

// Add new quote locally and simulate POST to server
async function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");
  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (newText && newCategory) {
    const newQuote = { text: newText, category: newCategory };
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    textInput.value = "";
    categoryInput.value = "";
    notifyUser("Quote added locally.");

    try {
      const response = await fetch(SERVER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: newQuote.text,
          body: newQuote.category,
          userId: 1
        })
      });

      const result = await response.json();
      console.log("Server response:", result);
      notifyUser("Quote sent to server (simulated).");
    } catch (err) {
      console.error("POST failed:", err);
      notifyUser("Failed to send quote to server.");
    }
  } else {
    alert("Please enter both quote text and category.");
  }
}

// Initialize app
populateCategories();
createAddQuoteForm();
filterQuotes();

// Show last viewed quote from sessionStorage
const lastViewed = sessionStorage.getItem("lastViewedQuote");
if (lastViewed) {
  quoteDisplay.textContent = `Last viewed: ${lastViewed}`;
}
