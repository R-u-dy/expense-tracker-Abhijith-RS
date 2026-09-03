# Expense Tracker

A simple, responsive Expense Tracker web app built with plain HTML, CSS, and JavaScript — split into separate files with no frameworks or build tools required.

## Features

- Add income or expense transactions with amount, category, date, and description
- Edit and delete existing transactions
- View total income, total expenses, and current balance
- Filter transactions by type (income/expense), category, and description search
- Data persists across page refreshes using browser **Local Storage**
- Responsive layout for desktop and mobile
- **Bonus:** current-month expense summary with a category-wise chart
- Basic input validation with inline error messages

## How to Run

This is a static site — no installation or server required.

1. Open `index.html` locally in any modern web browser (double-click the file, or right-click → Open With → Browser).
2. or click directly to page https://r-u-dy.github.io/expense-tracker-Abhijith-RS/
That's it — the app runs entirely client-side and stores your data in your browser's Local Storage. `index.html` links to `style.css` and `script.js` using relative paths, so all three files just need to stay in the same folder.

**Optional (recommended for consistent behavior across browsers):**

```bash
# From the project folder, using Python's built-in server
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Project Structure

```
expense-tracker-candidate-name/
├── index.html   # Markup only — structure of the page
├── style.css    # All styling
├── script.js    # All app logic (transactions, storage, rendering)
└── README.md    # This file
```

## Notes

- All data is stored locally in your browser (`localStorage`), so it's private to your machine/browser and will not sync across devices.
- To reset all data, clear your browser's Local Storage for this page (or open dev tools → Application → Local Storage → delete the `expense_tracker_transactions_v1` key).
