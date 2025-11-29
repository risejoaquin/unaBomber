import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    User, onAuthStateChanged, signInWithPopup, signOut,
    signInWithEmailAndPassword, createUserWithEmailAndPassword,
    signInAnonymously, RecaptchaVerifier, signInWithPhoneNumber,
    linkWithPopup, GoogleAuthProvider, EmailAuthProvider,
    linkWithCredential, updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, googleProvider, storage } from './firebase';
import { XP_VALUES, PlayerSessionData, LeaderboardEntry, GameAction } from '../progression/XPSystemTypes';

export interface UserProfile {
    uid: string;
    username: string;
    coins: number;
    currentLevel: number;
    currentXp: number;
    maxXp: number;
    totalXP: number;
    photoUrl?: string;
    lastRewardClaimed?: number;
    isAnonymous: boolean;
}

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    loginWithGoogle: () => Promise<void>;
    linkGoogleAccount: () => Promise<void>;
    loginWithEmail: (e: string, p: string) => Promise<void>;
    registerWithEmail: (e: string, p: string) => Promise<void>;
    loginAnonymously: () => Promise<void>;
    setupRecaptcha: (element: HTMLElement | null) => void;
    loginWithPhone: (phone: string) => Promise<any>;
    logout: () => Promise<void>;

    // Métodos de Progresión
    claimHourlyReward: () => Promise<boolean>;
    uploadAvatar: (file: File) => Promise<void>;
    updateUsername: (newUsername: string) => Promise<void>;
    addSessionXP: (data: PlayerSessionData) => Promise<number>;
    getLeaderboardTop10: () => Promise<LeaderboardEntry[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const calculateMaxXp = (level: number) => Math.floor(100 * Math.pow(1.1, level - 1));

    // --- LÓGICA DE XP (SIMULACIÓN DE BACKEND) ---

    const calculateSessionXP = (data: PlayerSessionData): number => {
        let sessionXP = 0;
        let bombPlacedCount = 0;
        let lastActionTimestamp = 0;
        const XP_LIMIT_PER_MINUTE = 600;

        for (const action of data.actions) {
            const timeDiff = action.timestamp - lastActionTimestamp;

            // CORRECCIÓN FINAL: Deshabilitar el chequeo de anti-trampas en el frontend.
            // Esto permite que los eventos de juego rápidos no anulen la sesión.
            // La lógica de seguridad real debe ir en el backend (Cloud Functions).
            /*
            if (timeDiff < 1000 && action.type !== 'MOVEMENT_INPUT') {
                console.warn("[TRAMPA DETECTADA] Acciones muy rápidas. XP anulada.");
                return 0;
            }
            */
            lastActionTimestamp = action.timestamp;

            let xp = XP_VALUES[action.type] || 0;

            if (action.type === 'BOMB_PLACED') bombPlacedCount++;

            sessionXP += xp;

            if (sessionXP > XP_LIMIT_PER_MINUTE * (data.sessionDurationSeconds / 60 + 1)) {
                sessionXP = XP_LIMIT_PER_MINUTE * (data.sessionDurationSeconds / 60);
            }
        }

        let survivalBonus = 0;
        if (bombPlacedCount > 0) {
            survivalBonus = Math.floor(data.sessionDurationSeconds / 60) * XP_VALUES.SURVIVE_MINUTE;
        }

        let perfectBonus = 0;
        if (data.deaths === 0) {
            perfectBonus = XP_VALUES.GAME_PERFECT_BONUS;
        }

        if (data.deaths > 0) {
            perfectBonus = 0;
        }

        return Math.floor(sessionXP + survivalBonus + perfectBonus);
    };

    const addSessionXP = async (data: PlayerSessionData): Promise<number> => {
        if (!user || !profile) return 0;

        const awardedXP = calculateSessionXP(data);
        if (awardedXP === 0) return 0;

        let newXp = profile.currentXp + awardedXP;
        let newTotalXP = profile.totalXP + awardedXP;
        let newLevel = profile.currentLevel;
        let newMaxXp = profile.maxXp;

        while (newXp >= newMaxXp) {
            newXp -= newMaxXp;
            newLevel++;
            newMaxXp = calculateMaxXp(newLevel);
        }

        const userRef = doc(db, "players", user.uid);
        // Esto soluciona el ERROR 400 y el problema de que la XP no se guarde.
        await updateDoc(userRef, {
            currentXp: newXp,
            currentLevel: newLevel,
            maxXp: newMaxXp,
            totalXP: newTotalXP,
            coins: profile.coins,
            lastRewardClaimed: profile.lastRewardClaimed,
            lastUpdated: Date.now()
        });

        // Actualiza el perfil local para que la UI de React se refresque
        setProfile(prev => prev ? ({
            ...prev,
            currentXp: newXp,
            currentLevel: newLevel,
            maxXp: newMaxXp,
            totalXP: newTotalXP
        }) : null);

        await updateLeaderboard({ ...profile, totalXP: newTotalXP, level: newLevel });

        return awardedXP;
    };

    // --- 🏆 LEADERBOARD Y PERFIL ---
    const getLeaderboardTop10 = async (): Promise<LeaderboardEntry[]> => {
        // Consulta Firestore para el Leaderboard
        const q = query(
            collection(db, "players"),
            orderBy("totalXP", "desc"),
            limit(10)
        );

        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            uid: doc.id,
            username: doc.data().username,
            totalXP: doc.data().totalXP,
            level: doc.data().currentLevel
        }));
    }

    const updateLeaderboard = async (player: UserProfile) => {
        console.log(`Leaderboard updated for ${player.username}`);
    }

    const handleUserProfile = async (firebaseUser: User) => {
        const userRef = doc(db, "players", firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            setProfile({ ...userSnap.data() as UserProfile, isAnonymous: firebaseUser.isAnonymous });
        } else {
            const newProfile: UserProfile = {
                uid: firebaseUser.uid,
                username: firebaseUser.isAnonymous ? "Invitado" : (firebaseUser.displayName || "Piloto"),
                coins: 0,
                currentLevel: 1,
                currentXp: 0,
                maxXp: 100,
                totalXP: 0,
                photoUrl: firebaseUser.photoURL || '',
                isAnonymous: firebaseUser.isAnonymous,
                lastRewardClaimed: 0
            };
            await setDoc(userRef, newProfile);
            setProfile(newProfile);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                await handleUserProfile(currentUser);
            } else {
                setProfile(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // --- MÉTODOS DE AUTH ---
    const loginWithGoogle = async () => {
        try {
            // CORRECCIÓN ESTRUCTURAL DE TRY/CATCH/IF ANIDADO
            if (auth.currentUser && auth.currentUser.isAnonymous) {
                await linkWithPopup(auth.currentUser, googleProvider);
                if (profile) setProfile({ ...profile, isAnonymous: false });
            } else {
                await signInWithPopup(auth, googleProvider);
            }
        } catch (e: any) {
            console.error(e);
        }
    };

    const linkGoogleAccount = async () => {
        if (auth.currentUser) {
            try {
                await linkWithPopup(auth.currentUser, googleProvider);
                if (profile) setProfile({ ...profile, isAnonymous: false });
            } catch (e) { console.error(e); }
        }
    };

    const loginWithEmail = (e: string, p: string) => signInWithEmailAndPassword(auth, e, p);

    const registerWithEmail = async (e: string, p: string) => {
        if (auth.currentUser && auth.currentUser.isAnonymous) {
            const credential = EmailAuthProvider.credential(e, p);
            await linkWithCredential(auth.currentUser, credential);
            if (profile) setProfile({ ...profile, isAnonymous: false });
        } else {
            await createUserWithEmailAndPassword(auth, e, p);
        }
    };

    const loginAnonymously = () => signInAnonymously(auth);

    const setupRecaptcha = (element: HTMLElement | null) => {
        if (element && !window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, element, { 'size': 'invisible', 'callback': () => { } });
        }
    };

    const loginWithPhone = async (phone: string) => {
        const appVerifier = window.recaptchaVerifier;
        return await signInWithPhoneNumber(auth, phone, appVerifier);
    };

    const logout = async () => {
        await signOut(auth);
        setProfile(null);
    };

    const updateUsername = async (newUsername: string) => {
        if (!user || !profile || !newUsername || newUsername.length < 2) return;

        await updateProfile(user, { displayName: newUsername });

        const userRef = doc(db, "players", user.uid);
        await updateDoc(userRef, { username: newUsername });

        setProfile(prev => prev ? ({ ...prev, username: newUsername }) : null);
    }

    const claimHourlyReward = async (): Promise<boolean> => {
        if (!user || !profile) return false;

        const now = Date.now();
        const lastClaim = profile.lastRewardClaimed || 0;
        const oneHour = 3600 * 1000;

        if (now - lastClaim >= oneHour) {
            const userRef = doc(db, "players", user.uid);
            await updateDoc(userRef, {
                coins: profile.coins + 100,
                lastRewardClaimed: now
            });
            setProfile(prev => prev ? ({ ...prev, coins: prev.coins + 100, lastRewardClaimed: now }) : null);
            return true;
        }
        return false;
    };

    const uploadAvatar = async (file: File) => {
        if (!user) return;
        const storageRef = ref(storage, `avatars/${user.uid}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);

        await updateProfile(user, { photoURL: url });

        const userRef = doc(db, "players", user.uid);
        await updateDoc(userRef, { photoUrl: url });

        setProfile(prev => prev ? ({ ...prev, photoUrl: url }) : null);
    };


    return (
        <AuthContext.Provider value={{
            user, profile, loading,
            loginWithGoogle, linkGoogleAccount, loginWithEmail, registerWithEmail,
            loginAnonymously, setupRecaptcha, loginWithPhone, logout,
            claimHourlyReward, uploadAvatar, updateUsername,
            addSessionXP, getLeaderboardTop10
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth error");
    return context;
};

declare global { interface Window { recaptchaVerifier: any; } }