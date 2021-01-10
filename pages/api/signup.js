import nextConnect from 'next-connect';
import dbConnect from '../../utils/dbConnect';
import User from '../../models/User';

import {
    hashPassword
} from './util';

if (req.method === 'POST') {
    try {
        const { userName, email, password } = req.body;
        email = email.toLowerCase()
        let user = await User.findOne({ email: email });
        if (user) {
            return res
                .status(400)
                .json({ message: 'Email Already In Use' });
        }
        const hashedPassword = await hashPassword(password)
        const userData = {
            username,
            email,
            password
        };
        const user = new User(userData)
        user.save((err, doc) => {
            if (err) {
                return res
                    .status(400)
                    .json({ message: 'Something Went Wrong' })
            }
            return res.
                .status(201)
                .json({ message: 'Successfully Created Account!'})

        })

    }
}

