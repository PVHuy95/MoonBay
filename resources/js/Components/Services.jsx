import React, { useState, useRef, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../css/Services.css';
import Sitemapmini from './sitemapmini';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Banner from './banner';

// Component Popup cho dịch vụ
const ServicePopup = ({ service, onClose }) => {
  return (
    <div className="service-popup-overlay" onClick={onClose}>
      <div className="service-popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="service-popup-header">
          <h2>{service.title}</h2>
          <span className={`badge ms-3 ${service.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>{service.status === 'active' ? 'Active' : 'Inactive'}</span>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="service-popup-body">
          <div className="service-popup-image">
            <img src={service.image} alt={service.title} />
          </div>
          <div className="service-popup-description">
            <p>{service.description}</p>
            {service.detailedDescription && (
              <div className="service-details-extra">
                <h3>Details of the Service</h3>
                <p>{service.detailedDescription}</p>
              </div>
            )}
            {service.pricing && (
              <div className="service-pricing">
                <h3>Pricing</h3>
                <ul>
                  {service.pricing.map((price, index) => (
                    <li key={index}>{price.type}: {price.value}</li>
                  ))}
                </ul>
              </div>
            )}
            {service.workingHours && (
              <div className="service-hours">
                <h3>Working Hours</h3>
                <p>{service.workingHours}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Services = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const serviceRefs = useRef({});
  
  useEffect(() => {
    fetch("/api/services")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch services");
        return res.json();
      })
      .then((data) => {
        // Chuyển đổi key cho đúng với frontend
        const mapped = data.map((service) => ({
          ...service,
          detailedDescription: service.detailed_description,
          workingHours: service.working_hours,
          pricing: service.pricing || [],
        }));
        setServices(mapped);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const openServicePopup = (service) => {
    setSelectedService(service);
  };
  
  const closeServicePopup = () => {
    setSelectedService(null);
  };

  const scrollToService = (serviceId) => {
    const serviceElement = serviceRefs.current[serviceId];
    if (serviceElement) {
      serviceElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const sitemap = [
    { label: 'Home', link: '/' },
    { label: 'Services' }
  ];
  
  return (
    <>
      <Banner title="Our Services" />
      <section className="container">
        <Sitemapmini items={sitemap} />
        {loading ? (
          <div className="text-center my-5">Loading services...</div>
        ) : error ? (
          <div className="text-danger text-center my-5">{error}</div>
        ) : (
          <>
            <div className="service-nav-horizontal mb-5">
              {services.map((service, index) => (
                <button
                  key={index}
                  className="nav-item"
                  onClick={() => scrollToService(index)}
                >
                  <b>{service.title}</b>
                </button>
              ))}
            </div>

            <h2 className="text-center mb-5">Services</h2>
            <div className="service-list">
              {services.map((service, index) => (
                <div
                  key={index}
                  ref={(el) => (serviceRefs.current[index] = el)}
                  className={`service-item d-flex align-items-center mb-5 ${
                    index % 2 === 0 ? '' : 'flex-row-reverse'
                  }`}
                >
                  <div className="service-image">
                    <img src={service.image} alt={service.title} />
                  </div>
                  <div className="service-info p-4">
                    <div className="d-flex align-items-center mb-2">
                      <h5 className="mb-0 me-3">{service.title}</h5>
                      <span className={`badge ${service.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>{service.status === 'active' ? 'Active' : 'Inactive'}</span>
                    </div>
                    <p className="text-muted mb-3">
                      <i className="fas fa-clock me-1"></i> {service.workingHours}
                    </p>
                    <p>{service.description}</p>
                    <button 
                      className="btn btn-primary mt-3"
                      onClick={() => openServicePopup(service)}
                      disabled={service.status !== 'active'}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {selectedService && (
        <ServicePopup service={selectedService} onClose={closeServicePopup} />
      )}
    </>
  );
};

export default Services;