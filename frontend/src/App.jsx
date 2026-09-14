import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DollarSign, ShoppingBag, Users, TrendingUp, Package, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import './index.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  const [summary, setSummary] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [monthlySales, setMonthlySales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resSummary, resProducts, resMonthly] = await Promise.all([
        axios.get(`${API_BASE_URL}/sales-summary`),
        axios.get(`${API_BASE_URL}/top-products`),
        axios.get(`${API_BASE_URL}/monthly-sales`)
      ]);

      setSummary(resSummary.data);
      setTopProducts(resProducts.data);
      setMonthlySales(resMonthly.data);
    } catch (err) {
      console.error('Error fetching API data:', err);
      setError('Gagal menghubungkan ke Backend API. Pastikan service backend aktif.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (val) => {
    const num = parseFloat(val) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(num);
  };

  const formatNumber = (val) => {
    const num = parseInt(val, 10) || 0;
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-title">
          <h1>Axon Sales Dashboard</h1>
          <p>DevSecOps Platform Data Visualization & Analytics</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn-refresh" onClick={fetchData} disabled={loading}>
            <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
          </button>
          <div className="status-badge">
            <span className="status-dot"></span> API Connected
          </div>
        </div>
      </header>

      {loading && !summary ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-muted)' }}>Memuat data dari database container...</p>
        </div>
      ) : error ? (
        <div className="card-panel" style={{ textAlign: 'center', padding: '3rem', borderColor: '#ef4444' }}>
          <p style={{ color: '#f87171', fontWeight: 600 }}>{error}</p>
          <button className="btn-refresh" onClick={fetchData} style={{ marginTop: '1rem' }}>Coba Lagi</button>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid-stats">
            <div className="stat-card">
              <div className="stat-icon icon-revenue">
                <DollarSign size={28} />
              </div>
              <div className="stat-info">
                <div className="stat-label">Total Revenue</div>
                <div className="stat-value">{formatCurrency(summary?.totalRevenue)}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon icon-orders">
                <ShoppingBag size={28} />
              </div>
              <div className="stat-info">
                <div className="stat-label">Total Orders</div>
                <div className="stat-value">{formatNumber(summary?.totalOrders)}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon icon-customers">
                <Users size={28} />
              </div>
              <div className="stat-info">
                <div className="stat-label">Total Customers</div>
                <div className="stat-value">{formatNumber(summary?.totalCustomers)}</div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid-content">
            {/* Chart Panel */}
            <div className="card-panel">
              <div className="panel-header">
                <h2><TrendingUp size={20} style={{ verticalAlign: 'middle', marginRight: '8px', color: '#38bdf8' }} /> Tren Penjualan Bulanan</h2>
              </div>
              <div style={{ width: '100%', height: 340 }}>
                <ResponsiveContainer>
                  <AreaChart data={monthlySales}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={12}
                      tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} 
                      formatter={(val) => [formatCurrency(val), 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Products Panel */}
            <div className="card-panel">
              <div className="panel-header">
                <h2><Package size={20} style={{ verticalAlign: 'middle', marginRight: '8px', color: '#a78bfa' }} /> Top 10 Produk Terlaris</h2>
              </div>
              <div className="top-products-list">
                {topProducts.map((prod, index) => (
                  <div key={index} className="product-item">
                    <div className={`product-rank rank-${index + 1}`}>{index + 1}</div>
                    <div className="product-details">
                      <div className="product-name">{prod.productName}</div>
                      <div className="product-qty">{formatNumber(prod.totalQuantity)} unit terjual</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
