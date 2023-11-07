const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')

const app = express();
const port = process.env.PORT || 5000;


app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.otrke0o.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

        // verifyToken
        const verifyToken = async (req, res, next) => {
            const token = req.cookies?.token;
            console.log('value of token in middleware:', token)
            if (!token) {
                return res.status(401).send({ massage: 'not authorized' })
            }
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {

                if (err) {
                    console.log(err)
                    return res.status(401).send({ massage: 'unauthorized' })
                }
                console.log('value in the token', decoded)
                req.user = decoded;
                next()
            })

        }




async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const jobCollection = client.db('jobtexDB').collection('job');






    // auth related api
        app.post('/user', async (req, res,) => {
            const user = req.body;
            console.log(user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res
                .cookie('token', token, {
                    httpOnly: true,
                    secure: false,
                })
                .send({ success: true })
        })




        // Jbo post api
        app.post('/jobPosts', async (req, res) => {
            const jobs = req.body;
            console.log(jobs);
            const result = await jobCollection.insertOne(jobs);
            res.send(result);
        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('SERVER IS RUNNING!');
});


app.listen(port, () => {
    console.log(`Assignment 11 Server is running on port ${port}`);
})
