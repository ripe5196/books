import React, { useState } from 'react';

const weddingEvents = [
  { date: '2026-04-07', description: 'Ceremony at the park', emoji: '💍', image: 'url_to_image_1' },
  { date: '2026-04-08', description: 'Reception at the hall', emoji: '🥂', image: 'url_to_image_2' },
  // Add more events here
];

const Book = () => {
  const [currentPage, setCurrentPage] = useState(0);

  const nextPage = () => {
    if (currentPage < weddingEvents.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const addEvent = (event) => {
    weddingEvents.push(event);
    // Optionally reset to the new event
    // setCurrentPage(weddingEvents.length - 1);
  };

  return (
    <div>
      <h1>Wedding Events</h1>
      <div className="event">
        <h2>{weddingEvents[currentPage].date} {weddingEvents[currentPage].emoji}</h2>
        <p>{weddingEvents[currentPage].description}</p>
        <img src={weddingEvents[currentPage].image} alt={weddingEvents[currentPage].description} />
      </div>
      <div className="navigation">
        <button onClick={prevPage} disabled={currentPage === 0}>Previous</button>
        <button onClick={nextPage} disabled={currentPage === weddingEvents.length - 1}>Next</button>
      </div>
      {/* Add a form or interface for adding new events */}
      <button onClick={() => addEvent({ date: '2026-04-09', description: 'Honeymoon leave', emoji: '🌴', image: 'url_to_image_3' })}>Add Event</button>
    </div>
  );
};

export default Book;