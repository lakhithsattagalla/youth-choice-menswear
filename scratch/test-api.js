async function testOrderWhatsApp() {
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'john@example.com', password: 'customer123' })
  });
  const { token } = await loginRes.json();

  // Get Cart items or add one
  const cartRes = await fetch('http://localhost:5000/api/cart', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const cart = await cartRes.json();

  if (!cart.items || cart.items.length === 0) {
    await fetch('http://localhost:5000/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ variant_id: 'var-prod-1-Black-L', quantity: 1 })
    });
  }

  // Get Address
  const addrRes = await fetch('http://localhost:5000/api/user/addresses', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const { addresses } = await addrRes.json();

  // Create Order
  const orderRes = await fetch('http://localhost:5000/api/orders/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ address_id: addresses[0]?.id })
  });

  const orderData = await orderRes.json();
  console.log('✅ Generated WhatsApp URL:', orderData.whatsapp_url);
  console.log('✅ WhatsApp Order Number:', orderData.order?.order_number);
}

testOrderWhatsApp().catch(console.error);
