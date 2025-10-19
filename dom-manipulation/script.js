// Load quotes from localStorage or use default
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Design is not just what it looks like and feels like. Design is how it works.", category: "Design" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" }
];

// DOM references
const quoteDisplay = document.getElementById("quoteDisplay");
const categorySelect = document.getElementById("categorySelect");
const categoryFilter = document.getElementById("categoryFilter");
const filteredQuotes = document.getElementById("filteredQuotes");
const newQuoteBtn = document.getElementById("newQuote");

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Save selected filter to localStorage
function saveSelectedFilter(category) {
  localStorage.setItem("selectedFilter", category);
}

// Load selected filter from localStorage
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
  }

  );

  // Restore last selected filter
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

  // Save last viewed quote to sessionStorage
  sessionStorage.setItem("lastViewedQuote", selectedQuote);
}

// Create and inject the quote form dynamically
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

// Add new quote and update categories
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");
  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (newText && newCategory) {
    quotes.push({ text: newText, category: newCategory });
    saveQuotes();
    populateCategories();
    textInput.value = "";
    categoryInput.value = "";
    alert("Quote added successfully!");
  } else {
    alert("Please enter both quote text and category.");
  }
}

// Filter quotes based on selected category
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

// Export quotes to JSON file
function exportQuotesToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Import quotes from uploaded JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format.");
      }
    } catch (err) {
      alert("Error reading JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Event listeners
newQuoteBtn.addEventListener("click", showRandomQuote);

// Initialize app
populateCategories();
createAddQuoteForm();

// Show last viewed quote from sessionStorage
const lastViewed = sessionStorage.getItem("lastViewedQuote");
if (lastViewed) {
  quoteDisplay.textContent = `Last viewed: ${lastViewed}`;
}
const SERVER_URL = "http://localhost:3000/quotes"; // or your mock API endpoint

// Fetch quotes from server and sync with localStorage
async function syncWithServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverQuotes = await response.json();

    const localQuotes = JSON.parse(localStorage.getItem("quotes")) || [];

    // Conflict resolution: server wins
    const mergedQuotes = mergeQuotes(serverQuotes, localQuotes);
    localStorage.setItem("quotes", JSON.stringify(mergedQuotes));
    quotes = mergedQuotes;
    populateCategories();
    filterQuotes();
    notifyUser("Quotes synced with server. Server data prioritized.");
  } catch (error) {
    console.error("Sync failed:", error);
    notifyUser("Failed to sync with server.");
  }
}

// Merge quotes: server wins on conflict
function mergeQuotes(serverQuotes, localQuotes) {
  const map = new Map();
  serverQuotes.forEach(q => map.set(q.text, q)); // use text as unique key
  localQuotes.forEach(q => {
    if (!map.has(q.text)) {
      map.set(q.text, q);
    }
  });
  return Array.from(map.values());
}

// Notify user of sync or conflict
function notifyUser(message) {
  const notice = document.createElement("div");
  notice.textContent = message;
  notice.style.background = "#fffae6";
  notice.style.border = "1px solid #ffd700";
  notice.style.padding = "0.5rem";
  notice.style.marginTop = "1rem";
  document.body.insertBefore(notice, document.body.firstChild);
  setTimeout(() => notice.remove(), 5000);
}

// Periodic sync every 30 seconds
setInterval(syncWithServer, 30000);
