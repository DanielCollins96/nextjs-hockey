import nextConnect from 'next-connect';
import dbConnect from '../../utils/dbConnect';
import {
    hashPassword
} from './util';

if (req.method === 'POST') {
    try {
        const { userName, email, password } = req.body;
        const hashedPassword = await hashPassword(password)
        
    }
}

