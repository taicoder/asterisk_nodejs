const express = require('express');
const axios =require('axios');
//const timeout = require('connect-timeout')
const app = express();
app.use(express.json());
const sql = require('mssql');
var cors = require('cors');
app.use(cors());
require('dotenv').config();

const username = 'nhom7';
const password = '123456';

const token = `${username}:${password}`;
const encodedToken = Buffer.from(token).toString('base64');
const session_url = 'http://192.168.1.123:8088/ari';

app.listen(3001, () => console.log('asterisk api server is starting...'));

app.post('/endpoints', (req, res) => {
	axios.get(session_url+'/endpoints', {
        headers: { 
            "Authorization": 'Basic '+ encodedToken
         }
      })
      .then((result) => {
        res.send(result.data)
      })
      .catch((error) => {
        console.error("loi "+ error)
      })
});
