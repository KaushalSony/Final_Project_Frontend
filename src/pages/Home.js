import React from 'react';
import '../styles/Home.css';

function Home() {
  return (
    <div className="home">
      <h1>Welcome to My App</h1>
      <p>This is the home page of our application.</p>
      <div className="features">
        <div className="feature-card">
          <h3>Feature 1</h3>
          <p>Description of feature 1</p>
        </div>
        <div className="feature-card">
          <h3>Feature 2</h3>
          <p>Description of feature 2</p>
        </div>
        <div className="feature-card">
          <h3>Feature 3</h3>
          <p>Description of feature 3</p>
        </div>
      </div>
    </div>
  );
}

export default Home; 