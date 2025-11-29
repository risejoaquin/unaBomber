import React, { useState, useEffect } from 'react';
import { useAuth } from '../../core/auth/AuthContext';

export const HourlyReward: React.FC = () => {
    const { profile, claimHourlyReward } = useAuth();
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [canClaim, setCanClaim] = useState(false);

    useEffect(() => {
        if (!profile) return;

        const timer = setInterval(() => {
            const now = Date.now();
            const last = profile.lastRewardClaimed || 0;
            const diff = now - last;
            const oneHour = 3600 * 1000;

            if (diff >= oneHour) {
                setCanClaim(true);
                setTimeLeft('');
            } else {
                setCanClaim(false);
                const remaining = oneHour - diff;
                const m = Math.floor((remaining / 1000 / 60) % 60);
                const s = Math.floor((remaining / 1000) % 60);
                setTimeLeft(`${m}:${s < 10 ? '0' : ''}${s}`);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [profile]);

    const handleClaim = async () => {
        const success = await claimHourlyReward();
        if (success) {
            alert("¡100 Monedas recibidas!");
        }
    };

    return (
        <div className="glass-panel" style={{ background: 'var(--glass-bg)', padding: '15px', borderRadius: '4px', boxShadow: '0 4px 15px rgba(0,0,0,0.4)', textAlign: 'center' }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--gothic-gold)' }}>Recompensa Horaria</h4>

            {canClaim ? (
                <button
                    onClick={handleClaim}
                    className="cyber-btn primary" // Usar estilo primary (rojo/accent)
                    style={{
                        padding: '10px 20px', fontSize: '1rem',
                        cursor: 'pointer', fontWeight: 'bold', width: '100%',
                        marginBottom: 0
                    }}
                >
                    ¡RECLAMAR 100 💰!
                </button>
            ) : (
                <button
                    disabled
                    // CORRECCIÓN ESTILO: Botón deshabilitado limpio
                    style={{
                        background: 'var(--gothic-dark-color)', color: '#888', border: '1px solid #555',
                        padding: '10px 20px', borderRadius: '4px', fontSize: '1rem',
                        cursor: 'not-allowed', width: '100%', fontFamily: 'monospace',
                        marginBottom: 0
                    }}
                >
                    Vuelve en {timeLeft}
                </button>
            )}
        </div>
    );
};