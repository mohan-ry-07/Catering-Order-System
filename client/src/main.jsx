import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ClipboardList,
  LogOut,
  Minus,
  Plus,
  ShoppingCart,
  Store,
  UserRound,
  UtensilsCrossed
} from "lucide-react";
import "./styles.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const categories = ["All", "North", "South", "East", "West"];

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));
  const [authMode, setAuthMode] = useState("login");
  const [activeView, setActiveView] = useState("menu");
  const [category, setCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [orders, setOrders] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const authHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }),
    [token]
  );

  async function request(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      }
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  }

  function persistSession(payload) {
    setToken(payload.token);
    setUser(payload.user);
    localStorage.setItem("token", payload.token);
    localStorage.setItem("user", JSON.stringify(payload.user));
  }

  function logout() {
    setToken("");
    setUser(null);
    setProducts([]);
    setCart({ items: [], totalAmount: 0 });
    setOrders([]);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  async function loadProducts(selected = category) {
    const data = await request(`/products?category=${selected}`);
    setProducts(data.products);
  }

  async function loadCart() {
    const data = await request("/cart");
    setCart(data);
  }

  async function loadMyOrders() {
    const data = await request("/orders/my");
    setOrders(data.orders);
  }

  async function loadAdminOrders() {
    if (user?.role !== "admin") return;
    const data = await request("/orders");
    setAdminOrders(data.orders);
  }

  useEffect(() => {
    if (!token) return;
    loadProducts().catch((error) => setMessage(error.message));
    loadCart().catch((error) => setMessage(error.message));
    loadMyOrders().catch((error) => setMessage(error.message));
    loadAdminOrders().catch((error) => setMessage(error.message));
  }, [token]);

  async function submitAuth(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());

    try {
      const data = await request(`/auth/${authMode}`, {
        method: "POST",
        body: JSON.stringify(body)
      });
      persistSession(data);
      setActiveView("menu");
      setMessage(`Welcome, ${data.user.name}`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function addToCart(productId) {
    const data = await request("/cart", {
      method: "POST",
      body: JSON.stringify({ productId, quantity: 1 })
    });
    setCart(data);
    setMessage("Added to cart");
  }

  async function updateQuantity(productId, quantity) {
    const data = await request(`/cart/${productId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity })
    });
    setCart(data);
  }

  async function removeFromCart(productId) {
    const data = await request(`/cart/${productId}`, { method: "DELETE" });
    setCart(data);
  }

  async function placeOrder(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    try {
      await request("/orders", {
        method: "POST",
        body: JSON.stringify({ deliveryAddress: form.get("deliveryAddress") })
      });
      setMessage("Order placed successfully");
      setCart({ items: [], totalAmount: 0 });
      await loadMyOrders();
      setActiveView("orders");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function saveProfile(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const data = await request("/auth/me", {
      method: "PUT",
      body: JSON.stringify(Object.fromEntries(form.entries()))
    });
    setUser(data.user);
    localStorage.setItem("user", JSON.stringify(data.user));
    setMessage("Profile updated");
  }

  async function createProduct(event) {
    event.preventDefault();
    // console.log(event.target)
    // const testForm = new FormData(event.target)
    // console.log(testForm)
    const form = new FormData(event.target);
    const body = Object.fromEntries(form.entries());
    body.price = Number(body.price);

    try {
      await request("/products", {
        method: "POST",
        body: JSON.stringify(body)
      });
      event.target.reset();
      setMessage("Product uploaded");
      await loadProducts();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function selectCategory(nextCategory) {
    setCategory(nextCategory);
    await loadProducts(nextCategory);
  }

  if (!user) {
    return (
      <main className="auth-shell">
        <section className="auth-panel">
          <div>
            <div className="brand-mark">
              <UtensilsCrossed size={26} />
            </div>
            <h1>Catering Counter</h1>
            <p>Sell regional Indian catering menus and accept customer orders in one place.</p>
          </div>
          <form onSubmit={submitAuth} className="auth-form">
            <div className="mode-switch">
              <button type="button" className={authMode === "login" ? "active" : ""} onClick={() => setAuthMode("login")}>
                Login
              </button>
              <button type="button" className={authMode === "register" ? "active" : ""} onClick={() => setAuthMode("register")}>
                Register
              </button>
            </div>
            {authMode === "register" && (
              <>
                <label>Name<input name="name" required placeholder="Your name" /></label>
                <label>Phone<input name="phone" placeholder="Optional" /></label>
                <label>Address<textarea name="address" placeholder="Delivery or business address" /></label>
                <label>Account Type
                  <select name="role">
                    <option value="user">Customer</option>
                    <option value="admin">Admin / Caterer</option>
                  </select>
                </label>
              </>
            )}
            <label>Email<input name="email" type="email" required placeholder="you@example.com" /></label>
            <label>Password<input name="password" type="password" required minLength="6" placeholder="Minimum 6 characters" /></label>
            <button className="primary" disabled={loading}>{loading ? "Please wait..." : authMode === "login" ? "Login" : "Create Account"}</button>
            {message && <p className="notice">{message}</p>}
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <UtensilsCrossed />
          <span>Catering Counter</span>
        </div>
        <nav>
          <button className={activeView === "menu" ? "active" : ""} onClick={() => setActiveView("menu")}><Store size={18} /> Menu</button>
          <button className={activeView === "cart" ? "active" : ""} onClick={() => setActiveView("cart")}><ShoppingCart size={18} /> Cart <span>{cart.items.length}</span></button>
          <button className={activeView === "orders" ? "active" : ""} onClick={() => { setActiveView("orders"); loadMyOrders(); }}><ClipboardList size={18} /> My Orders</button>
          <button className={activeView === "profile" ? "active" : ""} onClick={() => setActiveView("profile")}><UserRound size={18} /> My Profile</button>
          {user.role === "admin" && (
            <button className={activeView === "admin" ? "active" : ""} onClick={() => { setActiveView("admin"); loadAdminOrders(); }}><Store size={18} /> Admin</button>
          )}
        </nav>
        <button className="logout" onClick={logout}><LogOut size={18} /> Logout</button>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p>{user.role === "admin" ? "Admin workspace" : "Customer workspace"}</p>
            <h2>{viewTitle(activeView)}</h2>
          </div>
          <strong>{user.name}</strong>
        </header>

        {message && <div className="toast">{message}</div>}

        {activeView === "menu" && (
          <>
            <div className="category-tabs">
              {categories.map((item) => (
                <button key={item} className={category === item ? "active" : ""} onClick={() => selectCategory(item)}>
                  {item}
                </button>
              ))}
            </div>
            <div className="product-grid">
              {products.map((product) => (
                <article key={product._id} className="product-card">
                  <div className="dish-image" style={{ backgroundImage: `url(${product.imageUrl || fallbackImage(product.category)})` }} />
                  <div className="product-body">
                    <div>
                      <span className="pill">{product.category}</span>
                      <h3>{product.name}</h3>
                      <p>{product.info}</p>
                    </div>
                    <div className="product-actions">
                      <strong>{formatCurrency(product.price)}</strong>
                      <button onClick={() => addToCart(product._id)}>Add</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {activeView === "cart" && (
          <section className="split-layout">
            <div className="panel">
              <h3>Cart Items</h3>
              {cart.items.length === 0 ? <p className="empty">Your cart is empty.</p> : cart.items.map((item) => (
                <div className="cart-row" key={item.product._id}>
                  <div>
                    <strong>{item.product.name}</strong>
                    <p>{formatCurrency(item.product.price)} each</p>
                  </div>
                  <div className="qty">
                    <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)}><Minus size={16} /></button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)}><Plus size={16} /></button>
                  </div>
                  <strong>{formatCurrency(item.lineTotal)}</strong>
                  <button className="text-button" onClick={() => removeFromCart(item.product._id)}>Remove</button>
                </div>
              ))}
            </div>
            <form className="panel order-panel" onSubmit={placeOrder}>
              <h3>Place Order</h3>
              <label>Delivery Address<textarea name="deliveryAddress" defaultValue={user.address} required /></label>
              <div className="total-line"><span>Total</span><strong>{formatCurrency(cart.totalAmount)}</strong></div>
              <button className="primary" disabled={cart.items.length === 0}>Order All Items</button>
            </form>
          </section>
        )}

        {activeView === "orders" && <OrderList orders={orders} />}

        {activeView === "profile" && (
          <form className="panel profile-form" onSubmit={saveProfile}>
            <h3>Profile</h3>
            <label>Name<input name="name" defaultValue={user.name} required /></label>
            <label>Email<input value={user.email} disabled /></label>
            <label>Phone<input name="phone" defaultValue={user.phone} /></label>
            <label>Address<textarea name="address" defaultValue={user.address} /></label>
            <button className="primary">Save Profile</button>
          </form>
        )}

        {activeView === "admin" && (
          <section className="split-layout">
            <form className="panel product-form" onSubmit={createProduct}>
              <h3>Upload Product Details</h3>
              <label>Dish Name<input name="name" required /></label>
              <label>Region
                <select name="category" required>
                  <option>North</option>
                  <option>South</option>
                  <option>East</option>
                  <option>West</option>
                </select>
              </label>
              <label>Price<input name="price" type="number" min="1" required /></label>
              <label>Basic Info<textarea name="info" required /></label>
              <label>Image URL<input name="imageUrl" placeholder="https://..." /></label>
              <button className="primary">Upload Product</button>
            </form>
            <div className="panel">
              <h3>View Orders</h3>
              <OrderList orders={adminOrders} admin />
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

function viewTitle(view) {
  return {
    menu: "Indian Catering Menu",
    cart: "Cart",
    orders: "My Orders",
    profile: "My Profile",
    admin: "Admin Dashboard"
  }[view];
}

function fallbackImage(category) {
  const map = {
    North: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80",
    South: "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=900&q=80",
    East: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80",
    West: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=900&q=80"
  };

  return map[category] || map.North;
}

function OrderList({ orders, admin = false }) {
  if (!orders?.length) {
    return <div className="panel"><p className="empty">No orders yet.</p></div>;
  }

  return (
    <div className="orders-list">
      {orders.map((order) => (
        <article key={order._id} className="order-card">
          <div className="order-head">
            <div>
              <strong>Order #{order._id.slice(-6).toUpperCase()}</strong>
              <p>{new Date(order.createdAt).toLocaleString()}</p>
              {admin && order.user && <p>{order.user.name} - {order.user.email}</p>}
            </div>
            <span>{order.status}</span>
          </div>
          <div className="order-items">
            {order.items.map((item) => (
              <p key={`${order._id}-${item.product}`}>
                {item.quantity} x {item.name} <strong>{formatCurrency(item.price * item.quantity)}</strong>
              </p>
            ))}
          </div>
          <div className="total-line"><span>Total</span><strong>{formatCurrency(order.totalAmount)}</strong></div>
          <p className="address">{order.deliveryAddress}</p>
        </article>
      ))}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
