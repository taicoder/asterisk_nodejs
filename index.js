const express = require("express");
const axios = require("axios");
//const timeout = require('connect-timeout')
const app = express();
app.use(express.json());
const sql = require("mssql");
var cors = require("cors");
app.use(cors());
require("dotenv").config();

var client = require("ari-client");
const ip="192.168.43.228";
const url = "http://"+ip+":8088";
const url_aut = "http://asterisk:asterisk@"+ip+":8088";
const username = "asterisk";
const password = "asterisk";

const token = `${username}:${password}`;
const encodedToken = Buffer.from(token).toString("base64");
const session_url = url + "/ari";
const session_url_aut = url_aut + "/ari";

app.listen(3001, () => console.log("asterisk api server is starting..."));

app.post("/endpoints", (req, res) => {
  axios
    .get(session_url + "/endpoints", {
      headers: {
        Authorization: "Basic " + encodedToken,
      },
    })
    .then((result) => {
      res.send(result.data);
    })
    .catch((error) => {
      console.log("loi " + error);
    });
});

const signup = (_username, _password) => {
  axios
    .put(
      session_url_aut +
        "/asterisk/config/dynamic/res_pjsip/endpoint/" +
      _username,
      {
        fields: [
          { attribute: "type", value: "endpoint" },
          { attribute: "from_user", value: _username },
          { attribute: "allow", value: "!all,g722,ulaw,alaw" },
          { attribute: "ice_support", value: "yes" },
          {
            attribute: "callerid",
            value: '"' + _username + '" <' + _username + ">",
          },
          { attribute: "force_rport", value: "yes" },
          { attribute: "rewrite_contact", value: "yes" },
          { attribute: "rtp_symmetric", value: "yes" },
          { attribute: "context", "value": "default" },
          { attribute: "auth", "value": _password },
          { attribute: "aors", "value": _password },
          {
            attribute: "record_on_feature",
            value: "apprecord",
          },
          {
            attribute: "cos_audio",
            value: "5",
          },
          {
            attribute: "context",
            value: "from-internal",
          },
          {
            attribute: "tos_video",
            value: "136",
          },
          {
            attribute: "rtp_timeout_hold",
            value: "300",
          },
          {
            attribute: "rtp_timeout",
            value: "30",
          },
          {
            attribute: "record_off_feature",
            value: "apprecord",
          },
          {
            attribute: "language",
            value: "en",
          },
          {
            attribute: "cos_video",
            value: "4",
          },
          {
            attribute: "ice_support",
            value: "false",
          },
          {
            attribute: "one_touch_recording",
            value: "true",
          },
          {
            attribute: "allow",
            value: "(ulaw|alaw|gsm|g726|g722)",
          },
          {
            attribute: "tos_audio",
            value: "184",
          },
          {
            attribute: "from_user",
            value: "2",
          },
          {
            attribute: "auth",
            value: "1234567",
          },
          {
            attribute: "send_pai",
            value: "true",
          },
        ],
      }
    )
    .then((result) => {
    // console.log(result)
    })
    .catch((error) => {
      console.log("loi " + error);
    });
};

app.post("/signup",  (req, res) => {
   axios
    .get(session_url + "/endpoints", {
      headers: {
        Authorization: "Basic " + encodedToken,
      },
    })
    .then((result) => {
     const s= result.data.filter(x=>x.resource===req.body.username)
      if(s.length>0)  res.send("1")
      else {
        signup(req.body.username,req.body.password);
        res.send("0")
      }
    })
    .catch((error) => {
      console.log("loi " + error);
    });
});


app.post("/delete", (req, res) => {
 try{
  axios
  .delete(session_url_aut + "/asterisk/config/dynamic/res_pjsip/endpoint/"+req.body.username)
  .then((result) => {
    res.send('1');
  })
  .catch((error) => {
    res.send('0')
  });
  res.send('1')
 }catch(err){
  res.send('0')
 }
});

app.post("/sendmessage", (req, res) => {
  axios
    .put(
      session_url + "/endpoints/pjsip/"+req.body.to+"/sendMessage",
      {
        from: req.body.from,
        body: req.body.message,
      },
      {
        headers: {
          Authorization: "Basic " + encodedToken,
        },
      }
    )
    .then((result) => {
     // console.log(result);
    })
    .catch((error) => {
      console.log("loi " + error);
    });
});

app.post("/call", (req, res) => {
  axios
    .post(
      session_url_aut + "/channels",
      {
        "endpoint":"PJSIP/"+req.body.to,
        "extension":req.body.from,
        "context":"from-internal",
        "priority":"1",
        "callerId":req.body.from
      }
    )
    .then((result) => {
     // console.log(result);
    })
    .catch((error) => {
      console.log("loi " + error);
    });
});











app.get("/demo", (req, res) => {
  // axios
  //   .post("http://192.168.43.228:8088/ari/channels",
  //   {

  //     "endpoint":"PJSIP/1005",
  //     "extension":"1007",
  //     "context":"from-internal",
  //     "priority":"1",
  //     "callerId":"PJSIP/1005"

  //   },
  //   {
  //     headers: {
  //       Authorization: "Basic " + encodedToken,
  //     },
  //   })
  //   .then((result) => {
  //     console.log(result);
  //   })
  //   .catch((error) => {
  //     console.log("loi " + error);
  //   });
  client
    .connect(url, username, password)
    .then(function (ari) {
      var channel = ari.Channel();
      channel.on("StasisStart", function (event, channel) {});
      channel.on("ChannelDtmfReceived", function (event, channel) {});
      channel.originate(
        {
          extension: "PJSIP/1005",
          endpoint: "PJSIP/1007",
          app: "application",
          appArgs: "dialed",
        },
        function (err, channel) {
          console.log(channel);
        }
      );
    })
    .catch(function (err) {
      console.log(err);
    });
});


