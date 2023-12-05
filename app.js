require("dotenv").config();
const cors = require("cors");
const express = require("express"); // Changed "exp" to "express" for clarity
const { ObjectId } = require("mongodb");
const app = express();
const axios = require("axios");
const unirest = require("unirest");
const emailjs = require("@emailjs/browser")
const cheerio = require("cheerio"); // Add this line to import the Cheerio library
const expressAsyncHandler = require("express-async-handler");
const PORT = process.env.PORT || 4000;
let DBurl = process.env.DBurl;
let mclient = require("mongodb").MongoClient;
mailer = require('nodemailer');
let stocks = [];

var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'stockalerter08@gmail.com',
    pass: 'lqag ddsq fwmq ucem'
  }
});

var mailOptions = {
  from: 'stockalerter08@gmail.com',
  to: 'saitejarailla1@gmail.com',
  subject: 'hello',
  text: `hi`
};





const getFinanceData = async () => {
  const url = "https://www.google.com/finance/markets/most-active?hl=en";
  try {
    const response = await unirest.get(url).header({
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
    });
    const $ = cheerio.load(response.body);
    $(".e1AOyf , .SxcTic").each((i, el) => {
      stocks.push({
        stock_name: $(el).find(".ZvmM7").text(),
        price: parseInt($(el).find(".YMlKec").text().replace(/[₹,]/g, ""), 10),
      });
    });
    // console.log(stocks);
  } catch (error) {
    console.error("Error:", error);
  }
};
//runs every minute
setInterval(getFinanceData, 6000);



function checkCondition(alertCollectionObj) {
  setInterval(async () => {
    try {
      // console.log(stocks)
      const alerts = await alertCollectionObj.find().toArray();
      for (const alert of alerts) {
        // console.log(".")
        for (const stock of stocks) {
          // console.log(stock)
          //checking for condition
          console.log('.')
          if (stock.stock_name === alert.stock && stock.price === alert.price) {
            console.log("Condition met for alert:", alert);
            //deleting the object from DB after alerting the user
            let temp = alert;
            try {
              await alertCollectionObj.deleteOne({
                _id: new ObjectId(alert._id),
              });
            } catch (error) {
              console.log("Error deleting alert", error.message);
            }
            //code for alerting the user
            transporter.sendMail(mailOptions, function(error, info){
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent: ' + info.response);
              }
            });

            
          }
        }
      }
    } catch (error) {
      console.error("Error checking conditions:", error);
    }
  }, 6000); 
}

app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

mclient
  .connect(DBurl)
  .then((client) => {
    //accessing databse object
    let dbobj = client.db("stockpulse");
    // creating collection
    let userCollectionObj = dbobj.collection("users");
    let alertCollectionObj = dbobj.collection("alerts");
    //sharing collection to api's
    app.set("userCollectionObj", userCollectionObj);
    app.set("alertCollectionObj", alertCollectionObj);
    console.log("DB connection success");
    checkCondition(alertCollectionObj);
  })
  .catch((error) => {
    console.log("Error in DB connection:", error);
  });

// importing apis
const userApp = require("./APIS/userApi");
const alertApp = require("./APIS/alertApi");
app.use(express.json());
//middleware using path
app.use("/users", userApp);
app.use("/alerts", alertApp);


// middleware to handle invalid path error
app.use((request, response, next) => {
  response.send({ message: `invalid path ${request.url}` });
});
// middleware to handle errors
app.use((error, request, response, next) => {
  response.send({ message: "Error Occured", reason: `${error.message}` });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
