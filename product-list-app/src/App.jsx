import React, { useEffect, useMemo, useState, useRef } from "react";
import "./App.css";
export default function App() {
  // sample initial data
  const initialProducts = [
    { id: 1, name: "Wireless Mouse", price: 799, category: "Electronics", stock: 120, description: "Ergonomic wireless mouse" },
    { id: 2, name: "Water Bottle", price: 299, category: "Home", stock: 200, description: "1L stainless steel bottle" },
    { id: 3, name: "Notebook", price: 49, category: "Stationery", stock: 500, description: "College-ruled notebook" },
    { id: 4, name: "Bluetooth Speaker", price: 1999, category: "Electronics", stock: 45, description: "Portable speaker with bass" },
    { id: 5, name: "Running Shoes", price: 2499, category: "Fashion", stock: 30, description: "Lightweight running shoes" },
    { id: 6, name: "Desk Lamp", price: 899, category: "Home", stock: 80, description: "LED desk lamp with dimmer" },
    { id: 7, name: "Ballpoint Pen", price: 15, category: "Stationery", stock: 1000, description: "Smooth writing pen" },
    { id: 8, name: "Sunglasses", price: 1299, category: "Fashion", stock: 25, description: "UV protected sunglasses" },
    { id: 9, name: "Backpack", price: 1599, category: "Fashion", stock: 60, description: "Water resistant backpack" },
    { id: 10, name: "Coffee Mug", price: 199, category: "Home", stock: 300, description: "Ceramic mug, 350ml" },
  ];

  const [products, setProducts] = useState(initialProducts);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [view, setView] = useState("list");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  const debounceRef = useRef(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(query.trim()), 500);
  }, [query]);

  const filtered = useMemo(() => {
    if (!debouncedQuery) return products;
    return products.filter((p) => p.name.toLowerCase().includes(debouncedQuery.toLowerCase()));
  }, [products, debouncedQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentProducts = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const emptyForm = { id: null, name: "", price: "", category: "", stock: "", description: "" };
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingProduct) setForm({ ...editingProduct });
    else setForm(emptyForm);
  }, [editingProduct]);

  const validate = (f) => {
    const e = {};
    if (!f.name) e.name = "Name is required";
    if (f.price === "" || isNaN(Number(f.price))) e.price = "Valid price required";
    if (!f.category) e.category = "Category is required";
    if (f.stock !== "" && isNaN(Number(f.stock))) e.stock = "Stock must be a number";
    return e;
  };

  function handleSave(e) {
    e.preventDefault();
    const eObj = validate(form);
    if (Object.keys(eObj).length > 0) return setErrors(eObj);

    const updated = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock || 0),
    };

    if (editingProduct) {
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } else {
      updated.id = products.length + 1;
      setProducts((prev) => [updated, ...prev]);
    }

    closeForm();
  }

  function openAdd() {
    setEditingProduct(null);
    setShowForm(true);
  }

  function openEdit(p) {
    setEditingProduct(p);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingProduct(null);
    setErrors({});
  }

  function handleDelete(id) {
    if (!window.confirm("Delete this product?")) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="app-container">
      <div className="card">

        <div className="header">
          <h2>Product Management</h2>

          <div className="header-controls">
            <input
              className="search-input"
              placeholder="Search products..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />

            <button className={view === "list" ? "btn-view active" : "btn-view"} onClick={() => setView("list")}>
              List
            </button>
            <button className={view === "card" ? "btn-view active" : "btn-view"} onClick={() => setView("card")}>
              Cards
            </button>

            <button className="btn-primary" onClick={openAdd}>+ Add Product</button>
          </div>
        </div>

        {view === "list" ? (
          <table className="product-table">
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>₹{p.price}</td>
                  <td>{p.stock}</td>
                  <td>
                    <button className="btn-edit" onClick={() => openEdit(p)}>Edit</button>
                    <button className="btn-delete" onClick={() => handleDelete(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {currentProducts.length === 0 && (
                <tr><td colSpan="6" className="no-data">No products found</td></tr>
              )}
            </tbody>
          </table>
        ) : (
          <div className="cards-grid">
            {currentProducts.map((p) => (
              <div className="product-card" key={p.id}>
                <h3>{p.name}</h3>
                <p className="category">{p.category}</p>
                <p className="desc">{p.description}</p>
                <div className="price-stock">
                  <span className="price">₹{p.price}</span>
                  <span className="stock">Stock: {p.stock}</span>
                </div>
                <div className="card-actions">
                  <button className="btn-edit" onClick={() => openEdit(p)}>Edit</button>
                  <button className="btn-delete" onClick={() => handleDelete(p.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(1)}>First</button>
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>

          <span>Page {page} of {totalPages}</span>

          <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
          <button disabled={page === totalPages} onClick={() => setPage(totalPages)}>Last</button>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <form className="modal" onSubmit={handleSave}>
            <h3>{editingProduct ? "Edit Product" : "Add Product"}</h3>

            <label>Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {errors.name && <p className="error">{errors.name}</p>}

            <label>Price *</label>
            <input
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            {errors.price && <p className="error">{errors.price}</p>}

            <label>Category *</label>
            <input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            {errors.category && <p className="error">{errors.category}</p>}

            <label>Stock</label>
            <input
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
            {errors.stock && <p className="error">{errors.stock}</p>}

            <label>Description</label>
            <textarea
              rows="3"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={closeForm}>Cancel</button>
              <button type="submit" className="btn-primary">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}