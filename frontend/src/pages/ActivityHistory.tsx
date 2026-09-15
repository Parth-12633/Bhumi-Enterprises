import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';

const fetchActivity = async () => {
  const { data } = await axios.get('/api/activity');
  return data.data;
};

const ActivityHistory = () => {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['activityLogs'],
    queryFn: fetchActivity
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-gray-900">Activity History</h1>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="flex flex-col gap-3">
          {logs?.map((log: any) => (
            <div key={log._id} className="bg-white p-4 rounded-xl border shadow-sm flex flex-col gap-1">
              <div className="flex justify-between">
                <span className="font-bold text-sm text-brandBrown">{log.action}</span>
                <span className="text-xs text-gray-500">{format(new Date(log.timestamp), 'dd MMM yyyy, hh:mm a')}</span>
              </div>
              <p className="text-gray-800 text-sm">
                <span className="font-semibold">{log.userId?.name}</span> performed action on {log.entityType}.
              </p>
              {log.reason && (
                <p className="text-xs text-gray-500 italic mt-1">Reason: {log.reason}</p>
              )}
            </div>
          ))}
          {logs?.length === 0 && (
             <div className="text-center py-10 text-gray-500 bg-white border rounded-xl">No activity recorded yet.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityHistory;
