import { useState, useRef } from 'react';
import { ShieldCheck, Play, Square, ListRestart, CheckCircle2, XCircle } from 'lucide-react';
import { getPublicFormBySlug, submitPublicResponse } from '../lib/formApi';
import type { FormFieldRecord } from '../types/forms';
import { cn } from '../lib/utils';

interface TestLog {
    id: string;
    status: 'success' | 'error';
    message: string;
}

const TestFormsPage = () => {
    const [slug, setSlug] = useState('');
    const [count, setCount] = useState(100);
    const [delay, setDelay] = useState(100);
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<TestLog[]>([]);
    const [error, setError] = useState<string | null>(null);

    const stopRef = useRef(false);

    const generateFakeResponse = (fields: FormFieldRecord[]) => {
        const answers: Record<string, any> = {};
        const n = Math.floor(Math.random() * 10000);

        fields.forEach((field) => {
            if (field.field_type === 'section_title') return;

            switch (field.field_type) {
                case 'short_text':
                    answers[field.id] = `Tester Response ${n}`;
                    break;
                case 'long_text':
                    answers[field.id] = `This is a bulk generated paragraph response for tester #${n}. It helps simulate realistic data patterns and volume.`;
                    break;
                case 'email':
                    answers[field.id] = `tester.${n}@example.com`;
                    break;
                case 'number': {
                    const { min = 0, max = 100 } = (field.options as any) || {};
                    answers[field.id] = Math.floor(Math.random() * (max - min + 1)) + min;
                    break;
                }
                case 'date':
                    answers[field.id] = new Date().toISOString().split('T')[0];
                    break;
                case 'select': {
                    const choices = (field.options as any)?.choices || [];
                    if (choices.length > 0) {
                        answers[field.id] = choices[Math.floor(Math.random() * choices.length)];
                    }
                    break;
                }
                case 'checkbox': {
                    const choices = (field.options as any)?.choices || [];
                    if (choices.length > 0) {
                        // Pick 1-3 random choices
                        const count = Math.min(choices.length, Math.floor(Math.random() * 3) + 1);
                        const shuffled = [...choices].sort(() => 0.5 - Math.random());
                        answers[field.id] = shuffled.slice(0, count);
                    }
                    break;
                }
            }
        });

        return answers;
    };

    const startTest = async () => {
        if (!slug.trim()) {
            setError('Please enter a valid form slug.');
            return;
        }

        setError(null);
        setIsRunning(true);
        setProgress(0);
        setLogs([]);
        stopRef.current = false;

        try {
            // 1. Fetch form metadata
            const formDetails = await getPublicFormBySlug(slug.trim());
            const fields = formDetails.fields;

            // 2. Loop submissions
            for (let i = 1; i <= count; i++) {
                if (stopRef.current) {
                    setLogs((prev) => [{ id: `stop-${Date.now()}`, status: 'error', message: 'Test cancelled by user.' }, ...prev]);
                    break;
                }

                const answers = generateFakeResponse(fields);
                const respondentEmail = fields.find(f => f.field_type === 'email')?.id
                    ? answers[fields.find(f => f.field_type === 'email')!.id]
                    : null;

                try {
                    await submitPublicResponse({
                        formId: formDetails.form.id,
                        answers,
                        respondentEmail,
                    });

                    setLogs((prev) => [
                        { id: `log-${i}`, status: 'success', message: `Submission #${i} successful` },
                        ...prev.slice(0, 49) // Keep last 50 logs
                    ]);
                } catch (submissionError: any) {
                    setLogs((prev) => [
                        { id: `log-err-${i}`, status: 'error', message: `Submission #${i} failed: ${submissionError.message}` },
                        ...prev.slice(0, 49)
                    ]);
                }

                setProgress(i);

                if (i < count) {
                    await new Promise((resolve) => setTimeout(resolve, delay));
                }
            }
        } catch (err: any) {
            setError(err.message || 'Initialization failed.');
        } finally {
            setIsRunning(false);
        }
    };

    const handleStop = () => {
        stopRef.current = true;
    };

    const clearLogs = () => {
        setLogs([]);
        setProgress(0);
        setError(null);
    };

    return (
        <div className="min-h-screen bg-[#fafafa] bg-dotted p-6 lg:p-12">
            <div className="mx-auto max-w-2xl space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-xl">
                        <ShieldCheck size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="brand-heading text-3xl font-black tracking-tight text-zinc-950 leading-none">Form Bulk Tester</h1>
                        <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Stress Testing Utility</p>
                    </div>
                </div>

                {/* Controls Card */}
                <div className="premium-panel rounded-3xl p-8 bg-white border border-black/5 shadow-2xl shadow-zinc-200/50">
                    <div className="grid gap-6">
                        <label className="block">
                            <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-400">Target Form Slug</span>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                placeholder="e.g. coordinator-app"
                                disabled={isRunning}
                                className="premium-input w-full px-4 py-3 text-sm font-semibold"
                            />
                        </label>

                        <div className="grid grid-cols-2 gap-4">
                            <label>
                                <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-400">Submissions (1-500)</span>
                                <input
                                    type="number"
                                    min="1"
                                    max="500"
                                    value={count}
                                    onChange={(e) => setCount(Number(e.target.value))}
                                    disabled={isRunning}
                                    className="premium-input w-full px-4 py-3 text-sm font-semibold"
                                />
                            </label>
                            <label>
                                <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-400">Delay (ms)</span>
                                <input
                                    type="number"
                                    min="50"
                                    max="500"
                                    value={delay}
                                    onChange={(e) => setDelay(Number(e.target.value))}
                                    disabled={isRunning}
                                    className="premium-input w-full px-4 py-3 text-sm font-semibold"
                                />
                            </label>
                        </div>

                        {error && (
                            <div className="rounded-xl bg-red-50 p-4 border border-red-100 flex items-center gap-3 text-red-600 text-xs font-bold">
                                <XCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="flex gap-4 pt-4">
                            {!isRunning ? (
                                <button
                                    onClick={startTest}
                                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-zinc-950 py-4 text-sm font-bold text-white shadow-xl hover:bg-zinc-800 transition-all active:scale-[0.98]"
                                >
                                    <Play size={18} fill="currentColor" />
                                    Start Bulk Test
                                </button>
                            ) : (
                                <button
                                    onClick={handleStop}
                                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-red-600 py-4 text-sm font-bold text-white shadow-xl hover:bg-red-700 transition-all active:scale-[0.98]"
                                >
                                    <Square size={18} fill="currentColor" />
                                    Stop Execution
                                </button>
                            )}
                            <button
                                onClick={clearLogs}
                                disabled={isRunning}
                                className="px-6 flex items-center justify-center rounded-2xl border border-black/10 bg-white text-zinc-400 hover:text-zinc-600 hover:border-black/20 transition-all disabled:opacity-30"
                            >
                                <ListRestart size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Progress Section */}
                {(isRunning || progress > 0) && (
                    <div className="premium-panel rounded-3xl p-8 bg-white border border-black/5 shadow-xl shadow-zinc-200/40">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-black text-zinc-950 uppercase tracking-tighter">Execution Stats</span>
                            <span className="text-[10px] font-bold py-1 px-3 bg-zinc-100 rounded-full text-zinc-500 uppercase">
                                {progress} / {count} Submissions
                            </span>
                        </div>

                        <div className="h-4 w-full bg-zinc-100 rounded-full overflow-hidden border border-black/5">
                            <div
                                className="h-full bg-zinc-950 transition-all duration-300 shadow-lg"
                                style={{ width: `${(progress / count) * 100}%` }}
                            />
                        </div>

                        {/* Mini Logs */}
                        <div className="mt-8 space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {logs.length === 0 && (
                                <div className="text-center py-6 text-zinc-300 text-[10px] font-bold uppercase tracking-widest">
                                    Waiting for activity...
                                </div>
                            )}
                            {logs.map((log) => (
                                <div
                                    key={log.id}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl border text-[11px] font-bold transition-all animate-in slide-in-from-top-1 duration-300",
                                        log.status === 'success'
                                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                            : "bg-red-50 text-red-600 border-red-100"
                                    )}
                                >
                                    {log.status === 'success' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                    <span>{log.message}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer Info */}
                <p className="text-center text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-300">
                    MIT ADT — Official Testing Environment
                </p>
            </div>
        </div>
    );
};

export default TestFormsPage;
