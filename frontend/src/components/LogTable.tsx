import { Log } from '@/types/api';
import { useState } from 'react';
import { api } from '@/lib/api';

interface LogTableProps {
    logs: Log[];
    onActionSuggested?: (action: string) => void;
}

export default function LogTable({ logs, onActionSuggested }: LogTableProps) {
    const [loading, setLoading] = useState<number | null>(null);

    const handleSuggestAction = async (logId: number) => {
        setLoading(logId);
        try {
            const response = await api.suggestAction(logId);
            if (response.data && onActionSuggested) {
                onActionSuggested(response.data.description);
            }
        } catch (error) {
            console.error('Error suggesting action:', error);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Timestamp
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Source IP
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Destination IP
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Protocol
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Alert
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Anomaly
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Action
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {logs.map((log) => (
                        <tr key={log.id} className={log.is_anomaly ? 'bg-red-50' : ''}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(log.timestamp).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {log.src_ip}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {log.dest_ip}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {log.protocol}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {log.alert_signature || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {log.is_anomaly ? (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                        ⚠️ Anomaly
                                    </span>
                                ) : (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        Normal
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {log.is_anomaly && (
                                    <button
                                        onClick={() => handleSuggestAction(log.id)}
                                        disabled={loading === log.id}
                                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                    >
                                        {loading === log.id ? 'Loading...' : 'Suggest Action'}
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
} 