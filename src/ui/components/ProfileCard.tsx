import React, { useRef } from 'react';
import { useAuth } from '../../core/auth/AuthContext';
import styles from './ProfileCard.module.css';

export const ProfileCard: React.FC = () => {
    const { profile, uploadAvatar } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!profile) return null;

    // Se asegura que los valores sean seguros antes del cálculo
    const xpPercent = Math.min(((profile.currentXp || 0) / (profile.maxXp || 100)) * 100, 100);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Asegura que hay archivos y que el usuario está logueado
        if (e.target.files && e.target.files[0]) {
            // No necesitamos verificar 'user' aquí, AuthContext lo hace, pero es bueno añadir logs si falla
            uploadAvatar(e.target.files[0]);
        }
    };

    return (
        <div className={styles.card}>
            <div className={styles.topRow}>

                {/* AVATAR + UPLOAD */}
                <div className={styles.avatarContainer} onClick={() => fileInputRef.current?.click()}>
                    <img
                        src={profile.photoUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=" + profile.username}
                        alt="Avatar"
                        className={styles.avatar}
                    />
                    <div className={styles.uploadOverlay}>📷</div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        accept="image/*"
                    />
                </div>

                {/* INFO + STATS */}
                <div className={styles.stats}>
                    <div className={styles.statRow}>
                        <span>XP TOTAL</span>
                        <div className={styles.coinBadge}>
                            {profile.totalXP?.toLocaleString() || '0'} XP
                        </div>
                    </div>
                    <div className={styles.statRow}>
                        <span>CREDITS</span>
                        <div className={styles.coinBadge}>
                            {profile.coins} 💰
                        </div>
                    </div>
                </div>
            </div>

            <h3 className={styles.username}>{profile.username}</h3>

            {/* BARRA DE EXPERIENCIA */}
            <div className={styles.xpContainer}>
                {/* Relleno de la barra (animado por CSS) */}
                <div className={styles.xpBarWrapper}>
                    {/* El estilo 'width' es lo que hace que la barra se mueva */}
                    <div className={styles.xpBar} style={{ width: `${xpPercent}%` }}></div>
                </div>

                {/* Texto de XP */}
                <div className={styles.xpText}>
                    {Math.floor(profile.currentXp || 0)} / {profile.maxXp || 100} XP
                </div>

                {/* Badge de Nivel */}
                <div className={styles.levelBadge}>
                    ★ {profile.currentLevel}
                </div>
            </div>
        </div>
    );
};