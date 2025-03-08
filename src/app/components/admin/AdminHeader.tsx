import React, { useEffect, useState } from 'react';
import { getCurrentAdminUser } from '@/lib/admin-auth';
import Image from 'next/image';

type AdminHeaderProps = {
  onSignOut: () => void;
};

type AdminUser = {
  id: string;
  email: string | null;
  name: string;
  avatar: string | null;
};

export default function AdminHeader({ onSignOut }: AdminHeaderProps) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await getCurrentAdminUser();
      if (userData) {
        setUser(userData as AdminUser);
      }
    };

    fetchUserData();
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-lg sm:text-xl font-bold text-emerald-600">Survey Admin</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* User Profile Section */}
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-3 focus:outline-none"
              >
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-700">{user?.name || 'Loading...'}</span>
                  <span className="text-xs text-gray-500">{user?.email || ''}</span>
                </div>
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden border-2 border-emerald-200">
                  {user?.avatar ? (
                    <Image 
                      src={user.avatar} 
                      alt={user.name} 
                      width={40} 
                      height={40} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-emerald-700 font-medium text-lg">
                      {user?.name?.charAt(0).toUpperCase() || 'A'}
                    </span>
                  )}
                </div>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={onSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 