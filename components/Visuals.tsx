
import React, { useMemo } from 'react';

interface VisualProps {
    topic: string;
    mode: number; // 0, 1, 2, 3 (Trainer)
    active: boolean;
}

export const BackgroundVisual: React.FC<VisualProps> = ({ topic, mode, active }) => {
    // Helper for colors
    const getColors = () => {
        switch (topic) {
            case 'Hometown': return ['#1e293b', '#64748b', '#94a3b8', '#facc15']; 
            case 'Mirrors': return ['#334155', '#cbd5e1', '#f1f5f9', '#38bdf8']; 
            case 'Sitting': return ['#475569', '#94a3b8', '#cbd5e1', '#ef4444']; 
            case 'Work/Studies': return ['#1e3a8a', '#60a5fa', '#f97316', '#fb923c']; 
            case 'Old Buildings': return ['#451a03', '#a8a29e', '#78716c', '#f59e0b']; 
            case 'Coffee & Tea': return ['#3f2c22', '#166534', '#a16207', '#ffffff']; 
            case 'Small Businesses': return ['#0f172a', '#475569', '#e2e8f0', '#f43f5e']; 
            case 'Making Lists': return ['#172554', '#93c5fd', '#e0f2fe', '#3b82f6']; 
            case 'Stories': return ['#2e1065', '#a855f7', '#d8b4fe', '#fde047']; 
            case 'Machines': return ['#111827', '#22d3ee', '#0891b2', '#ec4899']; 
            default: return ['#1e293b', '#64748b', '#94a3b8', '#facc15'];
        }
    };

    const colors = getColors();
    // Use 'slice' to ensure the background covers the whole screen on any device
    // We must ensure key elements are centered (within 20-80 range)
    const containerClass = "absolute inset-0 w-full h-full opacity-30 dark:opacity-50 transition-all duration-1000 group cursor-crosshair";
    const aspectRatio = "xMidYMid slice";

    // SPECIAL MODE: PRONUNCIATION TRAINER
    if (mode === 3) {
        return (
            <svg className={containerClass} viewBox="0 0 100 100" preserveAspectRatio={aspectRatio}>
                <defs>
                    <linearGradient id="trainerGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={colors[0]} />
                        <stop offset="100%" stopColor={colors[2]} />
                    </linearGradient>
                </defs>
                <rect width="100" height="100" fill="url(#trainerGrad)" opacity="0.8" />
                
                {/* Central Soundwave Graphic - Expands on Hover */}
                <g transform="translate(0, 50)" className="transition-transform duration-500 group-hover:scale-y-125 origin-center">
                    {/* Background static wave - Centered */}
                    <path d="M 10 0 Q 35 -10 50 0 T 90 0" fill="none" stroke={colors[1]} strokeWidth="1" opacity="0.3" />
                    
                    {/* Active dynamic wave */}
                    {active && (
                        <>
                            <path 
                                d="M 20 0 Q 35 -20 50 0 T 80 0" 
                                fill="none" 
                                stroke={colors[3]} 
                                strokeWidth="3" 
                                className="animate-pulse"
                            >
                                <animate attributeName="d" values="M 20 0 Q 35 -20 50 0 T 80 0; M 20 0 Q 35 20 50 0 T 80 0; M 20 0 Q 35 -20 50 0 T 80 0" dur="2s" repeatCount="indefinite" />
                            </path>
                            <circle cx="50" cy="0" r="15" fill={colors[3]} opacity="0.1" className="animate-ping" />
                        </>
                    )}
                </g>

                {/* Decorative particles - Kept within safe zone */}
                <circle cx="30" cy="30" r="2" fill={colors[3]} opacity="0.5" className="animate-float transition-all duration-500 group-hover:translate-x-4 group-hover:scale-150" />
                <circle cx="70" cy="70" r="3" fill={colors[3]} opacity="0.5" className="animate-float-fast transition-all duration-500 group-hover:-translate-x-4 group-hover:scale-150" />
            </svg>
        );
    }

    const pulseClass = active ? "animate-pulse-fast" : "animate-pulse-slow";
    const floatClass = active ? "animate-float-fast" : "animate-float";
    const spinClass = active ? "animate-spin-fast" : "animate-spin-slow";

    // TOPIC 1: HOMETOWN
    if (topic === 'Hometown') {
        return (
            <svg className={containerClass} viewBox="0 0 100 100" preserveAspectRatio={aspectRatio}>
                <defs>
                    <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={colors[0]} />
                        <stop offset="100%" stopColor={colors[1]} stopOpacity="0.5" />
                    </linearGradient>
                </defs>
                <rect width="100" height="100" fill="url(#skyGradient)" />
                {/* Buildings - Centered Cluster */}
                <g transform="translate(10, 0)" className={`${active ? "translate-y-1 transition-transform duration-300" : "transition-transform duration-1000"} origin-bottom group-hover:scale-105 transition-transform duration-700 ease-out`}>
                    <path d="M 20 100 L 20 80 A 10 10 0 0 1 40 80 L 40 100 Z" fill={mode > 0 ? colors[3] : colors[2]} className="transition-colors duration-1000" opacity="0.6" />
                    <path d="M 45 100 L 45 70 A 15 15 0 0 1 75 70 L 75 100 Z" fill={mode > 0 ? colors[3] : colors[1]} className="transition-colors duration-1000" opacity="0.5" />
                </g>
                <rect x="75" y="40" width="10" height="60" fill={active ? colors[3] : (mode === 2 ? '#3b82f6' : colors[2])} opacity={active ? '0.9' : (mode === 2 ? '0.8' : '0.4')} className={`transition-all duration-100 ${active ? 'animate-pulse' : ''} group-hover:opacity-100 group-hover:translate-y-[-2px]`}/>
                {mode === 2 && <line x1="60" y1="20" x2="60" y2="100" stroke={active ? "white" : "rgba(255,255,255,0.5)"} strokeWidth={active ? "2" : "0.5"} strokeDasharray="4 2" className={pulseClass} />}
            </svg>
        );
    }

    // TOPIC 2: MIRRORS
    if (topic === 'Mirrors') {
        return (
            <svg className={containerClass} viewBox="0 0 100 100" preserveAspectRatio={aspectRatio}>
                <defs><filter id="blurMe"><feGaussianBlur in="SourceGraphic" stdDeviation={active ? "0.5" : (mode === 1 ? "2" : "0")} /></filter></defs>
                <path d="M10 10 L60 10 L35 60 Z" fill={colors[1]} opacity="0.3" className={active ? "animate-pulse" : ""} />
                <path d="M90 90 L40 90 L65 40 Z" fill={colors[2]} opacity="0.3" className={active ? "animate-pulse delay-100" : ""} />
                {/* Mirror - Centered */}
                <circle cx="50" cy="50" r={active ? "25" : "20"} fill={active ? colors[1] : "none"} fillOpacity={active ? "0.1" : "0"} stroke={active ? colors[3] : colors[2]} strokeWidth={active ? "4" : "1"} opacity="0.5" filter={mode === 1 ? "url(#blurMe)" : ""} className="transition-all duration-500 group-hover:opacity-100 group-hover:stroke-[3px]" />
                {mode >= 1 && <rect x="38" y="30" width="24" height="40" rx="2" fill={active ? colors[3] : colors[3]} opacity={active ? "0.6" : "0.2"} stroke="white" strokeWidth="2" className="transition-all duration-300 group-hover:scale-105 origin-center" />}
                {mode === 2 && <path d="M42 50 L48 56 L58 44" fill="none" stroke={active ? "#34d399" : "#10b981"} strokeWidth={active ? "4" : "3"} strokeLinecap="round" className={`${floatClass} transition-all duration-300 group-hover:scale-125 origin-center`} />}
            </svg>
        );
    }

    // TOPIC 3: SITTING
    if (topic === 'Sitting') {
        return (
            <svg className={containerClass} viewBox="0 0 100 100" preserveAspectRatio={aspectRatio}>
                {/* Chairs - Grid Centered */}
                <g transform="translate(20, 20)">
                    {[0, 1].map(row => ([0, 1, 2].map(col => (
                        <g key={`${row}-${col}`} transform={`translate(${col * 25}, ${row * 35})`} className="transition-transform duration-300 group-hover:translate-y-[-2px]">
                            <line x1="2" y1="15" x2="2" y2="25" stroke={colors[1]} strokeWidth="2" />
                            <line x1="13" y1="15" x2="13" y2="25" stroke={colors[1]} strokeWidth="2" />
                            <rect x="0" y="12" width="15" height="3" fill={colors[1]} />
                            <rect x="0" y="0" width="15" height="12" fill={active ? colors[3] : (mode === 2 ? '#9ca3af' : colors[2])} className={`${mode === 1 ? "animate-pulse" : ""} transition-all duration-300 origin-bottom group-hover:fill-opacity-80`} style={{transform: active ? 'skewX(10deg) scaleY(0.95)' : 'none'}}/>
                            {mode === 2 && <path d="M 5 -5 L 10 -10 M 10 -5 L 5 -10" stroke={active ? colors[3] : colors[3]} strokeWidth={active ? "3" : "1"} className={active ? "animate-bounce" : "animate-pulse"} />}
                        </g>
                    ))))}
                </g>
            </svg>
        );
    }

    // TOPIC 4: WORK
    if (topic === 'Work/Studies') {
        return (
            <svg className={containerClass} viewBox="0 0 100 100" preserveAspectRatio={aspectRatio}>
                 <g transform="translate(30,30)" className="group-hover:scale-110 transition-transform duration-500 origin-center"><circle cx="0" cy="0" r="15" stroke={active ? colors[3] : colors[1]} strokeWidth={active ? "6" : "4"} strokeDasharray="5 2" className={active ? "animate-spin-fast transition-colors duration-300" : "animate-[spin_10s_linear_infinite] transition-colors duration-300"} /></g>
                 <g transform="translate(70,70)" className="group-hover:scale-110 transition-transform duration-500 origin-center"><circle cx="0" cy="0" r="20" stroke={colors[0]} strokeWidth="2" strokeDasharray="2 2" className={active ? "animate-spin-fast" : "animate-[spin_20s_linear_reverse_infinite]"} /></g>
                 <g transform="translate(50, 50)" opacity={mode >= 1 ? 1 : 0.3} className="transition-opacity duration-300 group-hover:opacity-100">
                     <circle cx="0" cy="0" r="15" fill="none" stroke={mode >= 1 ? colors[2] : colors[1]} strokeWidth="2" />
                     <line x1="0" y1="0" x2="0" y2="-12" stroke={active ? colors[3] : colors[3]} strokeWidth={active ? "4" : "2"} className={active ? "animate-spin-fast" : (mode >= 1 ? "animate-[spin_0.5s_linear_infinite]" : "")} />
                 </g>
            </svg>
        );
    }

    // TOPIC 5: OLD BUILDINGS
    if (topic === 'Old Buildings') {
        return (
            <svg className={containerClass} viewBox="0 0 100 100" preserveAspectRatio={aspectRatio}>
                {[20, 40, 60, 80].map((x, i) => (<rect key={x} x={x} y="30" width="5" height="70" fill={colors[2]} opacity={active && i % 2 === 0 ? "0.8" : "0.5"} className="transition-all duration-300 group-hover:opacity-90 group-hover:fill-amber-700"/>))}
                <rect x="15" y="20" width="75" height="10" fill={colors[1]} /><path d="M 15 20 L 52 10 L 90 20 Z" fill={colors[1]} />
                {mode >= 1 && <path d="M 52 40 Q 75 40 75 60 Q 52 80 52 80 Q 29 80 29 60 Q 29 40 52 40" fill="none" stroke={colors[3]} strokeWidth={active ? "5" : "2"} className={pulseClass} opacity={active ? "1" : "0.7"}/>}
                {mode === 2 && <><circle cx="25" cy="50" r="8" fill="#451a03" className={floatClass} /><circle cx="52" cy="50" r={active ? "40" : "35"} fill={colors[3]} opacity={active ? "0.4" : "0.1"} className={`${pulseClass} transition-all duration-300 group-hover:scale-110 origin-center`} /></>}
            </svg>
        );
    }
    
    // TOPIC 6: COFFEE
     if (topic === 'Coffee & Tea') {
        return (
            <svg className={containerClass} viewBox="0 0 100 100" preserveAspectRatio={aspectRatio}>
                <g className={active ? "animate-spin-fast" : (mode >= 1 ? "animate-[spin_60s_linear_infinite]" : "")}>
                    {[...Array(8)].map((_, i) => (
                        <ellipse key={i} cx={20 + Math.random() * 60} cy={20 + Math.random() * 60} rx={active ? "6" : "4"} ry={active ? "8" : "6"} fill={active ? colors[3] : colors[0]} transform={`rotate(${Math.random() * 360} ${Math.random() * 100} ${Math.random() * 100})`} opacity={mode >= 1 ? 0.8 : 0.4} className="transition-all duration-500 group-hover:scale-125"/>
                    ))}
                </g>
                 <path d="M 50 80 Q 45 60 50 40 T 50 20" fill="none" stroke={active ? colors[3] : colors[3]} strokeWidth={active ? "5" : "2"} strokeLinecap="round" opacity={active ? "0.9" : "0.5"} className={`${floatClass} group-hover:translate-y-[-10px] transition-transform duration-700`} />
                 {mode === 2 && <g transform="translate(50,50)" opacity="0.3"><circle cx="0" cy="0" r="25" fill={colors[1]} /><rect x="-8" y="-8" width="16" height="16" fill={colors[3]} className={active ? "animate-spin-fast" : "animate-spin"} /></g>}
            </svg>
        );
    }

    // TOPIC 7: SMALL BUSINESSES
    if (topic === 'Small Businesses') {
        return (
            <svg className={containerClass} viewBox="0 0 100 100" preserveAspectRatio={aspectRatio}>
                <path d="M 15 80 L 15 40 L 25 40 L 25 60 L 35 40 L 35 80 Z" fill={colors[1]} opacity={mode >= 1 ? "0.2" : "0.5"} />
                {/* Shop - Centered */}
                <g transform="translate(60, 50)" opacity={mode >= 1 ? "1" : "0.5"} className="transition-transform duration-300 group-hover:scale-110 origin-center cursor-pointer">
                    <rect x="-15" y="-20" width="30" height="40" fill={colors[2]} />
                    <path d="M -15 -20 L 0 -30 L 15 -20" fill={colors[3]} />
                    {mode >= 1 && <rect x="-10" y="-10" width="20" height="20" fill={active ? "#fef08a" : colors[3]} opacity={active ? "0.9" : "0.3"} className="transition-all duration-200 group-hover:fill-yellow-300 group-hover:opacity-80" />}
                </g>
                {mode === 2 && <g transform="translate(50, 75)"><path d="M 0 0 L 10 10 M 10 0 L 0 10" stroke={active ? colors[3] : colors[3]} strokeWidth={active ? "4" : "2"} className={active ? "animate-bounce" : ""} /></g>}
            </svg>
        );
    }

    // TOPIC 8: MAKING LISTS
    if (topic === 'Making Lists') {
        return (
            <svg className={containerClass} viewBox="0 0 100 100" preserveAspectRatio={aspectRatio}>
                <rect x="20" y="30" width="25" height="40" fill={colors[1]} rx="2" className={mode === 2 ? "opacity-0 transition-opacity duration-1000" : ""} />
                {/* List items */}
                <g className="group-hover:translate-x-1 transition-transform duration-300">
                    <rect x="55" y="25" width="25" height="50" rx="3" fill="none" stroke={active ? colors[3] : colors[3]} strokeWidth={active ? "4" : "2"} className="transition-all duration-200" />
                    <rect x="60" y="30" width="15" height="30" fill={colors[2]} opacity="0.2" className={active ? "animate-pulse" : ""} />
                    {active && <><rect x="62" y="35" width="10" height="2" fill={colors[3]} className="animate-pulse" /><rect x="62" y="40" width="10" height="2" fill={colors[3]} className="animate-pulse delay-75" /></>}
                </g>
                {mode >= 1 && <path d="M 45 50 L 50 45 L 55 50" fill="none" stroke={colors[3]} strokeWidth={active ? "3" : "1"} strokeDasharray="2 2" className={floatClass} />}
            </svg>
        );
    }

    // TOPIC 9: STORIES
    if (topic === 'Stories') {
        return (
             <svg className={containerClass} viewBox="0 0 100 100" preserveAspectRatio={aspectRatio}>
                 <path d="M 20 70 Q 35 80 50 70 Q 65 80 80 70 L 80 50 Q 65 60 50 50 Q 35 60 20 50 Z" fill={colors[1]} opacity="0.5" />
                 <g className={`${floatClass} transition-transform duration-700 group-hover:translate-y-[-15px]`}>
                     <circle cx="35" cy="40" r={active ? "8" : "4"} fill={colors[3]} opacity={active ? "1" : "0.6"} />
                     <path d="M 65 30 L 70 40 L 60 40 Z" fill={colors[2]} opacity="0.6" />
                 </g>
                 {mode >= 1 && <circle cx="50" cy="50" r={active ? "35" : "30"} fill="url(#skyGradient)" opacity={active ? "0.4" : "0.1"} className={pulseClass} />}
             </svg>
        );
    }

    // TOPIC 10: MACHINES
    if (topic === 'Machines') {
        return (
             <svg className={containerClass} viewBox="0 0 100 100" preserveAspectRatio={aspectRatio}>
                 <path d="M 20 20 L 20 80 M 80 20 L 80 80" stroke={active ? colors[3] : colors[1]} strokeWidth={active ? "3" : "1"} className="transition-all duration-200" />
                 <path d="M 20 50 L 80 50" stroke={active ? colors[3] : colors[1]} strokeWidth={active ? "3" : "1"} className="transition-all duration-200" />
                 {/* Laptop */}
                 <g transform="translate(35, 42)" className="group-hover:scale-105 transition-transform duration-300 origin-center">
                     <rect x="0" y="0" width="30" height="20" fill={colors[2]} opacity="0.5" />
                     <path d="M -4 20 L 34 20 L 34 23 L -4 23 Z" fill={colors[2]} />
                     <rect x="2" y="2" width="26" height="16" fill={active ? colors[3] : colors[3]} opacity={active ? "1" : "0.2"} />
                 </g>
             </svg>
        );
    }

    return (
        <svg className={containerClass} viewBox="0 0 100 100" preserveAspectRatio={aspectRatio}>
             <rect width="100" height="100" fill={colors[0]} />
             <circle cx="50" cy="50" r="40" fill={colors[1]} opacity={active ? "0.8" : "0.5"} className={pulseClass} />
        </svg>
    );
};
