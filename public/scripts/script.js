document.addEventListener('DOMContentLoaded', function() {
  const page = window.location.pathname;

  // Load customer list on home page
  if (page === '/') {
    fetch('/api/customers')
      .then(response => response.json())
      .then(customers => {
        const customerList = document.getElementById('customer-list');
        customers.forEach(customer => {
          const listItem = document.createElement('li');
          listItem.innerHTML = `<a href="/view/${customer._id}">${customer.name} - $${customer.balance}</a>`;
          customerList.appendChild(listItem);
        });
      })
      .catch(error => console.error('Error fetching customers:', error));
  }

  // Load customer info on view page
  if (page.startsWith('/view/')) {
    const customerId = page.split('/')[2];
    fetch(`/api/customers/${customerId}`)
      .then(response => response.json())
      .then(customer => {
        const customerInfo = document.getElementById('customer-info');
        customerInfo.innerHTML = `
          <h2>${customer.name}</h2>
          <p>Email: ${customer.email}</p>
          <p>Balance: $${customer.balance}</p>
        `;
        const transferLink = document.getElementById('transfer-link');
        transferLink.href = `/transfer?from=${customerId}`;
      })
      .catch(error => console.error('Error fetching customer data:', error));
  }

  // Load transfer options on transfer page
  if (page === '/transfer') {
    const fromId = new URLSearchParams(window.location.search).get('from');
    fetch('/api/customers')
      .then(response => response.json())
      .then(customers => {
        const toSelect = document.getElementById('toId');
        customers.forEach(customer => {
          if (customer._id !== fromId) {
            const option = document.createElement('option');
            option.value = customer._id;
            option.textContent = customer.name;
            toSelect.appendChild(option);
          }
        });
        document.getElementById('fromId').value = fromId;
      })
      .catch(error => console.error('Error fetching customers:', error));

    // Handle transfer form submission
    document.getElementById('transfer-form').addEventListener('submit', function(event) {
      event.preventDefault();
      const formData = new FormData(this);
      fetch('/transfer', {
        method: 'POST',
        body: new URLSearchParams(formData)
      })
      .then(response => {
        if (response.redirected) {
          window.location.href = response.url;
        } else {
          response.text().then(text => alert(text));
        }
      })
      .catch(error => console.error('Error transferring money:', error));
    });
  }
});
