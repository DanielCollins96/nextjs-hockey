import mongoose from 'mongoose'
import {
    hashPassword,
    verifyPassword
} from '../pages/api/util'

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
})
// {timestamps: true});

// UserSchema.methods.setPassword = (password) => {
//     const newPass = await hashPassword(password);
//     this.password = newPass;
// }

export default mongoose.model('User', UserSchema);


