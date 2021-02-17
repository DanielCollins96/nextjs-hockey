
export default async function handler(req, res) {
    console.log('inone')
    console.log(req)
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

        return res
                .status(201)
                .json({ message: 'Successfully Created Account!'})

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

