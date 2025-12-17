async function loadCart() {
    try {
        const response = await fetch('/api/cart-content');
        if (!response.ok) throw new Error('Kunde inte hämta vagnen');
        
        const items = await response.json();
        const body = document.getElementById('cartBody');
        let total = 0;

        body.innerHTML = '';
        
        if (items.length === 0) {
            body.innerHTML = '<tr><td colspan="5">Din kundvagn är tom.</td></tr>';
            return;
        }

        items.forEach(item => {
            const itemTotal = item.price * item.qty;
            total += itemTotal;
            body.innerHTML += `
                <tr>
                    <td>${item.isbn}</td>
                    <td>${item.title}</td>
                    <td>$${item.price}</td>
                    <td>${item.qty}</td>
                    <td>$${itemTotal.toFixed(2)}</td>
                </tr>`;
        });
        document.getElementById('grandTotal').innerText = `Totalt: $${total.toFixed(2)}`;
    } catch (err) {
        console.error(err);
    }
}

async function checkout() {
    const response = await fetch('/checkout', { method: 'POST' });
    const result = await response.text();
    alert(result);
    window.location.href = '/';
}

loadCart();