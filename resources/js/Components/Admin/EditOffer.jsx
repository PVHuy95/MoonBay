import '../../../css/home.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EditOffer = () => {
    const [offers, setOffers] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8000/api/special-offers')
            .then(response => {
                const filtered = response.data.filter(offer =>
                    offer.season || offer.free_services || offer.total_bill_threshold || offer.stay_duration_days || offer.other_package_description
                );
                setOffers(filtered);

                // Đợi DOM render xong rồi set dữ liệu vào form
                setTimeout(() => {
                    const first = filtered[0];
                    if (first) {
                        if (first.season) document.getElementById('season').value = first.season;
                        if (first.free_services) document.getElementById('service').value = first.free_services;
                        if (first.season_start) document.getElementById('seasonStart').value = first.season_start.substring(0, 10);
                        if (first.season_end) document.getElementById('seasonEnd').value = first.season_end.substring(0, 10);

                        if (first.total_bill_threshold) document.getElementById('totalBill').value = first.total_bill_threshold;
                        if (first.discount_percent) document.getElementById('discount').value = first.discount_percent;
                        if (first.discount_start) document.getElementById('discountStart').value = first.discount_start.substring(0, 10);
                        if (first.discount_end) document.getElementById('discountEnd').value = first.discount_end.substring(0, 10);

                        if (first.stay_duration_days) document.getElementById('totalDays').value = first.stay_duration_days;
                        if (first.gift_description) document.getElementById('souvenir').value = first.gift_description;
                        if (first.gift_start) document.getElementById('giftStart').value = first.gift_start.substring(0, 10);
                        if (first.gift_end) document.getElementById('giftEnd').value = first.gift_end.substring(0, 10);

                        if (first.other_package_description) document.getElementById('condition').value = first.other_package_description;
                        if (first.offer_type) document.getElementById('endow').value = first.offer_type;
                        if (first.other_offer_start) document.getElementById('otherStart').value = first.other_offer_start.substring(0, 10);
                        if (first.other_offer_end) document.getElementById('otherEnd').value = first.other_offer_end.substring(0, 10);
                    }
                }, 100); // đợi DOM render xong mới gán
            })
            .catch(error => {
                console.error("Error while getting offer:", error);
            });
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault(); // Ngăn reload trang

        // Lấy dữ liệu trực tiếp từ form
        const updatedOffer = {
            season: document.getElementById('season').value,
            free_services: document.getElementById('service').value,
            season_start: document.getElementById('seasonStart').value,
            season_end: document.getElementById('seasonEnd').value,

            total_bill_threshold: document.getElementById('totalBill').value,
            discount_percent: document.getElementById('discount').value,
            discount_start: document.getElementById('discountStart').value,
            discount_end: document.getElementById('discountEnd').value,

            stay_duration_days: document.getElementById('totalDays').value,
            gift_description: document.getElementById('souvenir').value,
            gift_start: document.getElementById('giftStart').value,
            gift_end: document.getElementById('giftEnd').value,

            other_package_description: document.getElementById('condition').value,
            offer_type: document.getElementById('endow').value,
            other_offer_start: document.getElementById('otherStart').value,
            other_offer_end: document.getElementById('otherEnd').value,
        };

        // Gửi dữ liệu lên server (giả sử bạn muốn cập nhật offer đầu tiên)
        const firstOfferId = offers[0]?.id;
        if (firstOfferId) {
            axios.put(`http://localhost:8000/api/special-offers/${firstOfferId}`, updatedOffer)
                .then(response => {
                    alert("Update successful!");
                    window.location.reload();
                })
                .catch(error => {
                    console.error("Error while updating:", error);
                    alert("An error occurred while sending data..");
                });
        } else {
            alert("No offers to update.");
        }
    };

    const [status, setStatus] = useState('');

    const sendOffers = async () => {
        try {
            const response = await axios.post('http://localhost:8000/api/send-offers', {}, {
                headers: { 'Accept': 'application/json' }
            });
            setStatus('Offers sent successfully!');
        } catch (error) {
            console.error('Error sending offers:', error);
            setStatus('Failed to send offers.');
        }
    };

    return (
        <>
        <div className="container py-5">
                <div className="card shadow-sm">
                    <div className="card-body text-center">
                        <h1 className="card-title mb-4">Send promotional information to customers</h1>
                        <button className="btn btn-primary mb-3" onClick={sendOffers}>Send Offers</button>
                        {status && <p className="alert alert-info">{status}</p>}
                    </div>
                </div>
            </div>

            <div className='row offer_Hung' style={{ padding: '0 5%', justifyContent: 'center', "--bs-gutter-x": 0 }}>
                                        {offers.map((offer, index) => (
                                            <React.Fragment key={index}>
                                                {/* Mùa + dịch vụ miễn phí */}
                                                {offer.season && offer.free_services &&
                                                    <div className='col-md-2' style={{ paddingBottom: '2%', marginRight: '2%' }}>
                                                        <div className='chiecla1_hung' style={{
                                                            backgroundImage: `url('/images/Hung/${offer.season.toLowerCase()}.jpg')`,
            
                                                            backgroundSize: 'cover',
                                                            width: '100%',
                                                            height: '200px'
            
                                                        }}>
                                                            <div className='row container chiecla1_hung' style={{
                                                                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                                                                color: 'white',
                                                                height: '100%',
                                                                paddingTop: '2%',
                                                                textAlign: 'center'
                                                            }}>
                                                                <div >
                                                                    <div><b>Season</b></div>
                                                                    <b>{offer.season}</b>
                                                                </div>
                                                                <hr />
                                                                <div>
                                                                    <div><b>Service</b></div>
                                                                    <b>{offer.free_services}</b>
                                                                </div>
                                                                <hr />
                                                                <div style={{ textAlign: 'center' }}>
                                                                    <b>Time</b>: <br /> {new Date(offer.season_start).toLocaleDateString('vi-VN')} - {new Date(offer.season_end).toLocaleDateString('vi-VN')}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                }
            
                                                {/* Ưu đãi bill */}
                                                {offer.total_bill_threshold && offer.discount_percent &&
                                                    <div className='col-md-2' style={{ paddingBottom: '2%', marginRight: '2%' }}>
                                                        <div style={{ width: '100%', height: '200px',
                                                                textAlign: 'center' }}>
                                                            <div className='row container chiecla1_hung' style={{
                                                                backgroundColor: '#1f97c9',
                                                                color: 'white',
                                                                height: '100%',
                                                                paddingTop: '2%'
                                                            }}>
                                                                <div ><div><b>Total Bill</b></div><b>{Math.floor(offer.total_bill_threshold).toLocaleString('vi-VN')} VND</b></div>
                                                                <hr />
                                                                <div ><div><b>Discount</b></div><b>{offer.discount_percent}%</b></div>
                                                                <hr />
                                                                <div style={{ textAlign: 'center' }}>
                                                                    <b>Time</b><br /> {new Date(offer.discount_start).toLocaleDateString('vi-VN')} - {new Date(offer.discount_end).toLocaleDateString('vi-VN')}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                }
            
                                                {/* Ưu đãi lưu trú */}
                                                {offer.stay_duration_days && offer.gift_description &&
                                                    <div className='col-md-2' style={{ paddingBottom: '2%', marginRight: '2%' }}>
                                                        <div style={{ width: '100%', height: '200px',
                                                                textAlign: 'center' }}>
                                                            <div className='row container chiecla1_hung' style={{
                                                                backgroundColor: '#1f97c9',
                                                                color: 'white',
                                                                height: '100%',
                                                                paddingTop: '2%'
                                                            }}>
                                                                <div ><div><b>Total days</b></div><b>{offer.stay_duration_days} day</b></div>
                                                                <hr />
                                                                <div ><div><b>Souvenir</b></div><b>{offer.gift_description}</b></div>
                                                                <hr />
                                                                <div style={{ textAlign: 'center' }}>
                                                                    <b>Time</b>: <br />{new Date(offer.gift_start).toLocaleDateString('vi-VN')} - {new Date(offer.gift_end).toLocaleDateString('vi-VN')}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                }
            
                                                {/* Ưu đãi khác */}
                                                {offer.other_package_description && offer.offer_type &&
                                                    <div className='col-md-2' style={{ paddingBottom: '2%'}}>
                                                        <div className='chiecla1_hung' style={{
                                                            backgroundImage: "url('/images/Hung/Uudaikhac.jpg')",
                                                            backgroundSize: 'cover',
                                                            width: '100%',
                                                            height: '200px'
                                                        }}>
                                                            <div className='row container chiecla1_hung' style={{
                                                                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                                                                color: 'white',
                                                                height: '100%',
                                                                paddingTop: '2%',
                                                                textAlign: 'center'
                                                            }}>
                                                                <div ><div><b>Condition</b></div><b>{offer.other_package_description}</b></div>
                                                                <hr />
                                                                <div ><div><b>Endow</b></div><b>{offer.offer_type}</b></div>
                                                                <hr />
                                                                <div style={{ textAlign: 'center'}}>
                                                                    <b>Time</b>: <br /> {new Date(offer.other_offer_start).toLocaleDateString('vi-VN')} - {new Date(offer.other_offer_end).toLocaleDateString('vi-VN')}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                }
                                            </React.Fragment>
                                        ))}
                                    </div>

            <div className="container mt-5">
                <h4 className="mb-4">Edit / Add Offer</h4>
                <form onSubmit={handleSubmit}>
                    <fieldset className="border p-3 mb-4">
                        <legend className="w-auto px-2">Seasons & Services</legend>
                        <div className="row">
                            <div className="form-group col-md-6">
                                <label htmlFor="season">Season</label>
                                <select className="form-control" id="season">
                                    <option>Spring</option><option>Summer</option><option>Autumn</option><option>Winter</option>
                                </select>
                            </div>
                            <div className="form-group col-md-6">
                                <label htmlFor="service">Service</label>
                                <select className="form-control" id="service">
                                    <option>Spa</option><option>Swimming pool</option><option>Gym</option><option>Buffet</option><option>Shuttle and Transportation</option>
                                </select>
                            </div>
                            <div className="form-group col-md-6">
                                <label htmlFor="seasonStart">Start Date</label>
                                <input type="date" className="form-control" id="seasonStart" />
                            </div>
                            <div className="form-group col-md-6">
                                <label htmlFor="seasonEnd">End Date</label>
                                <input type="date" className="form-control" id="seasonEnd" />
                            </div>
                        </div>
                    </fieldset>

                    <fieldset className="border p-3 mb-4">
                        <legend className="w-auto px-2">Invoice Offer</legend>
                        <div className="row">
                            <div className="form-group col-md-6">
                                <label htmlFor="totalBill">Total Bill (VND)</label>
                                <input type="number" className="form-control" id="totalBill" />
                            </div>
                            <div className="form-group col-md-6">
                                <label htmlFor="discount">Discount (%)</label>
                                <input type="number" className="form-control" id="discount" />
                            </div>
                            <div className="form-group col-md-6">
                                <label htmlFor="discountStart">Start Date</label>
                                <input type="date" className="form-control" id="discountStart" />
                            </div>
                            <div className="form-group col-md-6">
                                <label htmlFor="discountEnd">End Date</label>
                                <input type="date" className="form-control" id="discountEnd" />
                            </div>
                        </div>
                    </fieldset>

                    <fieldset className="border p-3 mb-4">
                        <legend className="w-auto px-2">Accommodation Offers</legend>
                        <div className="row">
                            <div className="form-group col-md-6">
                                <label htmlFor="totalDays">Total Stay Days</label>
                                <input type="number" className="form-control" id="totalDays" />
                            </div>
                            <div className="form-group col-md-6">
                                <label htmlFor="souvenir">Souvenir</label>
                                <input type="text" className="form-control" id="souvenir" />
                            </div>
                            <div className="form-group col-md-6">
                                <label htmlFor="giftStart">Start Date</label>
                                <input type="date" className="form-control" id="giftStart" />
                            </div>
                            <div className="form-group col-md-6">
                                <label htmlFor="giftEnd">End Date</label>
                                <input type="date" className="form-control" id="giftEnd" />
                            </div>
                        </div>
                    </fieldset>

                    <fieldset className="border p-3 mb-4">
                        <legend className="w-auto px-2">Other offers</legend>
                        <div className="row">
                            <div className="form-group col-md-6">
                                <label htmlFor="condition">Condition</label>
                                <input type="text" className="form-control" id="condition" />
                            </div>
                            <div className="form-group col-md-6">
                                <label htmlFor="endow">Endow</label>
                                <input type="text" className="form-control" id="endow" />
                            </div>
                            <div className="form-group col-md-6">
                                <label htmlFor="otherStart">Start Date</label>
                                <input type="date" className="form-control" id="otherStart" />
                            </div>
                            <div className="form-group col-md-6">
                                <label htmlFor="otherEnd">End Date</label>
                                <input type="date" className="form-control" id="otherEnd" />
                            </div>
                        </div>
                    </fieldset>

                    <div className="mt-4 d-flex justify-content-end gap-3">
                        <button type="submit" className="btn btn-primary">Submit</button>
                        <button type="reset" className="btn btn-secondary">Reset</button>
                    </div>
                </form>
            </div>
        </>
    );
}

export default EditOffer;