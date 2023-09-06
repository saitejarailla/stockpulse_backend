const { request, response } = require("express");
const express = require("express");
const alertApp = express.Router();
const expressAsyncHandler = require("express-async-handler");

alertApp.use(express.json());

alertApp.post(
"/set-alert",
expressAsyncHandler(async (request, response) => {
    let obj = request.body;
    let alertCollectionObj = request.app.get("alertCollectionObj");
    await alertCollectionObj.insertOne(obj);
    response.send({ message: "alert set successfully" });
})
);

alertApp.get(
    "/get-alert",
    expressAsyncHandler(async (request, response) => {
    let alertCollectionObj = request.app.get("alertCollectionObj");
    let alerts = await alertCollectionObj.find().toArray();
    response.send({ message: "alerts data", payload: alerts });
})
);

module.exports = alertApp;
