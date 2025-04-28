import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Content from '../components/common/Content';
import '../styles/home.css';

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
