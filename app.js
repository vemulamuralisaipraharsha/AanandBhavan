//jshint esversion:6
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import validator from 'email-validator';
import multer from 'multer';
import dotenv from 'dotenv';
import mysql from 'mysql2';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.text());
app.use(express.json());

// Router routes
import contact from './api/routers/contactrouter.js';
import agentproperty from './api/routers/agentpropertyrouter.js';
import * as agentPropertyController from './api/controllers/agentpropertycontroller.js';

// Global variables
let loginData;
let agentData;
let propertyData;
let duplicate;
let slider;
let count = 0;

// DB code
const dbConfig = {
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database
};

function executeQueryAndCloseConnection(query, res, route) {
  const con = mysql.createConnection(dbConfig);
  con.connect((err) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      res.status(500).json({ error: 'An error occurred while connecting to the database.' });
      return;
    }
    con.query(query, (err, results) => {
      con.end((err) => {
        if (err) {
          console.error('Error closing the database connection:', err);
        }
        if (err) {
          console.error('Error executing the query:', err);
          res.status(500).json({ error: 'An error occurred while executing the database query.' });
          return;
        }
        //checking where to store results
        if (route === 'property') {
          if (count === 0) {
            propertyData = results;
            duplicate = results;
            count = count + 1;
          } else {
            propertyData = results;
          }
        }
      });
    });
  });
}

// end of db code
app.get('/', (req, res) => {
  res.render('main');
  const query = 'select * from property where current_status = \'Yes\'';
  executeQueryAndCloseConnection(query, res, 'property');
});

app.get('/login', (req, res) => {
  res.render('home');
});

app.post('/login', (req, res) => {
  loginData = JSON.parse(req.body);
  if (loginData.logging === 'agent') {
    const email = loginData.email;
    const con = mysql.createConnection(dbConfig);
    con.connect((err) => {
      if (err) {
        console.error('Error connecting to the database:', err);
        res.status(500).json({ error: 'An error occurred while connecting to the database.' });
        return;
      }
      con.query('SELECT * FROM agent WHERE email = ?', [email], (err, results) => {
        con.end((err) => {
          if (err) {
            console.error('Error closing the database connection:', err);
          }
          if (err) {
            console.error('Error executing the query:', err);
            res.status(500).json({ error: 'An error occurred while executing the database query.' });
            return;
          }
          agentData = results;
          if (agentData.length === 0 || loginData.password !== agentData[0].password) {
            loginData.result = 'nodata';
          } else {
            loginData.result = 'datafound';
          }
          res.status(200).json(loginData);
        });
      });
    });
  } else {
    res.status(200).json(loginData);
  }
});

// ... (continue with the rest of the code)


app.get("/login/agent", (req, res) => {
  const con = mysql.createConnection(dbConfig);
  con.connect(function (err) {
    if (err) {
      console.error("Error connecting to the database:", err);
      res.status(500).json({ error: "An error occurred while connecting to the database." });
      return;
    }
    con.query("SELECT * FROM agent WHERE agent_id = ?", [agentData[0].agent_id], function (err, results) {
      con.end(function (err) {
        if (err) {
          console.error("Error closing the database connection:", err);
        }
        if (err) {
          console.error("Error executing the query:", err);
          res.status(500).json({ error: "An error occurred while executing the database query." });
          return;
        }
        agentData = results;
        res.render("agent", { agent_data: agentData });
        let id_data = agentData[0].agent_id;
        agentPropertyController.setData(id_data);
      });
    });
  });
});

app.post('/login/agent' , (req , res)=>{
  var received_data = req.body;
  var flag = validator.validate(received_data['email']);
  let result = {};
  if(received_data['phone_number'] != '' && received_data['phone_number'].length != 10){
    result['wrong'] = 'phone';
    res.status(200).json(result);
  }else if(received_data['email'] != '' && flag != true){
      res.status(200).json(result);
  }else{
    const entries = Object.entries(received_data);
    received_data['agent_id'] = agentData[0].agent_id;
    // db con
    const con = mysql.createConnection(dbConfig);
    var query = "update agent set ";
    result = 1;
    entries.forEach(([key, value]) => {
      if(value != ''){
        if(result === 1){
          query = query + "" +key+" = '" +value +"' ";
          result = 0;
        }else{
          query = query +", "+ key + " = '" +value+"' ";
        }
      }
    });
    flag = " where agent_id = " + received_data['agent_id'] + ';';
    var execute = query + flag;
    // execute code
    con.connect(function(err) {
      if (err) {
        // Handle connection error
        console.error("Error connecting to the database:", err);
        res.status(500).json({ error: "An error occurred while connecting to the database." });
        return;
      }
      con.query(execute, function (err, result) {
        if (err) {
          // Handle query error
          console.error("Error executing the query:", err);
          res.status(500).json({ error: "An error occurred while executing the query." });
          return;
        }
        res.json({ result: 'success' });
        con.end(function(err) {
          if (err) {console.error("Error closing the database connection:", err);}
        });
      });
    });
  }
});

app.get('/property', (req, res) => {
  res.render("property" , {property_data:propertyData});
});

app.post("/property/max",(req,res)=>{
  const slider_data = JSON.parse(req.body)["slider_data_key"];
  slider = slider_data;
});

app.use(bodyParser.urlencoded({extended: true}));
app.post("/property" , (req,res)=>{
  var flag = 0;
  try{
    let filter_data = req.body;
    let array = [];
    const keys = Object.keys(filter_data);
    const values = Object.values(filter_data); 
    var i;
    for(i = 0 ; i < keys.length ; i++){
      if(values[i] != ''){
        if(keys[i] != 'sq_feet' && keys[i] != 'no_of_bedrooms' && keys[i] != 'min-sq-feet'){
            var amp = keys[i]+" = "+"'"+values[i]+"'";
            array.push(amp);
        }else{
          if(keys[i] === 'min-sq-feet'){
            var amp = "sq_feet"+" > "+values[i];
            array.push(amp);
          }
          else if(keys[i] === 'sq_feet'){
            var amp = "sq_feet"+" <= "+values[i];
            array.push(amp);
          }else{
          var amp = keys[i]+" = "+values[i];
          array.push(amp);
          }
        }
      }
    }
    let query = `SELECT * FROM property INNER JOIN agent ON property.agent_id = agent.agent_id WHERE `;
    for(i = 0 ; i < array.length ; i++){
      if(i === 0){
        query = query.concat(array[i]);
      }else{query = query.concat(" and " , array[i]);}
    }
    if(slider != " " && array.length === 0){
      var toto = "rent_sell_price "+"< "+slider; 
      query = query.concat(toto);
    }else if(slider != " " && array.length != 0){
      var toto = " and "+"rent_sell_price "+"< "+slider;
      query = query.concat(toto);
    }else if(slider === 0 && array.length === 0){
      res.render("property" , {property_data: duplicate});
      flag = 1;
    }
    query = query.concat(";");
    if(flag === 0){
      try{
        executeQueryAndCloseConnection(query, res , "property");
        setTimeout(function(){
          res.render("property" , {property_data:propertyData});
        },200);
      }catch(err){
        console.log("some error occured in database!!");
        res.render("/");
      }
    }else{
    }
  }catch(err){res.render("/");}
});


// contact
app.use(contact);
// agentproperty
app.use(agentproperty);


app.listen(process.env.port, function() {
  console.log( `Server started on port ${process.env.port}`);
});
