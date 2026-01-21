import React, { useState, useEffect } from 'react';
import { Button, Card, LoadingSpinner, EmptyState } from '../ui';
import { api } from '../../services/api';
import { useStore } from '../../store';

interface Module {
    id: string;
    name: string;
    description: string;
    type: string;
    icon: string;
    capabilities: string[];
}

interface ModuleCardProps {
    module: Module;
    onSelect: () => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, onSelect }) => {
    return (
        <Card hover onClick={onSelect} className="group">
            <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                    <i className={`fa-solid ${module.icon} text-xl`} />
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    {module.type}
                </span>
            </div>
            <h3 className="text-lg font-black uppercase tracking-tighter text-slate-900 dark:text-white mb-2">
                {module.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                {module.description}
            </p>
            <div className="flex flex-wrap gap-1 mb-6">
                {module.capabilities.slice(0, 3).map((cap) => (
                    <span
                        key={cap}
                        className="text-[8px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-lg"
                    >
                        {cap}
                    </span>
                ))}
            </div>
            <Button variant="secondary" size="sm" className="w-full opacity-0 group-hover:opacity-100 transition-opacity">
                Launch Module <i className="fa-solid fa-arrow-right ml-2" />
            </Button>
        </Card>
    );
};

interface ModulesGridProps {
    onSelectModule: (moduleId: string) => void;
}

export const ModulesGrid: React.FC<ModulesGridProps> = ({ onSelectModule }) => {
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchModules = async () => {
            try {
                const data = await api.ai.getModules();
                setModules(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchModules();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <EmptyState
                icon="fa-exclamation-triangle"
                title="Failed to load modules"
                description={error}
                action={
                    <Button variant="secondary" onClick={() => window.location.reload()}>
                        Retry
                    </Button>
                }
            />
        );
    }

    if (modules.length === 0) {
        return (
            <EmptyState
                icon="fa-cubes"
                title="No modules available"
                description="AI modules are being initialized. Please wait."
            />
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {modules.map((module) => (
                <ModuleCard
                    key={module.id}
                    module={module}
                    onSelect={() => onSelectModule(module.id)}
                />
            ))}
        </div>
    );
};
