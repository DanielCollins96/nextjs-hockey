import nextConnect from 'next-connect';
import dbConnect from '../../utils/dbConnect';
import User from '../../models/User';

import {
    hashPassword
} from './util';

export default async function handler(req, res) {
    console.log('inone')
    console.log(req)
    await dbConnect();
// return res.status(200).json({'hey': 1})
if (req.method === 'POST') {
    try {
        console.log(req.body)
        console.log(Object.keys(req.body))
        // console.log(Object.keys(req))
        let { userName, email, password } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email Address Not Sent' })
        }
        email = email.toLowerCase()
        console.log(User)
        // existingUser = true;
        let existingUser = await User.findOne({ email: email });
        console.log(existingUser)
        if (existingUser) {
            return res
                .status(400)
                .json({ message: 'Email Already In Use' });
        }
        const hashedPassword = await hashPassword(password)
        console.log(hashedPassword)
        let userData = {
            username: userName,
            email,
            password
        };
        // password: hashedPassword
        const user = new User(userData)
        user.save((err, doc) => {
            console.log('here doc', doc)
            console.log('here', err)
            if (err) {
                return res
                    .status(400)
                    .json({ message: 'Something Went Wrong create' })
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
else {
    return res.status(269).end()
}
}

