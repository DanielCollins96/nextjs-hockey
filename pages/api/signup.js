import nextConnect from 'next-connect';
import dbConnect from '../../utils/dbConnect';
import User from '../../models/User';

import {
    hashPassword
} from './util';

export default async function handler(req, res) {
// return res.status(200).json({'hey': 1})
if (req.method === 'POST') {
    try {
        console.log(req.body)
        const { userName, email, password } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email Address Not Sent' })
        }
        email = email.toLowerCase()
        console.log(email)
        existingUser = true;
        // let existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res
                .status(400)
                .json({ message: 'Email Already In Use' });
        }
        const hashedPassword = await hashPassword(password)
        console.log(hashedPassword)
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
            return res
                .status(201)
                .json({ message: 'Successfully Created Account!'})

        })

    } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ message: 'Something went wrong.' });
  } 
}
return res.status(200).json({'hey': 1})
}

