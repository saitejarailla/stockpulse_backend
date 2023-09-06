const { request, response } = require("express");
const express = require("express");
const userApp = express.Router();
const expressAsyncHandler = require("express-async-handler");

userApp.use(express.json());


userApp.get("/get-user", expressAsyncHandler(async (request, response) => {
    let userCollectionObj = request.app.get("userCollectionObj");
    let users = await userCollectionObj.find().toArray();
    response.send({ message: "All users", payload: users });
}));



userApp.post("/post-user",expressAsyncHandler( async (request, response) => {
    let obj = request.body;
    let userCollectionObj = request.app.get("userCollectionObj");
    await userCollectionObj.insertOne(obj);
    response.send({ message: "User created successfully" });
}));



module.exports = userApp;