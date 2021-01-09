import axios from 'axios';

const publicFetch = axios.create({
    baseURL: process.env.NEXT_API_URL
});


export { publicFetch };
