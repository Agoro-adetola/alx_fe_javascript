const SERVER_URL = "http://localhost:3000/quotes";
let quotes = JSON.parse(localStorage.getItem("quotes")) || [];

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
  document.body.insertBefore(notice, document.body.firstChild);
  setTimeout(() => notice.remove(), 5000);
}

// Merge quotes (server wins)
function mergeQuotes(serverQuotes, localQuotes) {
  const map = new Map();
  serverQuotes.forEach(q => map.set(q.text, q));
  localQuotes.forEach(q => {
    if (!map.has(q.text)) map.set(q.text, q);
  });
  return Array.from(map.values());
}

// Sync with server
async function syncWithServer() {
  try {
    const res = await fetch(SERVER_URL);
    const serverQuotes = await res.json();
    const localQuotes = JSON.parse(localStorage.getItem("quotes")) || [];
    const merged = mergeQuotes(serverQuotes, localQuotes);
    localStorage.setItem("quotes", JSON.stringify(merged));
    quotes = merged;
    populateCategories();
    filterQuotes();
    notifyUser("Quotes synced with server.");
  } catch (err) {
    notifyUser("Failed to sync with server.");
  }
}

// Periodic sync
setInterval(syncWithServer, 30000);
manualSyncBtn.addEventListener("click", syncWithServer);

// Populate dropdowns
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categorySelect.innerHTML = "";
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const opt1 = document.createElement("option");
    opt1.value = cat;
    opt1.textContent = cat;
    categorySelect.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = cat;
    opt2.textContent = cat;
    categoryFilter.appendChild(opt2);
  });
}

// Show random quote
function showRandomQuote() {
  const selected = categorySelect.value;
  const filtered = quotes.filter(q => q.category === selected);
  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }
  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = random.text;
  sessionStorage.setItem("lastViewedQuote", random.text);
}
newQuoteBtn.addEventListener("click", showRandomQuote);

// Filter quotes
function filterQuotes() {
  const selected = categoryFilter.value;
  filteredQuotes.innerHTML = "";
  const visible = selected === "all" ? quotes : quotes.filter(q => q.category === selected);
  visible.forEach(q => {
    const div = document.createElement("div");
    div.textContent = `“${q.text}” — ${q.category}`;
    filteredQuotes.appendChild(div);
  });
}

// Create form
function createAddQuoteForm() {
  const container = document.getElementById("quoteFormContainer");
  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.placeholder = "Quote text";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Category";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.onclick = addQuote;

  container.appendChild(textInput);
  container.appendChild(categoryInput);
  container.appendChild(addBtn);
}

// Add quote
async function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (!text || !category) return alert("Please fill both fields.");

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  notifyUser("Quote added locally.");

  try {
    await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newQuote)
    });
    notifyUser("Quote synced to server.");
  } catch {
    notifyUser("Failed to sync quote to server.");
  }
}

// Initialize
populateCategories();
createAddQuoteForm();
filterQuotes();
const lastViewed = sessionStorage.getItem("lastViewedQuote");
if (lastViewed) quoteDisplay.textContent = `Last viewed: ${lastViewed}`;
