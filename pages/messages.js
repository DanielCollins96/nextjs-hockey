import Amplify, { API, graphqlOperation, Auth } from 'aws-amplify';
import { useAuth } from '../contexts/Auth';
import * as queries from '../src/graphql/queries';
import { useQuery } from "react-query";

export default function messages() {

    const { user, setUser } = useAuth();

    const fetchPosts = async () => {

        try {
            const result = await API.graphql(graphqlOperation(queries.listPosts, { id: user.username }));
            console.log(result);
            return result
        } catch (err) {
            console.log({err});
            console.log('LOL');
        }
      }
      
      // const { data, isLoading, isError, error: userQueryError, status } = useQuery(`user - ${user?.username}`, fetchPosts, {enabled: !!user});
    //   const response = useQuery(`messages - ${user?.username}`, fetchPosts, {enabled: !!user});
    //   console.log({response});
    return (
        <div>
            Messages
            <button onClick={fetchPosts}>Get Posts</button>
        </div>
    )
}
