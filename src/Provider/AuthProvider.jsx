import { GoogleAuthProvider, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from "firebase/auth";
import { createContext, useEffect, useState } from "react";
import auth from "../firebase/firebase.config";
import useAxiosPublic from "../Hooks/useAxiosPublic";

export const AuthContext = createContext(null)

const AuthProvider = ({ children }) => {
    const axiosPublic = useAxiosPublic()
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    const googleProvider = new GoogleAuthProvider()


    // create user 
    const createUser = (email, password) => {
        setLoading(true)
        return createUserWithEmailAndPassword(auth, email, password)
    }

    // login user
    const login = (email, password) => {
        setLoading(true)
        return signInWithEmailAndPassword(auth, email, password)
    }

    // google login
    const googleLogin = () => {
        setLoading(true)
        return signInWithPopup(auth, googleProvider)
    }
    // update user
    const updateUserProfile = (name, photoUrL) => {
        return updateProfile(auth.currentUser, {
            displayName: name, photoURL: photoUrL
        })
    }
    // logout user
    const logout = () => {
        setLoading(true)
        return signOut(auth)
    }



    useEffect(() => {
        const unSubscribe = onAuthStateChanged(auth, currentUser => {
            console.log("current user", currentUser);
            setUser(currentUser)
            if (currentUser) {
                setLoading(false)
                // done: get token and store client site  
                const userInfo = { email: currentUser.email };

                axiosPublic.post('/jwt', userInfo)
                    .then(res => {
                        if (res.data.token) {
                            localStorage.setItem('access-token', res.data.token)
                        }
                    })
            } else {
                // done: remove token
                localStorage.removeItem('access-token')
            }

            setLoading(false)
        })

        return () => {
            unSubscribe()
        }
    }, [])


    const authInfo = {
        user,
        loading,
        setLoading,
        createUser,
        login,
        googleLogin,
        updateUserProfile,
        logout,
    }

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;