import React from 'react';
import { Link } from 'react-router-dom';
import logo from '@/assets/images/logo.svg';
import DeadlineBanner from '../components/deadlineBanner';
import DeliverableSubject from '../components/delivrableSubject';
import DeliverableUpload from '../components/delivrableUpload';
import TeamMembers from '../components/teamMembers';
import DelivrableDefense from '../components/delivrableDefense';
import ReportEditor from '../components/reportEditor';

const StudentLivrablePage: React.FC = () => {
  return (
    <div
      className="leading-normal tracking-normal text-white min-h-screen bg-gradient-to-b from-red-500 to-pink-300 pb-24"
      style={{ fontFamily: "'Source Sans Pro', sans-serif" }}
    >
      {/* Navbar */}
      <nav className="fixed w-full z-30 top-0 text-white bg-gradient-to-b from-red-500 to-pink-300 bg-opacity-90 backdrop-blur-md shadow-md">
        <div className="w-full container mx-auto flex flex-wrap items-center justify-between mt-0 py-2">
          <div className="pl-4 flex items-center">
            <Link
              to="/"
              className="toggleColour text-white no-underline hover:no-underline font-bold text-2xl lg:text-4xl"
            >
              <img src={logo} alt="Kōdō Logo" className="h-12 inline mr-2" />
              <span className="mt-4">Kōdō</span>
            </Link>
          </div>
        </div>
        <hr className="border-b border-white opacity-25 my-0 py-0" />
      </nav>

      {/* Timer */}
      <div className="pt-20">
        <DeadlineBanner />
      </div>

      {/* Contenus principaux */}
      <DeliverableSubject />
      <TeamMembers />
      <DelivrableDefense />
      <ReportEditor />
      <DeliverableUpload />
    </div>
  );
};

export default StudentLivrablePage;