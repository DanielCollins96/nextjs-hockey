import { Auth } from 'aws-amplify';
import { useState, createContext, useContext, useEffect } from 'react';


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

    const signUp = async (userInput) => {
        let { email, password } = userInput
        try {
            const { user } = await Auth.signUp({
                username: email,
                password
            })
            return user
        } catch (error) {
            return error
        }
    }

    async function signIn(userInput) {
        let { email, password } = userInput
        try {
            const user = await Auth.signIn(email, password);
            return user
        } catch (error) {
            return error
        }
    }

    const logout = () => {
        Auth.signOut()
            .then((res) => {
                console.log(`logout res: ${res}`);
                setUser(null)
            })
    }



    return (
        <Provider 
            value={{
                user,
                setUser,
                signUp,
                signIn,
                logout
            }}>
            {children}
        </Provider>
    )
}


export {useAuth, AuthProvider, AuthContext}; 