let currentPage = 1;

async function fetchBooks() {
    const author = document.getElementById('authorInput').value;
    const title = document.getElementById('titleInput').value;
    const url = `/api/books?author=${author}&title=${title}&page=${currentPage}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        const resultsDiv = document.getElementById('bookResults');
        
        resultsDiv.innerHTML = '';

        if (data.books.length === 0) {
            resultsDiv.innerHTML = '<p>Inga böcker hittades.</p>';
            return;
        }

        data.books.forEach(book => {
            resultsDiv.innerHTML += `
                <div class="book-card">
                    <h3>${book.title}</h3>
                    <p><strong>Författare:</strong> ${book.author}</p>
                    <p><strong>Ämne:</strong> ${book.genre}</p>
                    <p><strong>Pris:</strong> ${book.price}kr</p>
                    <div class="cart-controls">
                        Antal: <input type="number" id="qty-${book.isbn}" value="1" min="1">
                        <button onclick="addToCart('${book.isbn}')">Lägg i kundvagn</button>
                    </div>
                </div>
            `;
        });
        document.getElementById('pageDisplay').innerText = currentPage;
    } catch (err) {
        console.error('Fel vid hämtning:', err);
    }
}

async function addToCart(isbn) {
    const qty = document.getElementById(`qty-${isbn}`).value;
    const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isbn, qty: parseInt(qty) })
    });

    if (response.ok) {
        alert('Boken har lagts till i kundvagnen!');
    } else {
        alert('Du måste logga in för att handla.');
    }
}

function changePage(step) {
    currentPage += step;
    if (currentPage < 1) currentPage = 1;
    fetchBooks();
}

// Starta hämtning direkt
fetchBooks();
