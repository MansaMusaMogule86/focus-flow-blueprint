import React, { useState, useEffect } from 'react';
import { Button, Card, LoadingSpinner, Modal } from '../components/ui';
import { api } from '../services/api';
import { useStore } from '../store';

interface VaultItem {
    id: string;
    type: string;
    title: string;
    content: string;
    moduleId: string;
    moduleName: string;
    tags: string[];
    createdAt: string;
    metadata: any;
}

interface VaultStats {
    total: number;
    byType: Record<string, number>;
    byModule: Record<string, number>;
}

export const VaultPage: React.FC = () => {
    const [items, setItems] = useState<VaultItem[]>([]);
    const [stats, setStats] = useState<VaultStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
    const [filter, setFilter] = useState<{ type?: string; search?: string }>({});
    const theme = useStore((state) => state.theme);

    useEffect(() => {
        fetchVault();
    }, [filter]);

    const fetchVault = async () => {
        try {
            const data = await api.vault.getAll(filter);
            setItems(data.items);
            setStats(data.stats);
        } catch (e) {
            console.error('Failed to fetch vault:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this item from your Vault?')) return;

        try {
            await api.vault.delete(id);
            setItems((prev) => prev.filter((item) => item.id !== id));
            if (selectedItem?.id === id) {
                setSelectedItem(null);
            }
        } catch (e) {
            console.error('Failed to delete:', e);
        }
    };

    const typeIcons: Record<string, string> = {
        text: 'fa-file-lines',
        image: 'fa-image',
        video: 'fa-film',
        audio: 'fa-music',
        script: 'fa-scroll',
        report: 'fa-file-contract',
        artifact: 'fa-gem',
    };

    const typeColors: Record<string, string> = {
        text: 'bg-blue-500',
        image: 'bg-pink-500',
        video: 'bg-purple-500',
        audio: 'bg-green-500',
        script: 'bg-amber-500',
        report: 'bg-indigo-500',
        artifact: 'bg-rose-500',
    };

    return (
        <div className={`min-h-screen ${theme.mode === 'dark' ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-900 via-orange-900 to-red-900 text-white px-6 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <a
                            href="/"
                            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                        >
                            <i className="fa-solid fa-arrow-left" />
                        </a>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                            <i className="fa-solid fa-vault text-3xl" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-tighter">
                                Your Vault
                            </h1>
                            <p className="text-white/70">
                                {stats?.total || 0} artifacts stored
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    {stats && stats.total > 0 && (
                        <div className="flex gap-2 flex-wrap">
                            {Object.entries(stats.byType).map(([type, count]) => (
                                <span
                                    key={type}
                                    className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest"
                                >
                                    {count} {type}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="max-w-6xl mx-auto px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => setFilter({ ...filter, type: undefined })}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors ${!filter.type
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                    >
                        All
                    </button>
                    {['text', 'image', 'video', 'audio', 'script', 'report'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilter({ ...filter, type })}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors ${filter.type === type
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                        >
                            <i className={`fa-solid ${typeIcons[type]} mr-1`} />
                            {type}
                        </button>
                    ))}

                    <div className="flex-1" />

                    <input
                        type="text"
                        placeholder="Search vault..."
                        value={filter.search || ''}
                        onChange={(e) => setFilter({ ...filter, search: e.target.value || undefined })}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-6 py-8">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                            <i className="fa-solid fa-vault text-5xl text-slate-300 dark:text-slate-600" />
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white mb-2">
                            Vault is Empty
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
                            {filter.type || filter.search
                                ? 'No items match your filter. Try adjusting your search.'
                                : 'Use AI modules to generate content, then save outputs to your Vault.'}
                        </p>
                        <a
                            href="/"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-colors"
                        >
                            <i className="fa-solid fa-cubes" />
                            Go to Modules
                        </a>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {items.map((item) => (
                            <Card
                                key={item.id}
                                className="cursor-pointer hover:shadow-lg transition-all group"
                                onClick={() => setSelectedItem(item)}
                            >
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className={`w-10 h-10 ${typeColors[item.type] || 'bg-slate-500'} rounded-xl flex items-center justify-center text-white`}>
                                            <i className={`fa-solid ${typeIcons[item.type] || 'fa-file'}`} />
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(item.id);
                                            }}
                                            className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <i className="fa-solid fa-trash text-xs" />
                                        </button>
                                    </div>

                                    <h3 className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 line-clamp-2">
                                        {item.content.slice(0, 100)}...
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-600">
                                            {item.moduleName}
                                        </span>
                                        <span className="text-[9px] text-slate-400">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {item.tags.length > 0 && (
                                        <div className="flex gap-1 mt-2 flex-wrap">
                                            {item.tags.slice(0, 3).map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="text-[8px] font-bold uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedItem && (
                <Modal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} title={selectedItem.title}>
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span className={`w-8 h-8 ${typeColors[selectedItem.type]} rounded-lg flex items-center justify-center text-white`}>
                                <i className={`fa-solid ${typeIcons[selectedItem.type]} text-xs`} />
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                {selectedItem.type} from {selectedItem.moduleName}
                            </span>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 max-h-96 overflow-y-auto">
                            <pre className="text-sm whitespace-pre-wrap font-sans text-slate-900 dark:text-white">
                                {selectedItem.content}
                            </pre>
                        </div>

                        {selectedItem.tags.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                                {selectedItem.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="text-[9px] font-bold uppercase tracking-widest bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 px-2 py-1 rounded"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                            <span className="text-[10px] text-slate-400">
                                Created {new Date(selectedItem.createdAt).toLocaleString()}
                            </span>
                            <Button variant="danger" size="sm" onClick={() => handleDelete(selectedItem.id)}>
                                <i className="fa-solid fa-trash mr-2" /> Delete
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};
