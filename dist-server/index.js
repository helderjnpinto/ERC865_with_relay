"use strict";

var express = require("express");

var bodyParser = require("body-parser");

var router = express.Router();
var app = express();

var path = require('path');

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use("/", router);
router.post('/submitMetaTransaction', function (request, response) {
  response.end("asd  2");
});
router.get('/nonce/:address', function (req, res) {
  var address = req.params.address.toLowerCase();
  var nonce = 0;
  res.send({
    address: address,
    nonce: nonce
  });
});
router.get('/', function (req, res) {
  res.end("aaa");
});
app.listen(3333, function () {
  console.log("Started on PORT 3333");
});