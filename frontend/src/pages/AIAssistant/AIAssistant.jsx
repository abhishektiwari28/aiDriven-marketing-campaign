import React, { useState } from 'react';
import { Bot, Sparkles, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

const InsightCard = ({ title, description, impact, type }) => (
    <div className="glass-card p-6 border-l-4 border-indigo-600 hover:bg-slate-50 transition-all duration-300 group shadow-sm">
        <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">{type}</span>
            <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">+{impact}% UPLIFT</span>
        </div>
        <h3 className="font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{title}</h3>
        <p className="text-sm text-slate-500 font-medium leading-relaxed group-hover:text-slate-700 transition-colors italic">"{description}"</p>
        <button className="mt-5 text-xs font-black text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 transition-all group/btn uppercase tracking-widest">
            Deploy Node <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </button>
    </div>
);

const StepWizard = () => {
    const [step, setStep] = useState(1);
    const steps = [
        { num: 1, title: 'Objective' },
        { num: 2, title: 'Audience' },
        { num: 3, title: 'Creative' },
        { num: 4, title: 'Budget' },
        { num: 5, title: 'Deploy' },
    ];

    return (
        <div className="glass-card p-10 border border-slate-200 shadow-slate-200/50">
            <div className="flex justify-between items-center mb-12 relative">
                {/* Progress Bar Line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -z-0 rounded-full"></div>

                {steps.map((s) => (
                    <div key={s.num} className={`relative z-10 flex flex-col items-center gap-4 transition-all duration-500 ${step >= s.num ? 'text-indigo-600' : 'text-slate-300'}`}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-500 border-2 ${step >= s.num ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-600/30 ring-4 ring-white' : 'bg-white border-slate-200 shadow-inner'
                            }`}>
                            {step > s.num ? <CheckCircle2 className="w-6 h-6" /> : s.num}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s.num ? 'opacity-100' : 'opacity-40'}`}>{s.title}</span>
                    </div>
                ))}
            </div>

            <div className="min-h-[280px] flex items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 transition-all hover:border-indigo-300/50 p-8">
                <div className="text-center max-w-sm">
                    <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <Sparkles className="w-8 h-8 text-indigo-500 animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">AI Deployment Wizard</h3>
                    <p className="text-slate-500 text-sm mt-3 leading-relaxed font-medium">Synchronizing cross-channel parameters for <span className="text-indigo-600 font-black">{steps[step - 1].title}</span>. Agent is ready for instruction.</p>
                    <div className="mt-10 flex justify-center gap-4">
                        <button
                            className="px-8 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-slate-900 transition-all disabled:opacity-30"
                            onClick={() => setStep(Math.max(1, step - 1))}
                            disabled={step === 1}
                        >
                            Backtrack
                        </button>
                        <button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-3 rounded-xl text-sm font-black shadow-xl shadow-indigo-600/20 transition-all active:scale-95 uppercase tracking-widest"
                            onClick={() => setStep(Math.min(5, step + 1))}
                        >
                            {step === 5 ? 'Finalize Rollout' : 'Continue'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AIAssistant = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in duration-700">
            <div className="lg:col-span-2 space-y-10">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl shadow-inner">
                            <Bot className="w-10 h-10 text-indigo-600" />
                        </div>
                        Strategy Orchestrator
                    </h1>
                    <p className="text-slate-500 font-medium">Real-time collaboration with the core marketing intelligence engine.</p>
                </div>

                <StepWizard />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card p-8 text-center border-b-4 border-b-indigo-600">
                        <div className="text-4xl font-black text-indigo-600 mb-1 tracking-tighter">25%</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency Uplift</div>
                    </div>
                    <div className="glass-card p-8 text-center border-b-4 border-b-teal-500">
                        <div className="text-4xl font-black text-teal-600 mb-1 tracking-tighter">3.2x</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Yield Multiplier</div>
                    </div>
                    <div className="glass-card p-8 text-center border-b-4 border-b-violet-500">
                        <div className="text-4xl font-black text-violet-600 mb-1 tracking-tighter">94%</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Model Confidence</div>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <div className="flex items-center justify-between px-2">
                    <h2 className="font-black text-slate-900 uppercase tracking-widest text-xs">Tactical Signals</h2>
                    <button className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 uppercase tracking-widest transition-colors">
                        <Zap className="w-3.5 h-3.5" /> Synchronize All
                    </button>
                </div>

                <div className="space-y-6">
                    <InsightCard
                        type="Vector Shift"
                        title="Platform Reallocation"
                        description="Instagram feed nodes are outperforming display by 40%. Recommend immediate $500 vector shift."
                        impact="15"
                    />
                    <InsightCard
                        type="Content Optimization"
                        title="Short-form Priority"
                        description="Vertical motion assets are seeing 2.4x higher engagement. Sequence vertical rollout immediately."
                        impact="22"
                    />
                    <InsightCard
                        type="Budget Control"
                        title="Efficiency Threshold"
                        description="Three active ad sets have dropped below the 2.0 ROAS baseline. Pause to preserve liquidity."
                        impact="8"
                    />
                </div>

                <button className="w-full py-5 rounded-2xl bg-white border border-slate-200 text-slate-500 font-black text-xs uppercase tracking-widest hover:text-indigo-600 hover:border-indigo-300 hover:shadow-lg transition-all flex items-center justify-center gap-3 group">
                    Full Intelligence Map <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default AIAssistant;
