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
    function checkCondition(alertCollectionObj) {
      setInterval(async () => {
        try {
            console.log(".")
          const alerts = await alertCollectionObj.find().toArray();
          for (const alert of alerts) {
            for (const stock of stocks) {
              if (
                stock.stock_name === alert.stock &&
                stock.price === alert.price
              ) {
                console.log("Condition met for alert:", alert);
                let temp = alert;
                try {
                  await alertCollectionObj.deleteOne({
                    _id: new ObjectId(alert._id),
                  }); // Use new ObjectId to convert the ID to MongoDB ObjectId
                } catch (error) {
                  console.log("Error deleting alert", error.message);
                }
              }
            }
          }
        } catch (error) {
          console.error("Error checking conditions:", error);
        }
      }, 6000);
    }
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
