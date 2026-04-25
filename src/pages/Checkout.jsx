import { useState, useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './Checkout.css';

// Initialize Stripe with the provided test publishable key
const stripePromise = loadStripe('pk_test_51TOLkBAbWX1aCfrm1XMjH6FfBhs4q3A4b9NhnOibRDVTC96yT6qKFFngLMSmD11XrkAfwVkaqLwvaet4DAVtLN6c00WpLCWi1S');

const CheckoutForm = () => {
  const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  
  const [paymentState, setPaymentState] = useState('idle'); // idle, processing, success
  const [orderType, setOrderType] = useState('Takeaway');
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [address, setAddress] = useState('');
  
  const [paymentDetails, setPaymentDetails] = useState({
    name: user ? user.name : '',
    whatsapp: ''
  });

  const total = getCartTotal();
  const finalTotal = total * 1.08 + (orderType === 'Delivery' ? 5 : 0);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!user) {
      alert("Please login to complete your purchase.");
      navigate('/login');
      return;
    }

    setPaymentState('processing');

    if (paymentMethod === 'Card') {
      if (!stripe || !elements) {
        setPaymentState('idle');
        return; // Stripe.js hasn't yet loaded.
      }

      try {
        // Step 1: Create PaymentIntent on the backend
        const response = await fetch('https://coffee-shop-production-1fb9.up.railway.app/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            totalAmount: finalTotal,
            orderItems: cart
          })
        });

        if (!response.ok) {
          throw new Error('Failed to connect to payment server. Make sure the backend (server.js) is running on port 3001.');
        }

        const data = await response.json();

        // Step 2: Confirm the payment on the frontend using the Client Secret
        const result = await stripe.confirmCardPayment(data.clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: paymentDetails.name,
            },
          }
        });

        if (result.error) {
          alert(`Payment failed: ${result.error.message}`);
          setPaymentState('idle');
          return;
        }
      } catch (err) {
        alert(err.message);
        setPaymentState('idle');
        return;
      }
    } else {
      // Fake delay for Cash orders
      await new Promise(r => setTimeout(r, 1000));
    }
    
    // Save order to real database
    try {
      const newOrder = {
        userId: user.email,
        customerName: paymentDetails.name,
        whatsapp: paymentDetails.whatsapp,
        orderType,
        paymentMethod,
        address: orderType === 'Delivery' ? address : null,
        items: cart,
        total: finalTotal,
        date: new Date().toISOString(),
        status: 'Preparing'
      };

      await fetch('https://coffee-shop-production-1fb9.up.railway.app/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      
      setPaymentState('success');
      clearCart();
    } catch (err) {
      console.error("Failed to save order to database:", err);
      alert("Payment succeeded but order saving failed. Please contact support.");
    }
  };

  if (paymentState === 'success') {
    return (
      <div className="checkout-page container animate-fade-in">
        <div className="checkout-success glass-panel">
          <div className="success-icon">✓</div>
          <h2>Order Confirmed!</h2>
          <p>Thank you for your order, {user?.name.split(' ')[0]}.</p>
          <p>Your {orderType.toLowerCase()} order is being prepared and will be ready shortly.</p>
          {paymentMethod === 'Card' && <p>Your credit card payment was securely processed by Stripe.</p>}
          <Link to="/menu" className="btn btn-primary mt-4">Order More</Link>
        </div>
      </div>
    );
  }

  // CardElement styling options
  const cardElementOptions = {
    style: {
      base: {
        color: '#ffffff',
        fontFamily: '"Outfit", sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#a0a0a0'
        }
      },
      invalid: {
        color: '#ff4c4c',
        iconColor: '#ff4c4c'
      }
    }
  };

  return (
    <div className="checkout-page container animate-fade-in">
      <div className="checkout-header">
        <h1>Your Cart</h1>
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart glass-panel">
          <p>Your cart is currently empty.</p>
          <Link to="/menu" className="btn btn-primary mt-4">Browse Menu</Link>
        </div>
      ) : (
        <div className="checkout-grid">
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.id} className="cart-item glass-panel">
                <img src={item.img} alt={item.name} className="cart-item-img" />
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p className="cart-item-price">${item.price.toFixed(2)}</p>
                </div>
                <div className="cart-item-actions">
                  <div className="quantity-controls">
                    <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="qty-btn">
                      <Minus size={16} />
                    </button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="qty-btn">
                      <Plus size={16} />
                    </button>
                  </div>
                  <button type="button" onClick={() => removeFromCart(item.id)} className="remove-btn" title="Remove">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="payment-section glass-panel">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax (8%)</span>
              <span>${(total * 0.08).toFixed(2)}</span>
            </div>
            {orderType === 'Delivery' && (
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>$5.00</span>
              </div>
            )}
            <div className="summary-row total-row">
              <span>Total</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>

            <form onSubmit={handlePayment} className="payment-form mt-4">
              <div className="form-group">
                <label className="form-label">Order Type</label>
                <select value={orderType} onChange={e => setOrderType(e.target.value)}>
                  <option value="Takeaway">Takeaway (Collect at store)</option>
                  <option value="Delivery">Delivery</option>
                </select>
              </div>

              {orderType === 'Delivery' && (
                <div className="form-group">
                  <label className="form-label">Delivery Address</label>
                  <textarea 
                    rows="2" 
                    required 
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Enter your full address"
                  ></textarea>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                  <option value="Card">Credit Card</option>
                  <option value="Cash">Cash on {orderType === 'Delivery' ? 'Delivery' : 'Pickup'}</option>
                </select>
              </div>

              <h4 style={{marginTop: '20px'}}>Contact Details</h4>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input 
                  type="text" 
                  required 
                  value={paymentDetails.name}
                  onChange={e => setPaymentDetails({...paymentDetails, name: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              <div className="form-group">
                <label className="form-label">WhatsApp Number (For Updates)</label>
                <input 
                  type="tel" 
                  required 
                  value={paymentDetails.whatsapp}
                  onChange={e => setPaymentDetails({...paymentDetails, whatsapp: e.target.value})}
                  placeholder="+1 234 567 8900"
                />
              </div>

              {paymentMethod === 'Card' && (
                <>
                  <h4 style={{marginTop: '20px'}}>Card Details</h4>
                  <div className="form-group">
                    <label className="form-label">Secure Credit Card Input</label>
                    <div style={{ padding: '12px', background: 'var(--surface-color)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
                      <CardElement options={cardElementOptions} />
                    </div>
                    <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '8px' }}>
                      Payments are securely processed by Stripe. We do not store your card details.
                    </small>
                  </div>
                </>
              )}

              <button 
                type="submit" 
                className="btn btn-primary payment-btn" 
                disabled={paymentState === 'processing' || (paymentMethod === 'Card' && !stripe)}
              >
                {paymentState === 'processing' ? 'Processing Secure Payment...' : `Confirm Order $${finalTotal.toFixed(2)}`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Wrap the Checkout component in the Stripe Elements provider
const Checkout = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default Checkout;
