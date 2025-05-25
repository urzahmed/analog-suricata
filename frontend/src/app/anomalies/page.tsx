'use client';

import { useEffect, useState } from 'react';
import { Log } from '@/types/api';
import { api } from '@/lib/api';
import LogTable from '@/components/LogTable';

export default function AnomaliesPage() {
    const [anomalies, setAnomalies] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [suggestedAction, setSuggestedAction] = useState<string | null>(null);

    useEffect(() => {
        fetchAnomalies();
    }, []);

    const fetchAnomalies = async () => {
        try {
            setLoading(true);
            const response = await api.getAnomalies();
            if (response.error) {
                setError(response.error);
            } else {
                setAnomalies(response.data);
            }
        } catch (err) {
            setError('Failed to fetch anomalies');
        } finally {
            setLoading(false);
        }
    };

    const handleActionSuggested = (action: string) => {
        setSuggestedAction(action);
        // Auto-hide the suggestion after 5 seconds
        setTimeout(() => setSuggestedAction(null), 5000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
                <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                    <div className="text-center">Loading anomalies...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
                <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                    <div className="text-center text-red-600">Error: {error}</div>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-100">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Anomalies</h1>
                        <button
                            onClick={fetchAnomalies}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            Refresh
                        </button>
                    </div>

                    {suggestedAction && (
                        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                            <p className="text-blue-700">{suggestedAction}</p>
                        </div>
                    )}

                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <LogTable logs={anomalies} onActionSuggested={handleActionSuggested} />
                    </div>
                </div>
            </div>
        </main>
    );
} 