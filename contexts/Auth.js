import { Auth } from 'aws-amplify';
import { useState, createContext, useContext, useEffect } from 'react';
import { AuthState, onAuthUIStateChange } from '@aws-amplify/ui-components';

const AuthContext = createContext();

const { Provider } = AuthContext;

function useAuth() {
    return useContext(AuthContext);
}

function AuthProvider({children}) {

    const [user, setUser] = useState();
    
    useEffect(() => {
        Auth.currentAuthenticatedUser()
        .then(user => {
            console.log(`user success ${user}`);
            console.log(user);
            setUser(user)
        })
        .catch((error) => {
            console.log({error});
            setUser(null)
        })
      }, [])

    const logout = () => {
        Auth.signOut()
            .then((res) => {
                console.log('fuckckckckk');
                setUser(null)
            })
    }

    return (
        <Provider 
            value={{
                user,
                setUser,
                logout
            }}>
            {children}
        </Provider>
    )
}


export {useAuth, AuthProvider, AuthContext}; 