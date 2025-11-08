import React, { useState } from 'react';
import { getDrugInformation, checkDrugInteractions, queryInventory } from '../services/geminiService';
import { usePharmacy } from '../hooks/usePharmacy';

type Tool = 'info' | 'interaction' | 'query';

const GeminiTools: React.FC = () => {
    const [activeTool, setActiveTool] = useState<Tool>('info');

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-6">
                 <GeminiIcon className="w-8 h-8 text-brand-primary mr-3" />
                 <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Gemini AI Tools</h2>
            </div>
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <TabButton name="Drug Information" tool="info" activeTool={activeTool} setActiveTool={setActiveTool} />
                    <TabButton name="Interaction Checker" tool="interaction" activeTool={activeTool} setActiveTool={setActiveTool} />
                    <TabButton name="Inventory Q&A" tool="query" activeTool={activeTool} setActiveTool={setActiveTool} />
                </nav>
            </div>
            <div>
                {activeTool === 'info' && <DrugInfoTool />}
                {activeTool === 'interaction' && <InteractionTool />}
                {activeTool === 'query' && <InventoryQueryTool />}
            </div>
        </div>
    );
};

const TabButton: React.FC<{name: string, tool: Tool, activeTool: Tool, setActiveTool: (tool: Tool) => void}> = ({name, tool, activeTool, setActiveTool}) => (
    <button
        onClick={() => setActiveTool(tool)}
        className={`${
            activeTool === tool
                ? 'border-brand-primary text-brand-secondary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
        } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
    >
        {name}
    </button>
);

const AIResultDisplay: React.FC<{ result: string }> = ({ result }) => (
    <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 max-h-96 overflow-y-auto">
        <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300">{result}</pre>
    </div>
);

const DrugInfoTool: React.FC = () => {
    const [drugName, setDrugName] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!drugName) return;
        setIsLoading(true);
        setResult('');
        const info = await getDrugInformation(drugName);
        setResult(info);
        setIsLoading(false);
    };

    return (
        <div>
            <h3 className="text-lg font-semibold mb-2 dark:text-gray-200">Look up Drug Information</h3>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={drugName}
                    onChange={(e) => setDrugName(e.target.value)}
                    placeholder="e.g., Atorvastatin"
                    className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                />
                <button onClick={handleSubmit} disabled={isLoading} className="px-4 py-2 bg-brand-primary text-white rounded-lg disabled:bg-gray-400">
                    {isLoading ? 'Loading...' : 'Search'}
                </button>
            </div>
            {result && <AIResultDisplay result={result} />}
        </div>
    );
};

const InteractionTool: React.FC = () => {
    const [drugs, setDrugs] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        const drugList = drugs.split(',').map(d => d.trim()).filter(Boolean);
        if (drugList.length < 2) {
            alert("Please enter at least two comma-separated drugs.");
            return;
        }
        setIsLoading(true);
        setResult('');
        const info = await checkDrugInteractions(drugList);
        setResult(info);
        setIsLoading(false);
    };

    return (
        <div>
            <h3 className="text-lg font-semibold mb-2 dark:text-gray-200">Check Drug Interactions</h3>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={drugs}
                    onChange={(e) => setDrugs(e.target.value)}
                    placeholder="e.g., Aspirin, Warfarin"
                    className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                />
                <button onClick={handleSubmit} disabled={isLoading} className="px-4 py-2 bg-brand-primary text-white rounded-lg disabled:bg-gray-400">
                    {isLoading ? 'Checking...' : 'Check'}
                </button>
            </div>
            {result && <AIResultDisplay result={result} />}
        </div>
    );
};

const InventoryQueryTool: React.FC = () => {
    const { medicines, sales } = usePharmacy();
    const [query, setQuery] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!query) return;
        setIsLoading(true);
        setResult('');
        const info = await queryInventory(query, medicines, sales);
        setResult(info);
        setIsLoading(false);
    };

    return (
        <div>
            <h3 className="text-lg font-semibold mb-2 dark:text-gray-200">Ask About Your Inventory</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Examples: "Which items are about to expire?" or "What are my lowest stock items?"</p>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask a question..."
                    className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                />
                <button onClick={handleSubmit} disabled={isLoading} className="px-4 py-2 bg-brand-primary text-white rounded-lg disabled:bg-gray-400">
                    {isLoading ? 'Analyzing...' : 'Ask'}
                </button>
            </div>
            {result && <AIResultDisplay result={result} />}
        </div>
    );
};


const GeminiIcon: React.FC<{ className: string }> = ({ className }) => <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path d="M10 3.5a1.5 1.5 0 013 0V5a1.5 1.5 0 01-3 0V3.5zM10 15a1.5 1.5 0 013 0v1.5a1.5 1.5 0 01-3 0V15zM6.5 10a1.5 1.5 0 010-3H5a1.5 1.5 0 010 3h1.5zM15 10a1.5 1.5 0 010-3h1.5a1.5 1.5 0 010 3H15zM10 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>;


export default GeminiTools;