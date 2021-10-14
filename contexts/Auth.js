import { Auth } from 'aws-amplify';
import { useState, createContext, useContext, useEffect } from 'react';
import { AuthState, onAuthUIStateChange } from '@aws-amplify/ui-components';

const AuthContext = createContext();

const { Provider } = AuthContext;

function useAuth() {
    return useContext(AuthContext);
}

function AuthProvider({children}) {
    const [authState, setAuthState] = useState();
    const [user, setUser] = useState();
    
    useEffect(() => {
        // checkUser()
        return onAuthUIStateChange((nextAuthState, authData) => {
            setAuthState(nextAuthState);
            console.log('in Auth')
            setUser(authData)
        });

      }, [])



      async function checkUser() {
        console.log('checking user...')
        try {
            const guy = await Auth.currentAuthenticatedUser()
            console.log(`Good: ${guy}`)
            setUser(guy)
        } catch(err) {
            console.log(`error: ${err}`)
            setUser(null);
        }
      };


    return (
        <Provider 
            value={{
                user,
                setUser
            }}>
            {children}
        </Provider>
    )
}


export {useAuth, AuthProvider, AuthContext}; 