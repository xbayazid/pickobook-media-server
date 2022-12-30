const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

// mongodb 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.b699yx9.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
    try{
        const availablePostCollection =  client.db('pickobookMedia').collection('availablePost');
        const usersCollection = client.db("pickobookMedia").collection("users");

        app.get('/availablePost', async (req, res)=>{
            const query = {}
            const cursor = availablePostCollection.find(query);
            const availablePost = await cursor.toArray();
            res.send(availablePost);
        });
        app.get('/availablePost/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const post = await availablePostCollection.findOne(query);
            res.send(post);
        });
        //add post
        app.post("/availablePost", async (req, res) => {
            const post = req.body;
            const result = await availablePostCollection.insertOne(post);
            res.send(result);
        });

        app.get('/availablePost/:id', async(req, res) =>{
          const id = req.params.id;
          const filter = { _id: ObjectId(id) };
          const result = await availablePostCollection.find(filter).toArray();
          res.send(result);
        })

        app.put("/availablePost/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const post = await availablePostCollection.findOne(filter);
            const react = await post.react;
            const newReact = await react + 1;
            const option = { upsert: true };
            const updatedDoc = {
              $set: {
                react: newReact
              },
            };
            const result = await availablePostCollection.updateOne(
              filter,
              updatedDoc,
              option
            );
            res.send(result);
        });

        app.get('/availablePost/:id/comments', async(req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const post = await availablePostCollection.findOne(filter);
            const comments = await post.comments;
            res.send(comments);
        });

        app.put('/availablePost/:id/comments', async(req, res) => {
          const id = req.params.id;
          const comment = req.body;
          const filter = { _id: ObjectId(id) };
          const post = await availablePostCollection.findOne(filter);
          const comments = post.comments;
          const newComments = [...comments, comment];
          const option = { upsert: true };
            const updatedDoc = {
              $set: {
                comments: newComments
              },
            };
            const result = await availablePostCollection.updateOne(
              filter,
              updatedDoc,
              option
            );
            res.send(result);

        });

        app.post("/users", async (req, res) => {
          const user = req.body;
          console.log("user is called")
          const result = await usersCollection.insertOne(user);
          res.send(result);
        });


        
    }
finally{

}}
run().catch(error => console.error(error));


app.get('/', (req, res)=>{
    res.send('PickoBook server is running');
});

app.listen(port, ()=>console.log(`PickoBook running on ${port}`))