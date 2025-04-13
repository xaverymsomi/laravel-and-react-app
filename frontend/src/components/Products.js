import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8000/api/products', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            
            // Ensure prices are numbers
            const productsWithNumericPrices = response.data.map(product => ({
                ...product,
                price: Number(product.price) || 0
            }));
            
            setProducts(productsWithNumericPrices);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch products');
            setLoading(false);
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price) || 0 // Ensure it's a number
            };

            const token = localStorage.getItem('token');
            if (editingId) {
                await axios.put(`http://localhost:8000/api/products/${editingId}`, payload, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });
            } else {
                await axios.post('http://localhost:8000/api/products', payload, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });
            }
            setFormData({ name: '', description: '', price: '' });
            setEditingId(null);
            fetchProducts();
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (product) => {
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price.toString() // Convert to string for the input
        });
        setEditingId(product.id);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:8000/api/products/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });
                fetchProducts();
            } catch (err) {
                setError('Failed to delete product');
            }
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center mt-5">
            <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );

    return (
        <div className="container mt-4">
            <h1 className="text-center mb-4">Products</h1>
            
            {error && <div className="alert alert-danger">{error}</div>}
            
            <div className="card mb-4">
                <div className="card-body">
                    <h2 className="card-title">
                        {editingId ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-control"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Description</label>
                                <input
                                    type="text"
                                    name="description"
                                    className="form-control"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Price</label>
                                <input
                                    type="number"
                                    name="price"
                                    className="form-control"
                                    value={formData.price}
                                    onChange={(e) => {
                                        // Only allow numbers and decimal point
                                        const value = e.target.value.replace(/[^0-9.]/g, '');
                                        handleInputChange({
                                            target: {
                                                name: 'price',
                                                value: value
                                            }
                                        });
                                    }}
                                    step="0.01"
                                    required
                                />
                            </div>
                        </div>
                        <div className="mt-3">
                            <button
                                type="submit"
                                className="btn btn-primary me-2"
                            >
                                {editingId ? 'Update' : 'Add'} Product
                            </button>
                            {editingId && (
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setFormData({ name: '', description: '', price: '' });
                                        setEditingId(null);
                                    }}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
            
            <div className="table-responsive">
                <table className="table table-striped table-hover">
                    <thead className="table-dark">
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center">No products found</td>
                            </tr>
                        ) : (
                            products.map(product => (
                                <tr key={product.id}>
                                    <td>{product.name}</td>
                                    <td>{product.description || 'N/A'}</td>
                                    <td>
                                        {typeof product.price === 'number' 
                                            ? `$${product.price.toFixed(2)}` 
                                            : 'N/A'}
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="btn btn-sm btn-outline-primary me-2"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="btn btn-sm btn-outline-danger"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Products;