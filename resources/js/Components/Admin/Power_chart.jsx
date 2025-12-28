import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Đăng ký các thành phần cần thiết cho ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PowerChart = () => {
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });
    const [year, setYear] = useState(2025);
    const [chartType, setChartType] = useState('month');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        const urlMap = {
            month: `http://localhost:8000/api/chart/bookings-ratio/month/${year}`,
            quarter: `http://localhost:8000/api/chart/bookings-ratio/quarter/${year}`,
        };

        const url = urlMap[chartType];
        console.log('Fetching data from:', url);

        axios.get(url)
            .then(response => {
                const data = response.data;
                console.log('API response:', data);

                if (!Array.isArray(data) || data.length === 0) {
                    setError('No data available from API');
                    setChartData({ labels: [], datasets: [] });
                    setLoading(false);
                    return;
                }

                let labels = [];
                let ratios = [];

                if (chartType === 'month') {
                    labels = data.map(item => `Month ${item.month}`);
                    ratios = data.map(item => item.ratio || 0);
                } else {
                    labels = data.map(item => `Quarter ${item.quarter}`);
                    ratios = data.map(item => item.ratio || 0);
                }

                const hasNonZeroData = ratios.some(ratio => ratio > 0);
                if (!hasNonZeroData) {
                    console.warn('All ratios are 0. Chart may appear empty.');
                }

                setChartData({
                    labels,
                    datasets: [
                        {
                            label: 'Booking Ratio (%)',
                            data: ratios,
                            backgroundColor: Array(labels.length).fill('rgba(75, 192, 192, 0.6)'),
                            borderColor: Array(labels.length).fill('rgba(75, 192, 192, 1)'),
                            borderWidth: 1,
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
    }, [year, chartType]);

    const handleYearChange = (e) => {
        setYear(parseInt(e.target.value));
    };

    const handleChartTypeChange = (e) => {
        setChartType(e.target.value);
    };

    return (
        <div style={{
            maxWidth: '900px',
            margin: '0 auto',
            padding: '20px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            fontFamily: 'Arial, sans-serif',
        }}>
            <h2 style={{
                textAlign: 'center',
                color: '#1f2937',
                marginBottom: '20px',
                fontSize: '1.5rem',
                fontWeight: '600',
            }}>
                Booking Ratio Dashboard
            </h2>

            {/* Control Panel */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '15px',
                marginBottom: '20px',
                padding: '15px',
                backgroundColor: '#ffffff',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{
                        fontSize: '0.9rem',
                        color: '#374151',
                        fontWeight: '500',
                    }}>
                        Select Year:
                    </label>
                    <select
                        value={year}
                        onChange={handleYearChange}
                        style={{
                            padding: '8px 12px',
                            fontSize: '0.9rem',
                            borderRadius: '4px',
                            border: '1px solid #d1d5db',
                            backgroundColor: '#fff',
                            cursor: 'pointer',
                        }}
                    >
                        {[2023, 2024, 2025, 2026].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{
                        fontSize: '0.9rem',
                        color: '#374151',
                        fontWeight: '500',
                    }}>
                        Chart Type:
                    </label>
                    <select
                        value={chartType}
                        onChange={handleChartTypeChange}
                        style={{
                            padding: '8px 12px',
                            fontSize: '0.9rem',
                            borderRadius: '4px',
                            border: '1px solid #d1d5db',
                            backgroundColor: '#fff',
                            cursor: 'pointer',
                        }}
                    >
                        <option value="month">Monthly</option>
                        <option value="quarter">Quarterly</option>
                    </select>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#6b7280',
                    fontSize: '1rem',
                }}>
                    Loading data...
                </div>
            )}

            {/* Error State */}
            {error && (
                <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#dc2626',
                    fontSize: '1rem',
                    backgroundColor: '#fef2f2',
                    borderRadius: '6px',
                    border: '1px solid #fecaca',
                }}>
                    Error: {error}
                </div>
            )}

            {/* No Data State */}
            {!loading && !error && (chartData.labels.length === 0 || chartData.datasets[0].data.every(val => val === 0)) && (
                <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#6b7280',
                    fontSize: '1rem',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                }}>
                    No meaningful data to display for {chartType} in {year}.
                </div>
            )}

            {/* Chart */}
            {!loading && !error && chartData.labels.length > 0 && !chartData.datasets[0].data.every(val => val === 0) && (
                <div style={{
                    backgroundColor: '#ffffff',
                    padding: '20px',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    height: '500px',
                }}>
                    <Bar
                        data={chartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { position: 'top' },
                                title: {
                                    display: true,
                                    text: `Booking Ratio in ${year} (${chartType.charAt(0).toUpperCase() + chartType.slice(1)})`,
                                    font: { size: 16, weight: 'bold' },
                                    color: '#1f2937',
                                    padding: { bottom: 20 },
                                },
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    max: 100,
                                    title: {
                                        display: true,
                                        text: 'Ratio (%)',
                                        font: { size: 14 },
                                        color: '#374151',
                                    },
                                    grid: { color: '#e5e7eb' },
                                },
                                x: {
                                    title: {
                                        display: true,
                                        text: chartType === 'month' ? 'Month' : 'Quarter',
                                        font: { size: 14 },
                                        color: '#374151',
                                    },
                                    grid: { display: false },
                                },
                            },
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default PowerChart;