import React, { useEffect, useState } from 'react';
import { useAuth } from '../../core/auth/AuthContext';
import { LeaderboardEntry } from '../../core/progression/XPSystemTypes';

export const Leaderboard: React.FC = () => {
    const { getLeaderboardTop10 } = useAuth();
    const [topPlayers, setTopPlayers] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const data = await getLeaderboardTop10();
                setTopPlayers(data);
            } catch (error) {
                console.error("Error al cargar el Leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();

        // Refrescar el leaderboard cada 30 segundos
        const interval = setInterval(fetchLeaderboard, 30000);
        return () => clearInterval(interval);
    }, [getLeaderboardTop10]);

    if (loading) {
        return <div style={{ color: '#ccc', fontStyle: 'italic', textAlign: 'center' }}>Cargando datos...</div>;
    }

    return (
        <div style={{ padding: '0px 10px', minHeight: '200px' }}>
            <h4 style={{ marginTop: 0, color: 'var(--gothic-gold)', textAlign: 'center', textShadow: '0 0 5px rgba(199, 164, 110, 0.3)' }}>TOP JUGADORES (XP)</h4>

            {topPlayers.length === 0 ? (
                <div style={{ color: '#666', fontStyle: 'italic', textAlign: 'center' }}>No hay puntuaciones aún.</div>
            ) : (
                <ol style={{ paddingLeft: '20px', margin: 0, listStyle: 'none' }}>
                    {topPlayers.map((player, index) => (
                        <li key={player.uid} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '5px 0',
                            borderBottom: '1px dashed #333',
                            color: index < 3 ? 'var(--gothic-gold)' : '#fff',
                            fontWeight: index < 3 ? 'bold' : 'normal'
                        }}>
                            <span>{index + 1}. {player.username} (Lv.{player.level})</span>
                            <span style={{ color: index < 3 ? 'var(--gothic-gold)' : '#fff' }}>{player.totalXP.toLocaleString()} XP</span>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
};