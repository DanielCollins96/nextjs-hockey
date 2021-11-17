import Amplify, { API, graphqlOperation, Auth } from 'aws-amplify';
import { UseAuth } from '../contexts/Auth';
import * as queries from '../src/graphql/queries';
import { useQuery } from "react-query";

export default function messages() {

    const { user, setUser } = UseAuth();

    const fetchPosts = async () => {
        console.log('lololol');
        try {
            const result = await API.graphql(graphqlOperation(queries.listPosts, {filter: {userId: {eq: "4311415d-350d-447f-9b2f-acfa20bc7da0"}} }));
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
