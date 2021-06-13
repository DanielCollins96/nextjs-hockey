import { Auth } from 'aws-amplify';
import { useState, createContext, useContext, useEffect } from 'react';
import { AuthState, onAuthUIStateChange } from '@aws-amplify/ui-components';
import { supabase } from '../api'

const AuthContext = createContext();

const { Provider } = AuthContext;

function useAuth() {
    return useContext(AuthContext);
}

function AuthProvider({children}) {
    const [user, setUser] = useState(null);
    console.log(user);
    useEffect(() => {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async () => checkUser()
      )
      checkUser()
      return () => {
        authListener?.unsubscribe()
      };
    }, [])

    async function checkUser() {
      const user = supabase.auth.user()
      setUser(user)
    }
    // const [authState, setAuthState] = useState();
    // const [user, setUser] = useState();
    // useEffect(() => {
    //     // checkUser()
    //     return onAuthUIStateChange((nextAuthState, authData) => {
    //         setAuthState(nextAuthState);
    //         console.log('in Auth')
    //         setUser(authData)
    //     });

    //   }, [])



    //   async function checkUser() {
    //     console.log('checking user...')
    //     try {
    //         const guy = await Auth.currentAuthenticatedUser()
    //         console.log(`Good: ${guy}`)
    //         setUser(guy)
    //     } catch(err) {
    //         console.log(`error: ${err}`)
    //         setUser(null);
    //     }
    //   };


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