import React from 'react';

type AdminHeaderProps = {
  onSignOut: () => void;
};

export default function AdminHeader({ onSignOut }: AdminHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-purple-600">Survey Admin</span>
            </div>
          </div>
          
          <div className="flex items-center">
            <button
              onClick={onSignOut}
              className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
} 