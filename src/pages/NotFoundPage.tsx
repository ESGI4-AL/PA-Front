import React from 'react';
import page_not_found_logo from '../assets/images/page_not_found_logo.svg';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="gradient relative">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-white font-bold text-4xl md:text-5xl text-center">
            Oops! Page Not Found
          </h1>
        </div>
        <svg className="wave-top w-full" viewBox="0 0 1440 116" xmlns="http://www.w3.org/2000/svg">
          <path className="wave" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,116L1360,116C1280,116,1120,116,960,116C800,116,640,116,480,116C320,116,160,116,80,116L0,116Z" />
        </svg>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="max-w-xl w-full text-center">
          <div className="mb-8">
            <div className="bg-pink-100 rounded-full w-60 h-60 mx-auto mb-4 relative flex items-center justify-center">
              <div className="sushi-character relative">
                <img
                  src={page_not_found_logo}
                  alt="broken kodo mascot"
                  className="w-45 h-45 object-contain"
                />
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Looks like this roll has gone missing!
          </h2>

          <p className="text-gray-600 mb-8">
            The page you're looking for seems to have been eaten or might still be in the kitchen.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
