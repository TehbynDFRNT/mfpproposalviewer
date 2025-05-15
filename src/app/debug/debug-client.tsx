/**
 * File: /Users/tehbynnova/Code/MyProjects/Web/mfp/src/app/debug/debug-client.tsx
 */
'use client';

import { useEffect, useState } from 'react';
import type { ProposalSnapshot } from '@/types/snapshot';

interface DebugClientProps {
  snapshotData: ProposalSnapshot | null;
  errorMessage: string | null;
  initialUuid: string;
}

export default function DebugClient({ snapshotData, errorMessage, initialUuid }: DebugClientProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [customerUuid, setCustomerUuid] = useState(initialUuid);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Log data on component mount
    if (snapshotData) {
      console.log('Complete snapshot object:', snapshotData);
    } else {
      console.warn('No snapshot data available');
    }
  }, [snapshotData]);

  const handleFetchNewSnapshot = async () => {
    if (!customerUuid.trim()) return;
    
    setIsLoading(true);
    // Using window.location to navigate with the new uuid
    window.location.href = `/debug?uuid=${encodeURIComponent(customerUuid)}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFetchNewSnapshot();
    }
  };

  // Shared UUID input component
  const UuidInput = () => (
    <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-grow">
          <label htmlFor="customer-uuid" className="block text-sm font-medium text-gray-700 mb-1">
            Customer UUID
          </label>
          <input
            id="customer-uuid"
            type="text"
            value={customerUuid}
            onChange={(e) => setCustomerUuid(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter customer UUID..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={handleFetchNewSnapshot}
            disabled={isLoading || !customerUuid.trim()}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Loading...' : 'Fetch Snapshot'}
          </button>
        </div>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Enter a customer UUID to fetch their proposal snapshot data
      </p>
    </div>
  );

  // Render different UI based on data availability
  if (errorMessage) {
    return (
      <div className="p-8 bg-red-50 text-red-800 rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Error Loading Debug Data</h1>
        <UuidInput />
        <p className="mb-4">{errorMessage}</p>
        <div className="text-sm bg-white p-4 rounded border border-red-200">
          <h2 className="font-semibold mb-2">Troubleshooting Tips:</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Check that getProposalSnapshot is properly implemented</li>
            <li>Verify the UUID is correct and exists in your database</li>
            <li>Check backend console logs for additional errors</li>
          </ul>
        </div>
      </div>
    );
  }

  if (!snapshotData) {
    return (
      <div className="p-8 bg-yellow-50 text-yellow-800 rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
        <UuidInput />
        <p className="mb-4">No data was returned from getProposalSnapshot</p>
        <p>This could mean:</p>
        <ul className="list-disc pl-5 mb-4">
          <li>The UUID doesn't exist in your database</li>
          <li>getProposalSnapshot returned null or undefined</li>
          <li>There might be an issue with your database connection</li>
        </ul>
      </div>
    );
  }

  return (
    <div className="p-8 bg-blue-50 text-blue-800 rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Debug Page - Data Loaded</h1>
      <UuidInput />
      <p className="mb-4">✅ Snapshot data loaded successfully</p>
      <p>Check the browser console for detailed logs</p>
      
      <div className="mt-8 bg-white p-4 rounded shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Complete Snapshot Data:</h2>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded text-sm transition-colors"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
        <pre className={`text-xs bg-gray-100 p-3 rounded overflow-auto ${isExpanded ? 'max-h-[80vh]' : 'max-h-[50vh]'}`}>
          {JSON.stringify(snapshotData, null, 2)}
        </pre>
      </div>
    </div>
  );
}