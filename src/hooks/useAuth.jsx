import { useState, useEffect, createContext, useContext } from 'react';
import { auth, db } from '../services/firebase';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    createUserWithEmailAndPassword,
    sendEmailVerification
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeDoc = null;

        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            if (unsubscribeDoc) {
                unsubscribeDoc();
                unsubscribeDoc = null;
            }

            if (currentUser) {
                // Initial fetch of profile
                const fetchProfile = async () => {
                    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                    const userData = userDoc.exists() ? userDoc.data() : null;

                    // Create a combined object that preserves all Firebase User properties
                    // by using a proxy or just attaching properties to the original object
                    // We'll create a new object but copy enumerable properties carefully
                    const enhancedUser = {
                        ...currentUser,
                        uid: currentUser.uid,
                        email: currentUser.email,
                        emailVerified: currentUser.emailVerified,
                        isApproved: userData?.isApproved || false,
                        role: userData?.role || 'user',
                        // Add a reload function directly to the user object 
                        // as a convenience, although we provide it in the context too
                    };

                    setUser(enhancedUser);
                };

                await fetchProfile();

                // Listen for changes (real-time approval)
                unsubscribeDoc = onSnapshot(doc(db, 'users', currentUser.uid), (snapshot) => {
                    if (snapshot.exists()) {
                        const data = snapshot.data();
                        setUser(prev => {
                            if (!prev) return prev;
                            return {
                                ...prev,
                                isApproved: data.isApproved || false,
                                role: data.role || 'user'
                            };
                        });
                    }
                });

                setLoading(false);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeDoc) unsubscribeDoc();
        };
    }, []);

    const reloadUser = async () => {
        if (auth.currentUser) {
            await auth.currentUser.reload();
            const currentUser = auth.currentUser;

            // Re-fetch firestore data too
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            const userData = userDoc.exists() ? userDoc.data() : null;

            setUser({
                ...currentUser,
                uid: currentUser.uid,
                email: currentUser.email,
                emailVerified: currentUser.emailVerified,
                isApproved: userData?.isApproved || false,
                role: userData?.role || 'user'
            });
        }
    };

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const register = async (email, password) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create Firestore document
        await setDoc(doc(db, 'users', user.uid), {
            email: email,
            isApproved: false,
            role: 'user',
            createdAt: new Date()
        });

        // Send verification email
        await sendEmailVerification(user);

        return userCredential;
    };

    const logout = () => {
        return signOut(auth);
    };

    const value = {
        user,
        login,
        register,
        logout,
        reloadUser,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
