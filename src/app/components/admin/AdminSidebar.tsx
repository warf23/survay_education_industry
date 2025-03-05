import React from 'react';

type AdminSidebarProps = {
  activeView: string;
  setActiveView: (view: string) => void;
};

export default function AdminSidebar({ activeView, setActiveView }: AdminSidebarProps) {
  const navItems = [
    { id: 'table', label: 'Table View', icon: 'table' },
    { id: 'analytics', label: 'Analytics', icon: 'chart-bar' },
    { id: 'export', label: 'Export Data', icon: 'download' },
  ];

  const getIcon = (icon: string) => {
    switch (icon) {
      case 'table':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'chart-bar':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'download':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full md:w-64 bg-white shadow-sm border-b md:border-b-0 md:border-r border-gray-200">
      <div className="p-3 md:py-4 md:px-3">
        <div className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-1 overflow-x-auto md:overflow-x-visible">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap md:whitespace-normal ${
                activeView === item.id
                  ? 'bg-emerald-100 text-emerald-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="mr-3">{getIcon(item.icon)}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 