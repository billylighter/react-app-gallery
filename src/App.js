import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import {Button, Col, Container, Row} from "react-bootstrap";
import Spinner from 'react-bootstrap/Spinner';
import { createClient } from 'pexels';
import { useEffect, useState } from "react";
import FsLightbox from 'fslightbox-react';

const client = createClient(process.env.REACT_APP_API_KEY);

function App() {
    const [isImagesLoaded, setIsImagesLoaded] = useState(false);
    const [images, setImages] = useState([]);
    const [page, setPage] = useState(1);

    // State for FsLightbox
    const [lightboxToggler, setLightboxToggler] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [lightboxSources, setLightboxSources] = useState([]); // Store image sources for FsLightbox

    // Function to fetch images
    const getImages = (currentPage) => {
        setIsImagesLoaded(false);
        client.photos.search({ query: 'nature', per_page: 15, page: currentPage })
            .then((response) => {
                const newImages = response.photos;
                setImages((prevImages) => [...prevImages, ...newImages]);

                // Update lightbox sources with large image URLs
                setLightboxSources((prevSources) => [
                    ...prevSources,
                    ...newImages.map(img => img.src.large)
                ]);

                setIsImagesLoaded(true);
            })
            .catch((error) => {
                console.error('Error fetching photos:', error);
                setIsImagesLoaded(true); // Ensure we reset the loading state
            });
    };

    // Fetch images when 'page' state changes
    useEffect(() => {
        getImages(page);
    }, [page]);

    // Function to handle loading more images
    const loadMoreImages = () => {
        setPage((prevPage) => prevPage + 1); // Increment the page to fetch new images
    };

    // Open FsLightbox when an image is clicked
    const openLightbox = (index) => {
        setLightboxIndex(index);
        setLightboxToggler(!lightboxToggler);
    };

    return (
        <Container className="my-5">
            <Row>
                <Col md={10} className="mx-auto">

                    {(Array.isArray(images) && images.length) ? (
                        <div className='masonry-container'>
                            {images.map((img, index) => (
                                <div key={index} className="masonry-item" onClick={() => openLightbox(index)}>
                                    <img
                                        src={img.src.medium}
                                        alt={`Nature ${img.id}`}
                                        className="d-block img-fluid rounded"
                                        srcSet={`
                                            ${img.src.tiny} 320w, 
                                            ${img.src.small} 480w, 
                                            ${img.src.medium} 800w, 
                                            ${img.src.large} 1200w
                                        `}
                                        sizes="(max-width: 600px) 320px, (max-width: 1000px) 480px, 800px"
                                    />
                                </div>
                            ))}
                        </div>
                    ) : ('')}

                    {/* Conditional rendering */}
                    {!isImagesLoaded ? (
                        <div className={'text-center p-3'}>
                            <Spinner animation="border" role="status" variant="primary">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    ) : ('')}

                    {/* Button to load more */}
                    <div className="text-center">
                        <Button
                            variant={"primary"}
                            size={"lg"}
                            onClick={loadMoreImages}
                            className="mt-4 py-3 px-5"
                            disabled={!isImagesLoaded}
                        >
                            {isImagesLoaded ? 'Load more images' : 'Loading images...'}
                        </Button>
                    </div>
                </Col>
            </Row>

            {/* FsLightbox Component */}
            <FsLightbox
                toggler={lightboxToggler}
                sources={lightboxSources}

                slide={lightboxIndex + 1}
            />
        </Container>
    );
}

export default App;
