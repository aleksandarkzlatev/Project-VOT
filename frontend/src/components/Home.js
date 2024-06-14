import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <h1>Welcome to the App</h1>
      <p>This is the home page. You can navigate to the messages page to see messages.</p>
      <Link to="/messages">Go to Messages</Link>
    </div>
  );
};

export default Home;
