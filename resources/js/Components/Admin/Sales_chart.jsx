import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Đăng ký các thành phần cần thiết cho ChartJS
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const SalesChart = () => {
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });
    const [year, setYear] = useState(2025);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = () => {
        setLoading(true);
        setError(null);

        axios.get(`http://localhost:8000/api/chart/revenue/${year}`)
            .then(response => {
                const data = response.data;
                console.log('API response:', data);

                if (!Array.isArray(data) || data.length === 0) {
                    setError('No data available from API');
                    setChartData({ labels: [], datasets: [] });
                    setLoading(false);
                    return;
                }

                const labels = data.map(item => `Month ${item.month}`);
                const revenues = data.map(item => item.total_revenue || 0);

                const hasNonZeroData = revenues.some(revenue => revenue > 0);
                if (!hasNonZeroData) {
                    console.warn('All revenues are 0. Chart may appear empty.');
                }

                // Tạo gradient cho vùng tô
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
                gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');

                setChartData({
                    labels,
                    datasets: [
                        {
                            label: 'Revenue (VND)',
                            data: revenues,
                            borderColor: 'rgba(139, 92, 246, 1)',
                            backgroundColor: gradient,
                            fill: true,
                            tension: 0.3,
                            pointRadius: 5,
                            pointBackgroundColor: 'rgba(139, 92, 246, 1)',
                            pointStyle: 'rect', // Điểm hình vuông
                        },
                    ],
                });
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setError(`Failed to load data: ${error.message}`);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchData();
    }, [year]);

    const handleYearChange = (e) => {
        setYear(parseInt(e.target.value));
    };

    const handleRefresh = () => {
        fetchData();
    };

    return (
        <div style={{
            maxWidth: '900px',
            margin: '0 auto',
            padding: '25px',
            backgroundColor: '#f5f3ff', // Nền tím nhạt
            borderRadius: '12px',
            border: '3px double #c4b5fd', // Viền đôi tím
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
            fontFamily: 'Roboto, sans-serif',
        }}>
            <h2 style={{
                textAlign: 'center',
                color: '#4c1d95', // Tím đậm
                marginBottom: '25px',
                fontSize: '1.6rem',
                fontWeight: '700',
                fontStyle: 'italic',
            }}>
                Revenue Analytics
            </h2>

            {/* Control Panel */}
            <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                padding: '15px',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '2px double #c4b5fd',
                marginBottom: '25px',
                gap: '15px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{
                        fontSize: '0.95rem',
                        color: '#4c1d95',
                        fontWeight: '600',
                    }}>
                        Year:
                    </label>
                    <select
                        value={year}
                        onChange={handleYearChange}
                        style={{
                            padding: '10px 14px',
                            fontSize: '0.95rem',
                            borderRadius: '6px',
                            border: '1px solid #c4b5fd',
                            backgroundColor: '#fff',
                            cursor: 'pointer',
                            color: '#4c1d95',
                        }}
                    >
                        {[2023, 2024, 2025, 2026].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={handleRefresh}
                    style={{
                        padding: '10px 20px',
                        fontSize: '0.95rem',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: '#8b5cf6', // Tím sáng
                        color: '#fff',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#7c3aed'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#8b5cf6'}
                >
                    Refresh
                </button>
            </div>

            {/* Loading State */}
            {loading && (
                <div style={{
                    textAlign: 'center',
                    padding: '50px',
                    backgroundColor: '#e0f2fe', // Xanh nhạt
                    borderRadius: '8px',
                    border: '2px double #bae6fd',
                }}>
                    <div style={{
                        border: '4px solid #bae6fd',
                        borderTop: '4px solid #3b82f6',
                        borderRadius: '50%',
                        width: '30px',
                        height: '30px',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 10px',
                    }}></div>
                    <span style={{ color: '#1e40af', fontSize: '1rem' }}>Loading data...</span>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div style={{
                    textAlign: 'center',
                    padding: '50px',
                    color: '#9f1239',
                    fontSize: '1rem',
                    backgroundColor: '#ffe4e6',
                    borderRadius: '8px',
                    border: '2px double #fecdd3',
                }}>
                    Error: {error}
                </div>
            )}

            {/* No Data State */}
            {!loading && !error && (chartData.labels.length === 0 || chartData.datasets[0].data.every(val => val === 0)) && (
                <div style={{
                    textAlign: 'center',
                    padding: '50px',
                    color: '#1e40af',
                    fontSize: '1rem',
                    backgroundColor: '#e0f2fe',
                    borderRadius: '8px',
                    border: '2px double #bae6fd',
                }}>
                    No meaningful data to display for revenue in {year}.
                </div>
            )}

            {/* Chart */}
            {!loading && !error && chartData.labels.length > 0 && !chartData.datasets[0].data.every(val => val === 0) && (
                <div style={{
                    backgroundColor: '#ffffff',
                    padding: '25px',
                    borderRadius: '8px',
                    border: '2px double #c4b5fd',
                    height: '500px',
                }}>
                    <Line
                        data={chartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { position: 'top' },
                                title: {
                                    display: true,
                                    text: `Revenue in ${year}`,
                                    font: { size: 16, weight: 'bold', family: 'Roboto' },
                                    color: '#4c1d95',
                                    padding: { bottom: 20 },
                                },
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    title: {
                                        display: true,
                                        text: 'Revenue (VND)',
                                        font: { size: 14, family: 'Roboto' },
                                        color: '#4c1d95',
                                    },
                                    grid: { color: '#e5e7eb' },
                                },
                                x: {
                                    title: {
                                        display: true,
                                        text: 'Month',
                                        font: { size: 14, family: 'Roboto' },
                                        color: '#4c1d95',
                                    },
                                    grid: { display: false },
                                },
                            },
                        }}
                    />
                </div>
            )}
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
        </div>
    );
};

export default SalesChart;