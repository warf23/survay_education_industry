'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { SurveyResponse } from '@/app/admin/dashboard/page';
import { exportToCsv } from '@/lib/admin-data';

type SurveyResponsesTableProps = {
  data: SurveyResponse[];
};

export default function SurveyResponsesTable({ data }: SurveyResponsesTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState<SurveyResponse | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  // Simulate loading effect for demo
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Get all column headers from the data
  const columns = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter(item => {
      return Object.values(item).some(value => 
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [data, searchTerm]);

  // Sort data based on sort configuration
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      // Handle null/undefined values
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  // Handle sorting
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing rows per page
  };

  // Calculate visible page numbers
  const getVisiblePageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if there are 5 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Complex pagination logic
      if (currentPage <= 3) {
        // Near the start
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push(-1); // Represents ellipsis
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pageNumbers.push(1);
        pageNumbers.push(-1); // Represents ellipsis
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // Middle
        pageNumbers.push(1);
        pageNumbers.push(-1); // Represents ellipsis
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push(-1); // Represents ellipsis
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="relative w-20 h-20">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-emerald-200 rounded-full animate-pulse"></div>
            <div className="absolute top-0 left-0 w-full h-full border-t-4 border-emerald-600 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-emerald-600 font-medium">Loading data...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div 
        className="bg-white rounded-lg shadow-lg p-6 opacity-100 transition-opacity duration-500"
      >
        <div className="text-center py-12">
          <div className="rounded-full bg-emerald-50 w-24 h-24 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No survey responses found</h3>
          <p className="mt-2 text-sm text-gray-500">There are no survey responses in the database yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 opacity-100 transition-opacity duration-500"
    >
      {/* Table controls */}
      <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-50 to-white">
        <div className="relative w-full sm:w-auto group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search responses..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm transition-all duration-200 ease-in-out"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        
        <div className="flex items-center space-x-3 w-full sm:w-auto mt-2 sm:mt-0">
          <button
            onClick={() => exportToCsv(data, 'survey_responses.csv')}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 w-full sm:w-auto justify-center sm:justify-start shadow-sm transition-all duration-200 ease-in-out"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download CSV
          </button>
          
          <div className="relative">
          <select
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
              className="appearance-none px-3 py-2 pl-3 pr-8 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm transition-all duration-200 ease-in-out"
          >
            <option value={10}>10 rows</option>
            <option value={25}>25 rows</option>
            <option value={50}>50 rows</option>
            <option value={100}>100 rows</option>
          </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border-collapse">
          <thead className="bg-gradient-to-r from-emerald-100 to-emerald-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="px-6 py-3.5 text-left text-xs font-bold text-emerald-800 uppercase tracking-wider cursor-pointer group relative"
                  onClick={() => requestSort(column)}
                >
                  <div className="flex items-center">
                    <span className="transition-all duration-200 group-hover:text-emerald-600">
                    {column.replace(/_/g, ' ')}
                    </span>
                    {sortConfig?.key === column ? (
                      <span className="ml-1 text-emerald-600">
                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                      </span>
                    ) : (
                      <span className="ml-1 opacity-0 group-hover:opacity-50 transition-opacity duration-200">↑</span>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></div>
                </th>
              ))}
              <th scope="col" className="px-6 py-3.5 text-right text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, rowIndex) => (
                <tr 
                  key={rowIndex}
                  className={`${hoveredRow === rowIndex ? 'bg-emerald-50' : 'hover:bg-gray-50'} transition-colors duration-150 ease-in-out`}
                  onMouseEnter={() => setHoveredRow(rowIndex)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                {columns.map((column) => (
                    <td key={column} className="px-6 py-4 whitespace-normal text-sm text-gray-700 border-b border-gray-100">
                      <div className="max-h-20 overflow-hidden">
                    {row[column] !== null && row[column] !== undefined
                      ? String(row[column]).length > 150
                        ? `${String(row[column]).substring(0, 150)}...`
                        : String(row[column])
                      : ''}
                      </div>
                  </td>
                ))}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium border-b border-gray-100">
                    <button
                    onClick={() => setSelectedRow(row)}
                      className="inline-flex items-center text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 px-3 py-1.5 rounded-md border border-emerald-200 transition-all duration-200 shadow-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </button>
                </td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-white to-emerald-50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-700 w-full sm:w-auto text-center sm:text-left">
          Showing 
          <span className="font-medium mx-1 text-emerald-700">
            {Math.min(sortedData.length, (currentPage - 1) * rowsPerPage + 1)}
          </span> 
          to
          <span className="font-medium mx-1 text-emerald-700">
            {Math.min(sortedData.length, currentPage * rowsPerPage)}
          </span> 
          of
          <span className="font-medium mx-1 text-emerald-700">
            {sortedData.length}
          </span> 
          results
        </div>
        
        <div className="flex space-x-1.5 w-full sm:w-auto justify-center sm:justify-end">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {getVisiblePageNumbers().map((pageNum, index) => 
            pageNum === -1 ? (
              <span key={`ellipsis-${index}`} className="px-3 py-1.5 text-gray-500">
                ...
              </span>
            ) : (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`min-w-[2.5rem] px-3 py-1.5 border rounded-md text-sm transition-all duration-200 ${
                  currentPage === pageNum
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                    : 'border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50'
                }`}
              >
                {pageNum}
              </button>
            )
          )}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Details Modal */}
      {selectedRow && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedRow(null)}
          >
            <div 
              className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-emerald-50 to-white">
                <h3 className="text-lg font-medium text-emerald-800">Response Details</h3>
                <button
                onClick={() => setSelectedRow(null)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none transition-colors duration-200"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(selectedRow).map(([key, value]) => (
                    <div 
                      key={key} 
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-emerald-200 transition-all duration-200 bg-white"
                    >
                      <h4 className="text-sm font-medium text-emerald-600 mb-1">{key.replace(/_/g, ' ')}</h4>
                      <div className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded min-h-[3rem] border border-gray-100">
                      {value !== null && value !== undefined ? String(value) : ''}
                    </div>
                    </div>
                ))}
              </div>
            </div>
            
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end bg-gradient-to-r from-white to-emerald-50">
                <button
                onClick={() => setSelectedRow(null)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm transition-colors duration-200"
              >
                Close
                </button>
            </div>
            </div>
          </div>
      )}
    </div>
  );
} 