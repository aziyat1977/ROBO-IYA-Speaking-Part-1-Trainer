import React, { useMemo } from 'react';

interface VisualProps {
    topic: string;
    mode: number; // 0, 1, 2
    active: boolean;
}

export const BackgroundVisual: React.FC<VisualProps> = ({ topic, mode, active }) => {
    // Helper for colors
    const getColors = () => {
        // Returns [Background, Accent1, Accent2, Highlight]
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

    // Common audio reactive class
    const pulseClass = active ? "animate-pulse-fast" : "animate-pulse-slow";
    const floatClass = active ? "animate-float-fast" : "animate-float";
    const spinClass = active ? "animate-spin-fast" : "animate-spin-slow";

    // TOPIC 1: HOMETOWN
    if (topic === 'Hometown') {
        return (
            <svg className="absolute inset-0 w-full h-full opacity-30 dark:opacity-40 transition-all duration-1000" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={colors[0]} />
                        <stop offset="100%" stopColor={colors[1]} stopOpacity="0.5" />
                    </linearGradient>
                </defs>
                <rect width="100" height="100" fill="url(#skyGradient)" />
                <path d="M 10 100 L 10 80 A 10 10 0 0 1 30 80 L 30 100 Z" fill={mode > 0 ? colors[3] : colors[2]} className="transition-colors duration-1000" opacity="0.6" />
                <path d="M 35 100 L 35 70 A 15 15 0 0 1 65 70 L 65 100 Z" fill={mode > 0 ? colors[3] : colors[1]} className="transition-colors duration-1000" opacity="0.5" />
                
                {/* Modern Towers - React to audio by opacity pulsing and color shift */}
                <rect 
                    x="70" y="40" width="15" height="60" 
                    fill={active ? colors[3] : (mode === 2 ? '#3b82f6' : colors[2])} 
                    opacity={active ? '0.9' : (mode === 2 ? '0.8' : '0.4')} 
                    className="transition-all duration-300" 
                />
                <rect 
                    x="88" y="20" width="10" height="80" 
                    fill={active ? colors[3] : (mode === 2 ? '#60a5fa' : colors[2])} 
                    opacity={active ? '0.9' : (mode === 2 ? '0.8' : '0.4')} 
                    className="transition-all duration-300 delay-75" 
                />
                
                {mode === 2 && (
                    <line x1="68" y1="0" x2="68" y2="100" stroke={active ? "white" : "rgba(255,255,255,0.5)"} strokeWidth={active ? "1" : "0.5"} strokeDasharray="2 2" className={pulseClass} />
                )}
            </svg>
        );
    }

    // TOPIC 2: MIRRORS
    if (topic === 'Mirrors') {
        return (
            <svg className="absolute inset-0 w-full h-full opacity-40 transition-all duration-1000" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
                <defs>
                    <filter id="blurMe">
                        <feGaussianBlur in="SourceGraphic" stdDeviation={active ? "0.5" : (mode === 1 ? "2" : "0")} />
                    </filter>
                </defs>
                <path d="M0 0 L50 0 L25 50 Z" fill={colors[1]} opacity="0.3" />
                <path d="M100 100 L50 100 L75 50 Z" fill={colors[2]} opacity="0.3" />
                {/* Audio reaction: Border width, color, and size */}
                <circle 
                    cx="50" cy="50" r={active ? "32" : "30"} 
                    fill="none" 
                    stroke={active ? colors[3] : colors[2]} 
                    strokeWidth={active ? "3" : "1"} 
                    opacity="0.5" 
                    filter={mode === 1 ? "url(#blurMe)" : ""} 
                    className="transition-all duration-200" 
                />
                
                {mode >= 1 && (
                     <rect x="35" y="25" width="30" height="50" rx="2" fill={active ? colors[3] : colors[3]} opacity={active ? "0.4" : "0.2"} stroke="white" strokeWidth="2" className="transition-all duration-300" />
                )}
                
                {mode === 2 && (
                    <path d="M40 50 L48 58 L60 42" fill="none" stroke={active ? "#34d399" : "#10b981"} strokeWidth="4" strokeLinecap="round" className={floatClass} />
                )}
            </svg>
        );
    }

    // TOPIC 3: SITTING
    if (topic === 'Sitting') {
        return (
            <svg className="absolute inset-0 w-full h-full opacity-30 transition-all duration-1000" viewBox="0 0 100 100">
                {[0, 1, 2].map(row => (
                    [0, 1, 2, 3].map(col => (
                        <g key={`${row}-${col}`} transform={`translate(${col * 25 + 5}, ${row * 30 + 10})`}>
                            <line x1="2" y1="15" x2="2" y2="25" stroke={colors[1]} strokeWidth="2" />
                            <line x1="13" y1="15" x2="13" y2="25" stroke={colors[1]} strokeWidth="2" />
                            <rect x="0" y="12" width="15" height="3" fill={colors[1]} />
                            {/* Chairs wiggle and change color when active */}
                            <rect 
                                x="0" y="0" width="15" height="12" 
                                fill={active ? colors[3] : (mode === 2 ? '#9ca3af' : colors[2])} 
                                className={mode === 1 ? "animate-pulse" : ""}
                                style={{
                                    transform: active ? `skewX(${Math.sin(Date.now()) * 15}deg)` : (mode >= 1 ? `skewX(${Math.sin(col + row) * 10}deg)` : 'none'),
                                    transition: 'all 0.3s ease'
                                }}
                            />
                            {mode === 2 && (
                                <path d="M 5 -5 L 10 -10 M 10 -5 L 5 -10" stroke={active ? colors[3] : colors[3]} strokeWidth={active ? "2" : "1"} className={active ? "animate-bounce" : "animate-pulse"} />
                            )}
                        </g>
                    ))
                ))}
            </svg>
        );
    }

    // TOPIC 4: WORK
    if (topic === 'Work/Studies') {
        return (
            <svg className="absolute inset-0 w-full h-full opacity-20 transition-all duration-1000" viewBox="0 0 100 100">
                 <g transform="translate(20,20)">
                    {/* Spin faster and change color when active */}
                    <circle 
                        cx="0" cy="0" r="15" 
                        stroke={active ? colors[3] : colors[1]} 
                        strokeWidth={active ? "6" : "4"} 
                        strokeDasharray="5 2" 
                        className={active ? "animate-spin-fast transition-colors duration-300" : "animate-[spin_10s_linear_infinite] transition-colors duration-300"} 
                    />
                 </g>
                 <g transform="translate(80,80)">
                    <circle cx="0" cy="0" r="25" stroke={colors[0]} strokeWidth="2" strokeDasharray="2 2" className={active ? "animate-spin-fast" : "animate-[spin_20s_linear_reverse_infinite]"} />
                 </g>

                 <g transform="translate(50, 50)" opacity={mode >= 1 ? 1 : 0.3}>
                    <circle cx="0" cy="0" r="20" fill="none" stroke={mode >= 1 ? colors[2] : colors[1]} strokeWidth="2" />
                    <line x1="0" y1="0" x2="0" y2="-15" stroke={active ? colors[3] : colors[3]} strokeWidth="2" className={active ? "animate-spin-fast" : (mode >= 1 ? "animate-[spin_0.5s_linear_infinite]" : "")} />
                    <line x1="0" y1="0" x2="10" y2="0" stroke={colors[3]} strokeWidth="2" className={mode >= 1 ? "animate-[spin_4s_linear_infinite]" : ""} />
                 </g>

                 {mode === 2 && (
                     <g transform="translate(50, 20)">
                         <path d="M -20 10 L 0 0 L 20 10" fill="none" stroke={colors[3]} strokeWidth="2" />
                         <line x1="0" y1="0" x2="0" y2="40" stroke={colors[3]} strokeWidth="2" />
                         <rect x="-25" y="10" width="10" height="10" fill={colors[0]} />
                         <path d="M 20 15 L 25 25 L 15 25 Z" fill={active ? colors[3] : colors[1]} className="transition-colors duration-300" />
                     </g>
                 )}
            </svg>
        );
    }

    // TOPIC 5: OLD BUILDINGS
    if (topic === 'Old Buildings') {
        return (
            <svg className="absolute inset-0 w-full h-full opacity-40 transition-all duration-1000" viewBox="0 0 100 100">
                {[10, 30, 50, 70, 90].map(x => (
                    <rect key={x} x={x} y="20" width="5" height="80" fill={colors[2]} opacity="0.5" />
                ))}
                <rect x="5" y="10" width="90" height="10" fill={colors[1]} />
                <path d="M 5 10 L 50 0 L 95 10 Z" fill={colors[1]} />

                {mode >= 1 && (
                    <path 
                        d="M 50 30 Q 80 30 80 60 Q 50 90 50 90 Q 20 90 20 60 Q 20 30 50 30" 
                        fill="none" 
                        stroke={colors[3]} 
                        strokeWidth={active ? "4" : "2"} 
                        className={pulseClass} 
                        opacity={active ? "1" : "0.7"}
                    />
                )}

                {mode === 2 && (
                    <>
                        <circle cx="15" cy="50" r="10" fill="#451a03" className={floatClass} />
                        <circle cx="50" cy="50" r="40" fill={colors[3]} opacity={active ? "0.3" : "0.1"} className={pulseClass} />
                    </>
                )}
            </svg>
        );
    }
    
    // TOPIC 6: COFFEE
     if (topic === 'Coffee & Tea') {
        return (
            <svg className="absolute inset-0 w-full h-full opacity-30 transition-all duration-1000" viewBox="0 0 100 100">
                <g className={active ? "animate-spin-fast" : (mode >= 1 ? "animate-[spin_60s_linear_infinite]" : "")}>
                    {[...Array(10)].map((_, i) => (
                        <ellipse 
                            key={i} 
                            cx={Math.random() * 100} 
                            cy={Math.random() * 100} 
                            rx="4" ry="6" 
                            fill={active ? colors[3] : colors[0]} 
                            transform={`rotate(${Math.random() * 360} ${Math.random() * 100} ${Math.random() * 100})`}
                            opacity={mode >= 1 ? 0.8 : 0.4}
                            className="transition-colors duration-500"
                        />
                    ))}
                </g>
                 <path d="M 50 80 Q 40 60 50 40 T 50 10" fill="none" stroke={active ? colors[3] : colors[3]} strokeWidth={active ? "3" : "2"} strokeLinecap="round" opacity={active ? "0.8" : "0.5"} className={floatClass} />
                 
                 {mode === 2 && (
                     <g transform="translate(50,50)" opacity="0.3">
                         <circle cx="0" cy="0" r="30" fill={colors[1]} />
                         <rect x="-10" y="-10" width="20" height="20" fill={colors[3]} className={active ? "animate-spin-fast" : "animate-spin"} />
                     </g>
                 )}
            </svg>
        );
    }

    // TOPIC 7: SMALL BUSINESSES
    if (topic === 'Small Businesses') {
        return (
            <svg className="absolute inset-0 w-full h-full opacity-30 transition-all duration-1000" viewBox="0 0 100 100">
                {/* Factories Background */}
                <path d="M 10 80 L 10 30 L 25 30 L 25 50 L 40 30 L 40 80 Z" fill={colors[1]} opacity={mode >= 1 ? "0.2" : "0.5"} />
                <rect x="15" y="10" width="5" height="20" fill={colors[1]} opacity="0.3" className={floatClass} />
                
                {/* Storefronts */}
                <g transform="translate(60, 40)" opacity={mode >= 1 ? "1" : "0.5"}>
                     <rect x="0" y="0" width="30" height="40" fill={colors[2]} />
                     <path d="M 0 0 L 15 -10 L 30 0" fill={colors[3]} />
                     <rect x="5" y="10" width="20" height="20" fill={colors[0]} opacity="0.5" />
                     {/* Light in window - Brightens on Audio */}
                     {mode >= 1 && <rect x="5" y="10" width="20" height="20" fill={colors[3]} opacity={active ? "0.8" : "0.3"} className="transition-opacity duration-200" />}
                </g>

                {mode === 2 && (
                    <g transform="translate(50, 70)">
                        <path d="M 0 0 L 10 10 M 10 0 L 0 10" stroke={active ? colors[3] : colors[3]} strokeWidth="2" className={active ? "animate-bounce" : ""} />
                    </g>
                )}
            </svg>
        );
    }

    // TOPIC 8: MAKING LISTS
    if (topic === 'Making Lists') {
        return (
            <svg className="absolute inset-0 w-full h-full opacity-20 transition-all duration-1000" viewBox="0 0 100 100">
                {/* Note pads */}
                <rect x="10" y="20" width="30" height="40" fill={colors[1]} rx="2" className={mode === 2 ? "opacity-0 transition-opacity duration-1000" : ""} />
                {/* Phone */}
                <rect x="60" y="15" width="25" height="50" rx="3" fill="none" stroke={active ? colors[3] : colors[3]} strokeWidth={active ? "3" : "2"} className="transition-all duration-200" />
                <rect x="65" y="20" width="15" height="30" fill={colors[2]} opacity="0.2" className={active ? "animate-pulse" : ""} />
                
                {/* Digital items light up */}
                {active && (
                    <>
                        <rect x="67" y="25" width="11" height="2" fill={colors[3]} className="animate-pulse" />
                        <rect x="67" y="30" width="11" height="2" fill={colors[3]} className="animate-pulse delay-75" />
                        <rect x="67" y="35" width="8" height="2" fill={colors[3]} className="animate-pulse delay-150" />
                    </>
                )}

                {mode >= 1 && (
                    <path d="M 40 40 L 50 30 L 60 40" fill="none" stroke={colors[3]} strokeWidth="1" strokeDasharray="2 2" className={floatClass} />
                )}

                {mode === 2 && (
                     <path d="M 50 10 Q 70 5 90 10" fill="none" stroke={colors[3]} strokeWidth="2" opacity="0.5" />
                )}
            </svg>
        );
    }

    // TOPIC 9: STORIES
    if (topic === 'Stories') {
        return (
             <svg className="absolute inset-0 w-full h-full opacity-30 transition-all duration-1000" viewBox="0 0 100 100">
                 {/* Open Book */}
                 <path d="M 10 70 Q 30 80 50 70 Q 70 80 90 70 L 90 40 Q 70 50 50 40 Q 30 50 10 40 Z" fill={colors[1]} opacity="0.5" />
                 
                 {/* Magic emerging - Sparkles grow on audio */}
                 <g className={floatClass}>
                     <circle cx="30" cy="30" r={active ? "8" : "5"} fill={colors[3]} opacity={active ? "0.9" : "0.6"} className="transition-all duration-300" />
                     <path d="M 70 20 L 75 30 L 65 30 Z" fill={colors[2]} opacity="0.6" />
                     {active && <circle cx="45" cy="20" r="4" fill={colors[2]} className="animate-ping" />}
                 </g>

                 {mode >= 1 && (
                     <circle cx="50" cy="50" r="40" fill="url(#skyGradient)" opacity={active ? "0.3" : "0.1"} className={pulseClass} />
                 )}

                 {mode === 2 && (
                     <path d="M 45 30 A 5 5 0 0 1 55 30" fill="none" stroke={colors[3]} strokeWidth="2" className={active ? "animate-spin-fast" : ""} />
                 )}
             </svg>
        );
    }

    // TOPIC 10: MACHINES
    if (topic === 'Machines') {
        return (
             <svg className="absolute inset-0 w-full h-full opacity-20 transition-all duration-1000" viewBox="0 0 100 100">
                 {/* Circuit lines - Flash on audio */}
                 <path d="M 10 10 L 10 90 M 90 10 L 90 90" stroke={active ? colors[3] : colors[1]} strokeWidth={active ? "2" : "1"} className="transition-colors duration-200" />
                 <path d="M 10 50 L 90 50" stroke={active ? colors[3] : colors[1]} strokeWidth={active ? "2" : "1"} className="transition-colors duration-200" />

                 {/* Laptop */}
                 <g transform="translate(30, 40)">
                     <rect x="0" y="0" width="40" height="25" fill={colors[2]} opacity="0.5" />
                     <path d="M -5 25 L 45 25 L 45 28 L -5 28 Z" fill={colors[2]} />
                     {/* Screen Glow */}
                     <rect x="2" y="2" width="36" height="21" fill={colors[3]} opacity={active ? "0.8" : "0.2"} className="transition-opacity duration-100" />
                 </g>
                 
                 {/* Convergence */}
                 {mode >= 1 && (
                     <g>
                        <line x1="10" y1="20" x2="30" y2="40" stroke={colors[3]} strokeWidth="0.5" className={active ? "animate-pulse" : ""} />
                        <line x1="90" y1="80" x2="70" y2="65" stroke={colors[3]} strokeWidth="0.5" className={active ? "animate-pulse" : ""} />
                     </g>
                 )}

                 {mode === 2 && (
                      <g transform="translate(50, 50)">
                          <rect x="-2" y="-5" width="4" height="10" fill="white" />
                          <circle cx="0" cy="0" r="15" fill="none" stroke={colors[3]} strokeWidth="1" strokeDasharray="3 3" className={spinClass} />
                      </g>
                 )}
             </svg>
        );
    }

    // Default Fallback
    return (
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100">
             <rect width="100" height="100" fill={colors[0]} />
             <circle cx="50" cy="50" r="40" fill={colors[1]} opacity={active ? "0.8" : "0.5"} className={pulseClass} />
        </svg>
    );
};