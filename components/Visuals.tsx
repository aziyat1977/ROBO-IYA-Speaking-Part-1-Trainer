import React, { useMemo } from 'react';

interface VisualProps {
    topic: string;
    mode: number; // 0, 1, 2
}

export const BackgroundVisual: React.FC<VisualProps> = ({ topic, mode }) => {
    // Generate deterministic random positions based on topic string length to keep SVGs consistent but unique per topic
    const seed = topic.length;

    // Helper for colors
    const getColors = () => {
        // Returns [Background, Accent1, Accent2, Highlight]
        switch (topic) {
            case 'Hometown': return ['#1e293b', '#64748b', '#94a3b8', '#facc15']; // Blues/Greys + Yellow
            case 'Mirrors': return ['#334155', '#cbd5e1', '#f1f5f9', '#ffffff']; // Silvers/Whites
            case 'Sitting': return ['#475569', '#94a3b8', '#cbd5e1', '#ef4444']; // Neutral + Red stress
            case 'Work/Studies': return ['#1e3a8a', '#60a5fa', '#f97316', '#fb923c']; // Blue/Orange
            case 'Old Buildings': return ['#451a03', '#a8a29e', '#78716c', '#f59e0b']; // Sepia/Bronze
            case 'Coffee & Tea': return ['#3f2c22', '#166534', '#a16207', '#d6d3d1']; // Brown/Green
            case 'Small Businesses': return ['#0f172a', '#475569', '#e2e8f0', '#f43f5e']; // Industrial vs Warm
            case 'Making Lists': return ['#172554', '#93c5fd', '#e0f2fe', '#3b82f6']; // Tech blues
            case 'Stories': return ['#2e1065', '#a855f7', '#d8b4fe', '#fde047']; // Magic purple/gold
            case 'Machines': return ['#111827', '#22d3ee', '#0891b2', '#ec4899']; // Cyber cyan/pink
            default: return ['#1e293b', '#64748b', '#94a3b8', '#facc15'];
        }
    };

    const colors = getColors();
    const isDark = true; // SVGs designed for dark mode primarily, transparency handles light mode overlay

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
                {/* Ancient Domes */}
                <path d="M 10 100 L 10 80 A 10 10 0 0 1 30 80 L 30 100 Z" fill={mode > 0 ? colors[3] : colors[2]} className="transition-colors duration-1000" opacity="0.6" />
                <path d="M 35 100 L 35 70 A 15 15 0 0 1 65 70 L 65 100 Z" fill={mode > 0 ? colors[3] : colors[1]} className="transition-colors duration-1000" opacity="0.5" />
                
                {/* Modern Towers */}
                <rect x="70" y="40" width="15" height="60" fill={mode === 2 ? '#3b82f6' : colors[2]} opacity={mode === 2 ? '0.8' : '0.4'} className="transition-all duration-1000" />
                <rect x="88" y="20" width="10" height="80" fill={mode === 2 ? '#60a5fa' : colors[2]} opacity={mode === 2 ? '0.8' : '0.4'} className="transition-all duration-1000" />
                
                {/* Contrast Line (Mode 2) */}
                {mode === 2 && (
                    <line x1="68" y1="0" x2="68" y2="100" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" className="animate-pulse" />
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
                        <feGaussianBlur in="SourceGraphic" stdDeviation={mode === 1 ? "2" : "0"} />
                    </filter>
                </defs>
                {/* Abstract Shards */}
                <path d="M0 0 L50 0 L25 50 Z" fill={colors[1]} opacity="0.3" />
                <path d="M100 100 L50 100 L75 50 Z" fill={colors[2]} opacity="0.3" />
                <circle cx="50" cy="50" r="30" fill="none" stroke={colors[2]} strokeWidth="1" opacity="0.5" filter={mode === 1 ? "url(#blurMe)" : ""} className="transition-all duration-1000" />
                
                {/* Mode 1: Center Mirror */}
                {mode >= 1 && (
                     <rect x="35" y="25" width="30" height="50" rx="2" fill={colors[3]} opacity="0.2" stroke="white" strokeWidth="2" />
                )}
                
                {/* Mode 2: Checkmark */}
                {mode === 2 && (
                    <path d="M40 50 L48 58 L60 42" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" className="animate-[float_3s_ease-in-out_infinite]" />
                )}
            </svg>
        );
    }

    // TOPIC 3: SITTING
    if (topic === 'Sitting') {
        return (
            <svg className="absolute inset-0 w-full h-full opacity-30 transition-all duration-1000" viewBox="0 0 100 100">
                {/* Chairs Pattern */}
                {[0, 1, 2].map(row => (
                    [0, 1, 2, 3].map(col => (
                        <g key={`${row}-${col}`} transform={`translate(${col * 25 + 5}, ${row * 30 + 10})`}>
                            {/* Chair Legs */}
                            <line x1="2" y1="15" x2="2" y2="25" stroke={colors[1]} strokeWidth="2" />
                            <line x1="13" y1="15" x2="13" y2="25" stroke={colors[1]} strokeWidth="2" />
                            {/* Seat */}
                            <rect x="0" y="12" width="15" height="3" fill={colors[1]} />
                            {/* Back */}
                            <rect 
                                x="0" y="0" width="15" height="12" 
                                fill={mode === 2 ? '#9ca3af' : colors[2]} 
                                className={mode === 1 ? "animate-pulse" : ""}
                                style={{
                                    transform: mode >= 1 ? `skewX(${Math.sin(col + row) * 10}deg)` : 'none',
                                    transition: 'all 1s ease'
                                }}
                            />
                            {/* Stress Icons Mode 2 */}
                            {mode === 2 && (
                                <path d="M 5 -5 L 10 -10 M 10 -5 L 5 -10" stroke={colors[3]} strokeWidth="1" className="animate-bounce" />
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
                 {/* Gears */}
                 <g transform="translate(20,20)">
                    <circle cx="0" cy="0" r="15" stroke={colors[1]} strokeWidth="4" strokeDasharray="5 2" className="animate-[spin_10s_linear_infinite]" />
                 </g>
                 <g transform="translate(80,80)">
                    <circle cx="0" cy="0" r="25" stroke={colors[0]} strokeWidth="2" strokeDasharray="2 2" className="animate-[spin_20s_linear_reverse_infinite]" />
                 </g>

                 {/* Mode 1: Clocks spinning */}
                 <g transform="translate(50, 50)" opacity={mode >= 1 ? 1 : 0.3}>
                    <circle cx="0" cy="0" r="20" fill="none" stroke={mode >= 1 ? colors[2] : colors[1]} strokeWidth="2" />
                    <line x1="0" y1="0" x2="0" y2="-15" stroke={colors[3]} strokeWidth="2" className={mode >= 1 ? "animate-[spin_0.5s_linear_infinite]" : ""} />
                    <line x1="0" y1="0" x2="10" y2="0" stroke={colors[3]} strokeWidth="2" className={mode >= 1 ? "animate-[spin_4s_linear_infinite]" : ""} />
                 </g>

                 {/* Mode 2: Balance Scale */}
                 {mode === 2 && (
                     <g transform="translate(50, 20)">
                         <path d="M -20 10 L 0 0 L 20 10" fill="none" stroke={colors[3]} strokeWidth="2" />
                         <line x1="0" y1="0" x2="0" y2="40" stroke={colors[3]} strokeWidth="2" />
                         <rect x="-25" y="10" width="10" height="10" fill={colors[0]} /> {/* Weight */}
                         <path d="M 20 15 L 25 25 L 15 25 Z" fill={colors[1]} /> {/* Diamond */}
                     </g>
                 )}
            </svg>
        );
    }

    // TOPIC 5: OLD BUILDINGS
    if (topic === 'Old Buildings') {
        return (
            <svg className="absolute inset-0 w-full h-full opacity-40 transition-all duration-1000" viewBox="0 0 100 100">
                {/* Columns */}
                {[10, 30, 50, 70, 90].map(x => (
                    <rect key={x} x={x} y="20" width="5" height="80" fill={colors[2]} opacity="0.5" />
                ))}
                <rect x="5" y="10" width="90" height="10" fill={colors[1]} />
                <path d="M 5 10 L 50 0 L 95 10 Z" fill={colors[1]} />

                {/* Mode 1: Shield */}
                {mode >= 1 && (
                    <path d="M 50 30 Q 80 30 80 60 Q 50 90 50 90 Q 20 90 20 60 Q 20 30 50 30" fill="none" stroke={colors[3]} strokeWidth="2" className="animate-pulse" />
                )}

                {/* Mode 2: Wrecking Ball vs Aura */}
                {mode === 2 && (
                    <>
                        <circle cx="15" cy="50" r="10" fill="#451a03" className="animate-[float_2s_ease-in-out_infinite]" />
                        <circle cx="50" cy="50" r="40" fill={colors[3]} opacity="0.1" className="animate-pulse" />
                    </>
                )}
            </svg>
        );
    }
    
    // TOPIC 6: COFFEE
     if (topic === 'Coffee & Tea') {
        return (
            <svg className="absolute inset-0 w-full h-full opacity-30 transition-all duration-1000" viewBox="0 0 100 100">
                {/* Beans */}
                <g className={mode >= 1 ? "animate-[spin_60s_linear_infinite]" : ""}>
                    {[...Array(10)].map((_, i) => (
                        <ellipse 
                            key={i} 
                            cx={Math.random() * 100} 
                            cy={Math.random() * 100} 
                            rx="4" ry="6" 
                            fill={colors[0]} 
                            transform={`rotate(${Math.random() * 360} ${Math.random() * 100} ${Math.random() * 100})`}
                            opacity={mode >= 1 ? 0.8 : 0.4}
                        />
                    ))}
                </g>
                
                {/* Steam */}
                 <path d="M 50 80 Q 40 60 50 40 T 50 10" fill="none" stroke={colors[3]} strokeWidth="2" strokeLinecap="round" opacity="0.5" className="animate-[float_3s_ease-in-out_infinite]" />
                 
                 {/* Mode 2: Head */}
                 {mode === 2 && (
                     <g transform="translate(50,50)" opacity="0.3">
                         <circle cx="0" cy="0" r="30" fill={colors[1]} />
                         <rect x="-10" y="-10" width="20" height="20" fill={colors[3]} className="animate-spin" />
                     </g>
                 )}
            </svg>
        );
    }

    // Default Fallback
    return (
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100">
             <rect width="100" height="100" fill={colors[0]} />
             <circle cx="50" cy="50" r="40" fill={colors[1]} opacity="0.5" />
        </svg>
    );
};