import React from 'react';
import Navbar from '../shared/layouts/Navbar';
import Footer from '../shared/layouts/Footer';
import Content from '../shared/layouts/Content';

const HomePage: React.FC = () => {
  return (
    <div className="leading-normal tracking-normal text-white gradient" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
      <Navbar />
      <Content />
      <Footer />
    </div>
  );
};

export default HomePage;
