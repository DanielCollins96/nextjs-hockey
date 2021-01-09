import mongoose from 'mongoose'
import {
    hashPassword,
    verifyPassword
} from '../pages/api/util'

const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    firstName: String,
    lastName: String,
    password: String
},
{timestamps: true});

UserSchema.methods.setPassword = (password) => {
    const newPass = await hashPassword(password);
    this.password = newPass;
}

mongoose.model('User', UserSchema);


