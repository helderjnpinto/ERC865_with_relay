const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
const app = express();
var path = require('path');
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.use("/", router);

router.post('/submitMetaTransaction', (request, response) => {
    response.end("asd  2");
});

router.get('/nonce/:address', (req, res) => {
    let address = req.params.address.toLowerCase()
    let nonce = 0;
    res.send({
        address: address,
        nonce: nonce
    })
})

router.get('/', (req, res) => {
    res.end("aaa")
})


app.listen(3333, () => {
    console.log("Started on PORT 3333");
})
