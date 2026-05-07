import React, { useRef, useCallback } from 'react';

interface Tilt3DProps {
    children: React.ReactNode;
    maxTilt?: number;
    perspective?: number;
    className?: string;
    glare?: boolean;
    scale?: number;
    lift?: number;
    duration_in?: number;
    duration_out?: number;
    radius?: number;
}

// 只看代码可能不完美，但是显示效果很好。
export const Tilt_3D: React.FC<Tilt3DProps> = ({
                                                      children,
                                                      maxTilt = 12,
                                                      perspective = 800,
                                                      className = '',
                                                      glare = true,
                                                      scale = 1.06,
                                                      lift = 1.055,
                                                      duration_in = 350,
                                                      duration_out = 350,
                                                      radius = 16,
                                                  }) => {
    const cardRef = useRef<HTMLDivElement>(null);

    const target = useRef({ x: 0.5, y: 0.5 });
    const current = useRef({ x: 0.5, y: 0.5 });
    const raf = useRef<number | null>(null);
    const isHover = useRef(false);

    const animate = useCallback(() => {
        const el = cardRef.current;
        if (!el) return;

        current.current.x += (target.current.x - current.current.x) * 0.15;
        current.current.y += (target.current.y - current.current.y) * 0.15;

        const rx = (0.5 - current.current.y) * maxTilt * 2;
        const ry = (current.current.x - 0.5) * maxTilt * 2;

        el.style.transform = `
            rotateX(${rx}deg)
            rotateY(${ry}deg)
            scale(${scale})
        `;

        if (isHover.current) {
            raf.current = requestAnimationFrame(animate);
        }
    }, [maxTilt, scale]);

    const handleMouseEnter = useCallback(() => {
        const el = cardRef.current;
        if (!el) return;

        isHover.current = true;

        el.style.transition = `transform ${duration_in}ms cubic-bezier(0.2, 0.8, 0.2, 1)`;
        el.style.transform = `
            rotateX(0deg)
            rotateY(0deg)
            scale(${lift})
        `;

        if (glare) {
            el.style.setProperty('--glare-opacity', '1');
        }

        raf.current = requestAnimationFrame(animate);
    }, [animate, duration_in, lift, glare]);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const el = cardRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();

        let x = (e.clientX - rect.left) / rect.width;
        let y = (e.clientY - rect.top) / rect.height;

        x = Math.min(Math.max(x, 0), 1);
        y = Math.min(Math.max(y, 0), 1);

        target.current.x = x;
        target.current.y = y;

        if (glare) {
            el.style.setProperty('--glare-x', `${x * 100}%`);
            el.style.setProperty('--glare-y', `${y * 100}%`);
        }
    }, [glare]);

    const handleMouseLeave = useCallback(() => {
        const el = cardRef.current;
        if (!el) return;

        isHover.current = false;

        if (raf.current) {
            cancelAnimationFrame(raf.current);
            raf.current = null;
        }

        el.style.transition = `transform ${duration_out}ms cubic-bezier(0.2, 0.8, 0.2, 1)`;
        el.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';

        if (glare) {
            el.style.setProperty('--glare-opacity', '0');
            el.style.setProperty('--glare-x', '50%');
            el.style.setProperty('--glare-y', '50%');
        }
    }, [duration_out, glare]);

    return (
        <div
            className={`inline-block ${className}`}
            style={{ perspective: `${perspective}px` }}
        >
            <div
                ref={cardRef}
                className="relative will-change-transform"
                style={{
                    transformStyle: 'preserve-3d',
                    borderRadius: `${radius}px`,
                }}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {glare && (
                    <div
                        className="pointer-events-none absolute inset-0 z-30"
                        style={{
                            borderRadius: `${radius}px`,
                            background: `
                                radial-gradient(
                                    circle at var(--glare-x, 50%) var(--glare-y, 50%),
                                    rgba(255,255,255,0.25),
                                    transparent 60%
                                )
                            `,
                            mixBlendMode: 'screen',
                            opacity: 'var(--glare-opacity, 0)',
                            transition: 'opacity 150ms ease',
                        }}
                    />
                )}

                <div className="relative z-20">
                    {children}
                </div>
            </div>
        </div>
    );
};