/*  configs  */
const dotenv = require("dotenv"); 
dotenv.config();

const express = require("express");

var bodyParser = require('body-parser')
var app = express()

app.use(bodyParser.json());

// Deploy Config
const DEV_VERISON = true;
const DEV_HOST = '127.0.0.1';
const DEV_PORT = 3000;

const DEPLOY_HOST = '0.0.0.0';
const DEPLOY_PORT = 80;

const PORT = DEV_VERISON ? DEV_PORT : DEPLOY_PORT;
const HOST = DEV_VERISON ? DEV_HOST : DEPLOY_HOST;


// Jexia Config

// const credentials = {
//   projectID: process.env.PROJECT_ID,
//   key: process.env.API_KEY,
//   secret:process.env.API_SECRET
// };


const jexiaSDK = require("jexia-sdk-js/node"); // use require("jexia-sdk-js/browser") for browser
const dataModule = jexiaSDK.dataOperations();
const field = require("jexia-sdk-js").field

// project url: https://033598f1-bb36-489a-98a3-ef7e761db89e.nl00.app.jexia.com
// const credentials = {
//   projectID: "033598f1-bb36-489a-98a3-ef7e761db89e",
//   zone: "nl00",
//   key: "e4ab6923-b9aa-4f91-9e86-2a97b6502888",
//   secret: "V2ChfHwzvg7EzMhj4tt5uao3889JZmP4aIh17DDH7BPYV6naMKByKOhiK/qoI42Zz3NEh/P8L44e9zbI3P3KAw==",
// };

const credentials = {
  projectID: process.env.PROJECT_ID,
  key: process.env.API_KEY,
  secret:process.env.API_SECRET,
  zone: "nl00",
};


jexiaSDK.jexiaClient().init(credentials, dataModule);
///////////////////////////

app.get('/getOrders', async (req, res) => {
  const paramConfirm = req.query.confirmed == undefined ? false : req.query.confirmed;
  const bConfirm = (paramConfirm === 'true') || (paramConfirm === true);

  dataModule
  .dataset("orders")
  .select()
  .where(field('confirmed').isEqualTo())
  .subscribe(
    records => {
      console.log("All Orders:", records);
      res.send(records);
    },
    error => { 
      console.error("Something wrong happened:", error);
      res.send('Error:' + error);
    }
  );
});

app.post('/addOrder', async (req, res) => {
  // console.log('req.body = ', JSON.stringify(req.body));
  // console.log('req.params = ', JSON.stringify(req.params));
  // console.log('req.query = ', JSON.stringify(req.query));
  // console.log('req = ', Object.keys(req));

  const {
    confirmed
  } = req.body;

  if (!confirmed) {
    res.send('Invalid Parameter');
    return;
  }
  try {
    const result = await dataModule
    .dataset("orders")
    // .select()
    .insert([
      {confirmed: confirmed}
    ])
    .subscribe();
    console.log('Insert Result = ', result);
    res.send('Inserted');
  }
  catch(e) {
    res.send('Failed');
  }
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);