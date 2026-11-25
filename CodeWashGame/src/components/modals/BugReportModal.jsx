import React, { useState } from 'react';
import { buildBugReport, fileToDataUrl, sendBugReport } from '../../lib/bugReport';
import { browserStorage } from '../../services/storage';

const BugReportModal = ({
    isOpen,
    onClose,
    endpoint,
    appVersion = '0.0.0',
    sendReport = sendBugReport,
    readFile = fileToDataUrl,
}) => {
    const [description, setDescription] = useState('');
    const [steps, setSteps] = useState('');
    const [files, setFiles] = useState([]);
    const [includeLogs, setIncludeLogs] = useState(true);
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const canSubmit = Boolean(endpoint) && description.trim().length > 0 && status !== 'sending';

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!canSubmit) return;

        setStatus('sending');
        setError(null);
        try {
            const screenshots = await Promise.all(files.map((file) => readFile(file)));
            const report = buildBugReport({
                description,
                steps,
                includeLogs,
                screenshots,
                storage: browserStorage,
                userAgent: typeof navigator === 'undefined' ? '' : navigator.userAgent,
                appVersion,
            });
            await sendReport(endpoint, report);
            setStatus('success');
            setDescription('');
            setSteps('');
            setFiles([]);
        } catch (err) {
            setStatus('error');
            setError(err?.message || 'Failed to send the report');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
            <form
                role="dialog"
                aria-modal="true"
                aria-label="Report a bug"
                onSubmit={handleSubmit}
                className="relative bg-stone-900 border-4 border-stone-600 rounded-2xl p-6 max-w-xl w-[92%] max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col gap-4"
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold text-slate-200 uppercase tracking-wider">
                        Report a bug
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close bug report"
                        className="text-slate-400 hover:text-white text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                {!endpoint && (
                    <p
                        role="status"
                        className="text-amber-300 bg-amber-950/40 border border-amber-700 rounded p-3"
                    >
                        No report endpoint configured. Add one in Settings to enable bug reports.
                    </p>
                )}

                <label className="flex flex-col gap-1 text-slate-300 font-bold uppercase text-sm">
                    What happened?
                    <textarea
                        aria-label="Bug description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="bg-stone-950 border-2 border-stone-600 rounded p-2 text-slate-100 font-normal normal-case"
                        placeholder="Describe the bug..."
                    />
                </label>

                <label className="flex flex-col gap-1 text-slate-300 font-bold uppercase text-sm">
                    Steps to reproduce (optional)
                    <textarea
                        aria-label="Steps to reproduce"
                        value={steps}
                        onChange={(e) => setSteps(e.target.value)}
                        rows={3}
                        className="bg-stone-950 border-2 border-stone-600 rounded p-2 text-slate-100 font-normal normal-case"
                        placeholder="1. ..."
                    />
                </label>

                <label className="flex flex-col gap-1 text-slate-300 font-bold uppercase text-sm">
                    Screenshots (optional)
                    <input
                        aria-label="Screenshots"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => setFiles(Array.from(e.target.files || []))}
                        className="text-slate-300 font-normal"
                    />
                </label>

                <label className="flex items-center gap-2 text-slate-300">
                    <input
                        type="checkbox"
                        checked={includeLogs}
                        onChange={(e) => setIncludeLogs(e.target.checked)}
                    />
                    Include recent logs and saved game files
                </label>

                {status === 'success' && (
                    <p role="status" className="text-green-400 font-bold">
                        Report sent. Thank you!
                    </p>
                )}
                {status === 'error' && (
                    <p role="alert" className="text-red-400 font-bold">
                        {error}
                    </p>
                )}

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border-2 border-stone-600 text-slate-300 hover:bg-stone-800"
                    >
                        Close
                    </button>
                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className="px-4 py-2 rounded-lg border-2 border-red-700 bg-red-900/60 text-red-100 font-bold hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {status === 'sending' ? 'Sending...' : 'Send report'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BugReportModal;
