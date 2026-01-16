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

// Lägg till detta i main.js
async function checkLoginStatus() {
    try {
        const response = await fetch('/api/status');
        const status = await response.json();

        const registerLink = document.getElementById('nav-register');
        const loginLink = document.getElementById('nav-login');
        const logoutLink = document.getElementById('nav-logout');
        const welcomeMsg = document.getElementById('welcome-message');

        if (status.loggedIn) {
            // Om inloggad: Dölj register/logga in, visa logga ut
            if(registerLink) registerLink.style.display = 'none';
            if(loginLink) loginLink.style.display = 'none';
            if(logoutLink) logoutLink.style.display = 'inline';
            
            if(welcomeMsg) {
                welcomeMsg.innerText = `Hej, ${status.userName}!`;
                welcomeMsg.style.display = 'inline';
                welcomeMsg.style.color = 'white'
            }
        } else {
            // Om utloggad: Visa register/logga in, dölj logga ut
            if(registerLink) registerLink.style.display = 'inline';
            if(loginLink) loginLink.style.display = 'inline';
            if(logoutLink) logoutLink.style.display = 'none';
            if(welcomeMsg) welcomeMsg.style.display = 'none';
        }
    } catch (err) {
        console.error('Kunde inte kontrollera status:', err);
    }
}

// Kör statuskollen när sidan laddas

function changePage(step) {
    currentPage += step;
    if (currentPage < 1) currentPage = 1;
    fetchBooks();
}

checkLoginStatus();
// Starta hämtning direkt
fetchBooks();
