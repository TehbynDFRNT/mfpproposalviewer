'use client';

import { useEffect } from 'react';
import type { Snapshot } from '@/app/lib/types/snapshot';

interface DebugClientProps {
  snapshotData: Snapshot | null;
  errorMessage: string | null;
}

export default function DebugClient({ snapshotData, errorMessage }: DebugClientProps) {
  useEffect(() => {
    // Log data on component mount
    if (snapshotData) {
      console.log('Complete snapshot object:', snapshotData);
      
      // Extract address fields for debugging
      if (snapshotData.poolProject) {
        const project = snapshotData.poolProject;
        console.log('Pool Project Object:', project);
        console.log('Address fields available on poolProject:', {
          siteAddress: 'siteAddress' in project,
          homeAddress: 'homeAddress' in project,
          site_address: 'site_address' in project,
          home_address: 'home_address' in project
        });
        
        console.log('Address field values:', {
          // Use "as any" to avoid TypeScript errors since we're debugging
          siteAddress: (project as any).siteAddress,
          homeAddress: (project as any).homeAddress,
          site_address: (project as any).site_address,
          home_address: (project as any).home_address
        });
      } else {
        console.warn('poolProject property missing from snapshot');
      }
    } else {
      console.warn('No snapshot data available');
    }
  }, [snapshotData]);

  // Render different UI based on data availability
  if (errorMessage) {
    return (
      <div className="p-8 bg-red-50 text-red-800 rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Error Loading Debug Data</h1>
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
      <p className="mb-4">✅ Snapshot data loaded successfully</p>
      <p>Check the browser console for detailed logs</p>
      
      <div className="mt-8 bg-white p-4 rounded shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Address Information Preview:</h2>
        <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
          {JSON.stringify({
            siteAddress: (snapshotData.poolProject as any).siteAddress,
            homeAddress: (snapshotData.poolProject as any).homeAddress,
            site_address: (snapshotData.poolProject as any).site_address,
            home_address: (snapshotData.poolProject as any).home_address
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}