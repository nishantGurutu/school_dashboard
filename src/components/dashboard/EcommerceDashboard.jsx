import React from 'react';
import Chart from 'react-apexcharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  ShoppingBag,
  ArrowUpRight,
  MoreHorizontal,
  ChevronRight,
  Rocket,
  Search,
  RefreshCw,
  Truck,
  Trash2,
  Plus
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const EcommerceDashboard = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Monthly Earnings Sparkline Options
  const monthlyEarningsOptions = {
    chart: {
      type: 'line',
      sparkline: { enabled: true },
      animations: { enabled: true }
    },
    stroke: { curve: 'smooth', width: 3, colors: ['#2563eb'] },
    tooltip: { enabled: true, theme: isDark ? 'dark' : 'light' }
  };
  const monthlyEarningsSeries = [{ name: 'Earnings', data: [12, 28, 22, 25, 18, 35] }];

  // Visitor Value Column Chart Options
  const visitorValueOptions = {
    chart: {
      type: 'bar',
      sparkline: { enabled: true }
    },
    plotOptions: {
      bar: { columnWidth: '45%', borderRadius: 3 }
    },
    colors: ['#3b82f6'],
    tooltip: { enabled: true, theme: isDark ? 'dark' : 'light' }
  };
  const visitorValueSeries = [{ name: 'Value', data: [45, 60, 35, 70, 40, 50, 65, 30, 80] }];

  // Revenue Generated ApexLine Chart Options
  const revenueChartOptions = {
    chart: {
      type: 'line',
      toolbar: { show: false },
      background: 'transparent'
    },
    colors: ['#94a3b8', '#2563eb'],
    stroke: { width: [2, 3], curve: 'smooth' },
    markers: { size: 5, hover: { size: 7 } },
    xaxis: {
      categories: [
        'Aug 23', 'Aug 24', 'Aug 25', 'Aug 26', 'Aug 27', 'Aug 28',
        'Aug 29', 'Aug 30', 'Aug 31', 'Sep 01', 'Sep 02', 'Sep 03', 'Sep 04', 'Sep 05', 'Sep 06'
      ],
      labels: {
        style: { colors: isDark ? '#9ca3af' : '#64748b', fontFamily: 'Plus Jakarta Sans' }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        style: { colors: isDark ? '#9ca3af' : '#64748b', fontFamily: 'Plus Jakarta Sans' },
        formatter: (val) => `$${val}k`
      }
    },
    grid: {
      borderColor: isDark ? '#374151' : '#f1f5f9',
      strokeDashArray: 4
    },
    legend: { show: false },
    tooltip: { theme: isDark ? 'dark' : 'light' }
  };
  const revenueChartSeries = [
    { name: 'Last year', data: [30, 40, 35, 36, 37, 45, 42, 48, 43, 50, 75, 46, 47, 49, 45] },
    { name: 'This year', data: [45, 35, 42, 39, 62, 48, 51, 52, 40, 43, 34, 46, 45, 46, 38] }
  ];

  // Market Share Donut Chart Options
  const marketShareOptions = {
    chart: { type: 'donut' },
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
    labels: ['Alligator', 'CheckMark', 'Stripes', 'Head & Mead'],
    legend: { show: false },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total transactions',
              color: isDark ? '#9ca3af' : '#64748b',
              fontSize: '12px',
              formatter: () => '$6,322.32'
            },
            value: {
              show: true,
              fontSize: '22px',
              fontWeight: 800,
              color: isDark ? '#f9fafb' : '#1e293b'
            }
          }
        }
      }
    }
  };
  const marketShareSeries = [29.7, 31.9, 23.0, 14.4];

  // Sample Products Data
  const topProducts = [
    {
      id: 1,
      name: 'Shanty Cotton Seat',
      img: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=100&q=80',
      vendors: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=60&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=60&q=80',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=60&q=80'
      ],
      margin: '$981.00',
      sold: '29,536',
      status: 'In Stock'
    },
    {
      id: 2,
      name: 'Practical Soft Couch',
      img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=100&q=80',
      vendors: [
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=60&q=80',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=60&q=80'
      ],
      margin: '$199.00',
      sold: '27,700',
      status: 'In Stock'
    },
    {
      id: 3,
      name: 'Rustic Rubber Chair',
      img: 'https://images.unsplash.com/photo-1580481072645-022f9a6d8310?auto=format&fit=crop&w=100&q=80',
      vendors: [
        'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=60&q=80',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=60&q=80'
      ],
      margin: '$609.00',
      sold: '21,778',
      status: 'Low Stock'
    },
    {
      id: 4,
      name: 'Ergonomic Frozen Bacon',
      img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=100&q=80',
      vendors: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=60&q=80'
      ],
      margin: '$923.00',
      sold: '20,272',
      status: 'In Stock'
    },
    {
      id: 5,
      name: 'Unbranded Metal Sofa',
      img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=100&q=80',
      vendors: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=60&q=80'
      ],
      margin: '$119.00',
      sold: '17,374',
      status: 'In Stock'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner Row */}
      <div className="grid-responsive">
        {/* Left Column: Greeting & Today's Orders */}
        <div className="col-span-4 card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Sunday, Sep 06, 2026
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '2px' }}>
              Good morning, Captain!
            </h2>
          </div>

          {/* Quick Metrics */}
          <div
            style={{
              padding: '16px',
              backgroundColor: 'var(--bg-app)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Updates from yesterday.
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-primary-light)',
                    color: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Users size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>2,110</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '6px' }}>Visitors</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-primary-light)',
                    color: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <DollarSign size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>$8.2M</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '6px' }}>Earnings</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-primary-light)',
                    color: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>1,124</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '6px' }}>Orders</span>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Orders Sub-list */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Your have 16 orders today.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { name: 'Advanced Soft Couch', price: '$427', img: topProducts[0].img, icon: RefreshCw },
                { name: 'Handmade Cotton Chair', price: '$472', img: topProducts[1].img, icon: Truck },
                { name: 'Rustic Rubber Chair', price: '$609', img: topProducts[2].img, icon: RefreshCw },
                { name: 'Practical Metal Sofa', price: '$282', img: topProducts[3].img, icon: Trash2 }
              ].map((item, i) => {
                const IconComp = item.icon;
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      backgroundColor: 'var(--bg-app)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={item.img}
                        alt={item.name}
                        style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{item.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.price}</div>
                      </div>
                    </div>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-success-bg)',
                        color: 'var(--color-success)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <IconComp size={14} />
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              style={{
                width: '100%',
                marginTop: '14px',
                padding: '8px',
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--accent-primary)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              All orders <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Middle Column: Monthly Earnings & Visitor Value */}
        <div className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Monthly Earnings Card */}
          <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Monthly Earnings</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total profit gained</p>
              </div>
              <button className="btn-icon">
                <MoreHorizontal size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>$25,049</span>
              <span className="badge badge-success">
                +4.33% <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>vs last month</span>
              </span>
            </div>

            <div style={{ height: '60px', marginTop: '10px' }}>
              <Chart options={monthlyEarningsOptions} series={monthlyEarningsSeries} type="line" height={60} />
            </div>
          </div>

          {/* Visitor Value Card */}
          <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Visitor Value</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Avg. income per site visit</p>
              </div>
              <button className="btn-icon">
                <MoreHorizontal size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>$63.02</span>
              <span className="badge badge-danger">
                -1.03% <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>vs last month</span>
              </span>
            </div>

            <div style={{ height: '60px', marginTop: '10px' }}>
              <Chart options={visitorValueOptions} series={visitorValueSeries} type="bar" height={60} />
            </div>
          </div>
        </div>

        {/* Right Column: Rocket Promo Banner */}
        <div className="col-span-4">
          <div
            className="card animate-fade-in"
            style={{
              height: '100%',
              background: 'linear-gradient(135deg, #dcfce7 0%, #e0f2fe 50%, #eff6ff 100%)',
              color: '#0f172a',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              border: 'none',
              padding: '28px'
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(37, 99, 235, 0.15)',
                  color: '#2563eb',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)'
                }}
              >
                PRO FEATURE
              </span>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '16px', lineHeight: 1.25 }}>
                Grow your store confidently.
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#475569', marginTop: '12px', maxWidth: '85%' }}>
                Access advanced tools and proven strategies to grow your business faster and smarter.
              </p>
            </div>

            <div style={{ marginTop: '24px', zIndex: 2 }}>
              <button className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '0.9rem' }}>
                Upgrade Now
              </button>
            </div>

            {/* Rocket vector icon representation */}
            <div
              style={{
                position: 'absolute',
                bottom: '-20px',
                right: '-20px',
                opacity: 0.85,
                transform: 'rotate(-15deg)'
              }}
            >
              <Rocket size={160} color="#3b82f6" />
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Revenue Generated & Market Share */}
      <div className="grid-responsive">
        {/* Revenue Generated Line Chart */}
        <div className="col-span-8 card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Revenue Generated</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Amount of revenue in this month comparing to last year
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#94a3b8' }} />
                  Last year
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2563eb' }} />
                  This year <span className="badge badge-success">+6.19%</span>
                </span>
              </div>

              <select
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-app)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  outline: 'none'
                }}
              >
                <option>Last month</option>
                <option>This year</option>
              </select>
            </div>
          </div>

          <div style={{ height: '320px', width: '100%' }}>
            <Chart options={revenueChartOptions} series={revenueChartSeries} type="line" height="100%" />
          </div>
        </div>

        {/* Market Share Donut Chart */}
        <div className="col-span-4 card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Market Share</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Amount of revenue in one month</p>
            </div>
            <button className="btn-icon">
              <MoreHorizontal size={18} />
            </button>
          </div>

          <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Chart options={marketShareOptions} series={marketShareSeries} type="donut" height="220" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            {[
              { name: 'Alligator', pct: '29.7%', change: '+6.01%', color: '#3b82f6', isUp: true },
              { name: 'CheckMark', pct: '31.9%', change: '+4.12%', color: '#10b981', isUp: true },
              { name: 'Stripes', pct: '23%', change: '-3.91%', color: '#f59e0b', isUp: false },
              { name: 'Head & Mead', pct: '14.4%', change: '0.01%', color: '#ef4444', isUp: true }
            ].map((brand, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '4px', height: '16px', borderRadius: '4px', backgroundColor: brand.color }} />
                  <span style={{ fontWeight: 600 }}>{brand.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: 700 }}>{brand.pct}</span>
                  <span className={`badge ${brand.isUp ? 'badge-success' : 'badge-danger'}`}>{brand.change}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Top Products Table */}
      <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Top products</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Detailed information about the products</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search..."
                style={{
                  padding: '6px 12px 6px 32px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-app)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  outline: 'none'
                }}
              />
            </div>
            <button className="btn-icon">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Product</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Vendors</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Margin</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Sold</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Stock</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}></th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={p.img} alt={p.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                      <span style={{ fontWeight: 600 }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {p.vendors.map((v, i) => (
                        <img
                          key={i}
                          src={v}
                          alt="Vendor"
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid var(--bg-card)',
                            marginLeft: i > 0 ? '-8px' : 0
                          }}
                        />
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>{p.margin}</td>
                  <td style={{ padding: '14px 16px' }}>{p.sold}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className={`badge ${p.status === 'In Stock' ? 'badge-success' : 'badge-warning'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button className="btn-icon">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
