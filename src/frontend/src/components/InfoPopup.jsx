import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const InfoPopup = () => {
  const [showInfo, setShowInfo] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowInfo(false);
      }
    };

    // Add when popup is shown
    if (showInfo) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showInfo]);

  return (
    <div className="relative">
      {/* Your button to toggle the popup */}
      <button 
        onClick={() => setShowInfo(!showInfo)}
        className="text-gray-500 hover:text-gray-700"
      >
        {/* Your button icon/content */}
        <svg>...</svg>
      </button>

      <AnimatePresence>
        {showInfo && (
          <motion.div
            ref={popupRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 z-50 border border-gray-200 whitespace-nowrap"
          >
            <div className="flex items-center mb-2">
              <svg
                className="w-5 h-5 mr-2"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              <a 
                href="https://github.com/notcarlybates" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-gray-800 hover:text-blue-600"
              >
                Made by Carly Bates
              </a>
            </div>
            <p className="text-sm text-gray-600 whitespace-normal">User guide coming soon.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InfoPopup;