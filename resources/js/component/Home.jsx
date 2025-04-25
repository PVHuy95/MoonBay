import React from 'react';
import '../../css/home.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import BookingForm from './BookingForm';

const Home = () => {
    return (
        <>
            <div className="page-header section-dark" style={{ backgroundImage: "url('./images/demo.jpg')" }}>
                <div className="filter"></div>
                <div className="content-center">
                    <div className="container">
                        <div className="title-brand">
                            <h3>Away from monotonous life</h3>
                            <h1 className="presentation-title">Relax Your Mind</h1>
                            <div className="fog-low">
                                <img src="./images/fog-low.png" alt="" />
                            </div>
                            <div className="fog-low right">
                                <img src="./images/fog-low.png" alt="" />
                            </div>
                        </div>
                        <div style={{ marginTop: '7%' }} className='custom-container'>
                            <BookingForm />
                        </div>
                    </div>
                </div>
                <div className="moving-clouds" style={{ backgroundImage: "url('./images/clouds.png')" }}></div>
            </div>

            <div>
                <section className="accomodation-area py-5">
                    <div >
                        <div className="section-title text-center mb-5">
                            <h2 className="text">Hotel Accommodation</h2>
                            <p>
                                We all live in an age that belongs to the young at heart. Life that is becoming extremely fast,
                            </p>
                        </div>
                        <div className="row justify-content-center g-0 hung">
                            {rooms.map((room, index) => (
                                <div key={index} className="col-lg-2 col-sm-6 mb-4">
                                    <div className="card text-center h-100 accomodation-item">
                                        <div className="position-relative">
                                            <img
                                                src={room.image}
                                                className="card-img-top"
                                                alt={room.title}
                                                style={{ height: '200px', objectFit: 'cover' }}
                                            />
                                            <a
                                                href="#"
                                                className="btn btn-warning position-absolute bottom-0 start-50 translate-middle-x mb-3"
                                            >
                                                Book Now
                                            </a>
                                        </div>
                                        <div className="card-body">
                                            <h4 className="card-title">{room.title}</h4>
                                            <h5 className="card-text">
                                                ${room.price}
                                                <small className="text-muted">/night</small>
                                            </h5>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
            <div>
                <section className="latest_blog_area section_gap py-5">
                    <div >
                        <div className="section_title text-center mb-4">
                            <h2 className="title_color">Latest Posts from Blog</h2>
                            <p>
                                The French Revolution constituted for the conscience of the dominant aristocratic class a fall from
                            </p>
                        </div>
                        <div className="row justify-content-center g-0 hung">
                            {blogs.map((blog, index) => (
                                <div className="col-lg-3 col-md-6 mb-4" key={index}>
                                    <div className="single-recent-blog-post card h-100">
                                        <div className="thumb">
                                            <img className="img-fluid card-img-top" src={blog.image} alt="post" />
                                        </div>
                                        <div className="details card-body">
                                            <div className="tags mb-2">
                                                {blog.tags.map((tag, tagIndex) => (
                                                    <a key={tagIndex} href="#" className="btn btn-sm tag-btn-custom me-1">
                                                        {tag}
                                                    </a>
                                                ))}
                                            </div >
                                            <div className='abc'>
                                                <a href="#" >
                                                    <h4 className="sec_h4 card-title">{blog.title}</h4>
                                                </a>
                                            </div>
                                            <p className="card-text">{blog.description}</p>
                                            <h6 className="date title_color mt-3">{blog.date}</h6>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </>
    )
}
const rooms = [
    {
        image: './images/Hung/room1.jpg',
        title: 'Double Deluxe',
        price: 250
    },
    {
        image: './images/Hung/room2.jpg',
        title: 'Single Deluxe',
        price: 200
    },
    {
        image: './images/Hung/room3.jpg',
        title: 'Honeymoon Suit',
        price: 750
    },
    {
        image: './images/Hung/room4.jpg',
        title: 'Economy Double',
        price: 200
    }
];
const blogs = [
    {
        image: "./images/Hung/blog-1.jpg",
        tags: ["Travel", "Life Style"],
        title: "Low Cost Advertising",
        description: "Acres of Diamonds… you’ve read the famous story, or at least had it related to you. A farmer.",
        date: "31st January, 2018",
    },
    {
        image: "./images/Hung/blog-2.jpg",
        tags: ["Travel", "Life Style"],
        title: "Creative Outdoor Ads",
        description: "Self-doubt and fear interfere with our ability to achieve or set goals. Self-doubt and fear are",
        date: "31st January, 2018",
    },
    {
        image: "./images/Hung/blog-3.jpg",
        tags: ["Travel", "Life Style"],
        title: "It S Classified How To Utilize Free",
        description: "Why do you want to motivate yourself? Actually, just answering that question fully can",
        date: "31st January, 2018",
    },
];
export default Home;