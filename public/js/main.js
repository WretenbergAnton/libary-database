let currentPage = 1;
let totalPages = 1;

async function fetchBooks() {
    const author = document.getElementById('authorInput').value;
    const title = document.getElementById('titleInput').value;
    
    const url = `/api/books?author=${encodeURIComponent(author)}&title=${encodeURIComponent(title)}&page=${currentPage}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        totalPages = data.totalPages; 
        
        const resultsDiv = document.getElementById('bookResults');
        resultsDiv.innerHTML = '';

        if (!data.books || data.books.length === 0) {
            resultsDiv.innerHTML = '<p>Inga böcker hittades.</p>';
            document.getElementById('pageDisplay').innerText = "0 av 0";
            return;
        }

        data.books.forEach(book => {
            resultsDiv.innerHTML += `
                <div class="book-card">
                    <h3>${book.title}</h3>
                    <p><strong>Författare:</strong> ${book.author}</p>
                    <p><strong>Pris:</strong> ${book.price}kr</p>
                    <div class="cart-controls">
                        <input type="number" id="qty-${book.isbn}" value="1" min="1">
                        <button onclick="addToCart('${book.isbn}')">Lägg i kundvagn</button>
                    </div>
                </div>
            `;
        });

        document.getElementById('pageDisplay').innerText = `${currentPage} av ${totalPages}`;
        
    } catch (err) {
        console.error('Fel vid hämtning:', err);
    }
}

function changePage(step) {
    const nextPage = currentPage + step;
    if (nextPage >= 1 && nextPage <= totalPages) {
        currentPage = nextPage;
        fetchBooks();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

async function addToCart(isbn) {
    const qtyInput = document.getElementById(`qty-${isbn}`);
    const qty = qtyInput ? qtyInput.value : 1;
    
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


async function checkLoginStatus() {
    try {
        const response = await fetch('/api/status');
        const status = await response.json();

        const registerLink = document.getElementById('nav-register');
        const loginLink = document.getElementById('nav-login');
        const logoutLink = document.getElementById('nav-logout');
        const welcomeMsg = document.getElementById('welcome-message');

        if (status.loggedIn) {
            if(registerLink) registerLink.style.display = 'none';
            if(loginLink) loginLink.style.display = 'none';
            if(logoutLink) logoutLink.style.display = 'inline';
            
            if(welcomeMsg) {
                welcomeMsg.innerText = `Hej, ${status.userName}!`;
                welcomeMsg.style.display = 'inline';
                welcomeMsg.style.color = 'white';
            }
        } else {
            if(registerLink) registerLink.style.display = 'inline';
            if(loginLink) loginLink.style.display = 'inline';
            if(logoutLink) logoutLink.style.display = 'none';
            if(welcomeMsg) welcomeMsg.style.display = 'none';
        }
    } catch (err) {
        console.error('Kunde inte kontrollera inloggningsstatus:', err);
    }
}

checkLoginStatus();
fetchBooks();