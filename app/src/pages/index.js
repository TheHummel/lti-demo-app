import '../app/globals.css';

import React from 'react';

const HomePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-4">Hello, World!</h1>
      <p className="text-lg mb-4">This is the home page of my Next.js app.</p>
      <div className="absolute top-4 right-4">
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Login</button>
      </div>
    </div>
  );
};

export default HomePage;