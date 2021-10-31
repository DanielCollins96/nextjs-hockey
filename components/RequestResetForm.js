import { Auth } from 'aws-amplify';


export default function RequestResetForm(props) {

    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async event => {
        event.preventDefault();
        Auth.forgotPassword(username)
            .then(data => console.log(data))
            .catch(err => console.log(err));
    }

    return (
        <div className="">

        </div>
    )
}