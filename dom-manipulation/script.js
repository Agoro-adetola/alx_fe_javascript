// Initial quotes array
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Design is not just what it looks like and feels like. Design is how it works.", category: "Design" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" }
];

// DOM references
const quoteDisplay = document.getElementById("quoteDisplay");
const categorySelect = document.getElementById("categorySelect");
const newQuoteBtn = document.getElementById("newQuote");

// Populate category dropdown
function updateCategoryOptions() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categorySelect.innerHTML = "";
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

// Show a random quote from selected category
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  const filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.textContent = filteredQuotes[randomIndex].text;
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

// Add new quote to array and update UI
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");
  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (newText && newCategory) {
    quotes.push({ text: newText, category: newCategory });
    updateCategoryOptions();
    textInput.value = "";
    categoryInput.value = "";
    alert("Quote added successfully!");
  } else {
    alert("Please enter both quote text and category.");
  }
}

// Event listeners
newQuoteBtn.addEventListener("click", showRandomQuote);

// Initialize app
updateCategoryOptions();
createAddQuoteForm();
