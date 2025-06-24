import React from 'react';
import { Link } from 'react-router-dom';

const GV_GlobalFooter: React.FC = () => {
  // Explicit type annotations for clarity and future extensibility
  const termsOfServiceURL = "https://example.com/terms-of-service";
  const privacyPolicyURL = "https://example.com/privacy-policy";

  const externalURLs = [
    {
      label: "Terms of Service",
      href: termsOfServiceURL,
    },
    {
      label: "Privacy Policy",
      href: privacyPolicyURL,
    },
  ];

  return (
    <>
      {/* Persistent Global Footer Styled with Tailwind CSS */}
      <footer className="fixed bottom-0 w-full bg-gray-800 text-gray-300 text-sm p-4 flex flex-col md:flex-row justify-between items-center">
        {/* Legal Links Section */}
        <div className="flex gap-4">
          {externalURLs.map(({ label, href }, index) => (
            <a
              key={index}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-100 transition duration-200"
            >
              {label}
            </a>
          ))}
        </div>

        {/* Optional Social Media Links Section */}
        {/* Uncomment and extend if social media links are applicable 
        <div className="flex gap-4">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500">
            Facebook
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
            Twitter
          </a>
        </div> */}

        {/* Copyright Notice */}
        <p className="mt-4 md:mt-0 text-center">
          &copy; {new Date().getFullYear()} TaskMaster. All rights reserved.
        </p>
      </footer>
    </>
  );
};

export default GV_GlobalFooter;