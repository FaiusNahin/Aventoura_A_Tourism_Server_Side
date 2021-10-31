const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Client
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kzofn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('Adventure_Tours');
        const packagesCollecton = database.collection('packages');
        const usePackagesCollecton = database.collection('usePackages');

        // GET & POST For Package
        // GET API
        app.get('/packages', async (req, res) => {
            const cursor = packagesCollecton.find({});
            const packages = await cursor.toArray();
            res.send(packages);
        })

        // GET Single Package
        app.get('/packages/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const packages = await packagesCollecton.findOne(query);
            res.json(packages);
        })

        // POST API
        app.post('/packages', async (req, res) => {
            const package = req.body;
            const result = await packagesCollecton.insertOne(package);
            res.json(result);
        })

        // POST Confirm Orders
        app.post('/confirmPackage', async (req, res) => {
            const confirmOrder = req.body;
            const result = await usePackagesCollecton.insertOne(confirmOrder);
            res.json(result)
        })

        // GET, UPDATE & DELETE For My Booking
        // GET My Booking API
        app.get('/usePackages', async (req, res) => {
            const cursor = usePackagesCollecton.find({});
            const result = await cursor.toArray();
            res.send(result);
        })

        // UPDATE My Booking API Status
        app.put('/usePackages/:id', async (req, res) => {
            const id = req.params.id;
            const updateStatus = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: updateStatus.status
                },
            };
            const result = await usePackagesCollecton.updateOne(filter, updateDoc, options);
            res.json(result);
        })

        // DELETE My Booking API
        app.delete('/usePackages/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await usePackagesCollecton.deleteOne(query);
            res.json(result)
        })

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running Tourism Server');
})

app.listen(port, () => {
    console.log('Server Running On: ', port);
})