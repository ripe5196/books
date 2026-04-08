import React from 'react';
import './Book.css';

const Book = ({ events }) => {
  return (
    <div className="book">
      <h1>Wedding Events</h1>
      <div className="timeline">
        {events.map((event, index) => (
          <div className="event" key={index}>
            <h2>{event.title}</h2>
            <p>{event.date}</p>
            <p>{event.location}</p>
            <div className="details">
              {event.details}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Book;