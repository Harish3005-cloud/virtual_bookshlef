'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Trigger {
  TRIGGER_NAME: string;
  EVENT_MANIPULATION: string;
  EVENT_OBJECT_TABLE: string;
  ACTION_TIMING: string;
  ACTION_CONDITION: string;
  ACTION_STATEMENT: string;
  CREATED: string;
}

export default function TriggersPage() {
  const { data: session, status } = useSession();
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingTrigger, setCreatingTrigger] = useState(false);
  const [newTriggerName, setNewTriggerName] = useState('');
  const [newTriggerSql, setNewTriggerSql] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTriggers();
    }
  }, [status]);

  const fetchTriggers = async () => {
    try {
      const response = await fetch('/api/admin/triggers');
      if (!response.ok) {
        throw new Error('Failed to fetch triggers');
      }
      const data = await response.json();
      setTriggers(data.triggers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createTrigger = async () => {
    if (!newTriggerName || !newTriggerSql) {
      setError('Trigger name and SQL are required');
      return;
    }

    setCreatingTrigger(true);
    try {
      const response = await fetch('/api/admin/triggers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          triggerName: newTriggerName,
          triggerSql: newTriggerSql,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create trigger');
      }

      await fetchTriggers();
      setNewTriggerName('');
      setNewTriggerSql('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setCreatingTrigger(false);
    }
  };

  const deleteTrigger = async (triggerName: string) => {
    if (!confirm(`Are you sure you want to delete trigger "${triggerName}"?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/triggers', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ triggerName }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete trigger');
      }

      await fetchTriggers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const setupDefaultTrigger = async () => {
    try {
      const response = await fetch('/api/admin/triggers/setup', {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to setup default trigger');
      }

      await fetchTriggers();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading triggers...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Database Triggers</h1>
          <p className="mt-2 text-gray-600">Manage database triggers for your virtual bookshelf</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="text-red-700">
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Default Trigger Setup */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Quick Setup</h2>
          </div>
          <div className="px-6 py-4">
            <p className="text-gray-600 mb-4">
              Set up the default trigger that automatically sets the added_date when adding items to shelves.
            </p>
            <button
              onClick={setupDefaultTrigger}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Setup TRG_SET_ADDED_DATE Trigger
            </button>
          </div>
        </div>

        {/* Create New Trigger */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Create New Trigger</h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="triggerName" className="block text-sm font-medium text-gray-700">
                  Trigger Name
                </label>
                <input
                  type="text"
                  id="triggerName"
                  value={newTriggerName}
                  onChange={(e) => setNewTriggerName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., TRG_SET_ADDED_DATE"
                />
              </div>
              <div>
                <label htmlFor="triggerSql" className="block text-sm font-medium text-gray-700">
                  Trigger SQL
                </label>
                <textarea
                  id="triggerSql"
                  value={newTriggerSql}
                  onChange={(e) => setNewTriggerSql(e.target.value)}
                  rows={6}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder="CREATE TRIGGER trigger_name&#10;BEFORE INSERT ON table_name&#10;FOR EACH ROW&#10;BEGIN&#10;    -- Trigger logic here&#10;END;"
                />
              </div>
              <div>
                <button
                  onClick={createTrigger}
                  disabled={creatingTrigger}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  {creatingTrigger ? 'Creating...' : 'Create Trigger'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Existing Triggers */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Existing Triggers</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Table
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {triggers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No triggers found. Create your first trigger above.
                    </td>
                  </tr>
                ) : (
                  triggers.map((trigger) => (
                    <tr key={trigger.TRIGGER_NAME}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {trigger.TRIGGER_NAME}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {trigger.EVENT_MANIPULATION}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {trigger.EVENT_OBJECT_TABLE}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {trigger.ACTION_TIMING}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(trigger.CREATED).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => deleteTrigger(trigger.TRIGGER_NAME)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trigger Details */}
        {triggers.length > 0 && (
          <div className="mt-6 bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Trigger Details</h2>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                {triggers.map((trigger) => (
                  <div key={trigger.TRIGGER_NAME} className="border border-gray-200 rounded-md p-4">
                    <h3 className="font-medium text-gray-900 mb-2">{trigger.TRIGGER_NAME}</h3>
                    <div className="bg-gray-50 rounded p-3">
                      <pre className="text-sm text-gray-700 overflow-x-auto">
                        <code>{trigger.ACTION_STATEMENT}</code>
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
