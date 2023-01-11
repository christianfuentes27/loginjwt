const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
require('dotenv').config();
var token;

app.use(express.json());

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.TOKEN_SECRET, (err => {
        if (err) return res.sendStatus(403);

        next();
    }));
}

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

app.get('/', function () {
    console.log('hey');
});

app.post("/login", async (req, res) => {
    // create token
    const token = jwt.sign({
        name: req.body.name,
        id: req.body.id
    }, process.env.TOKEN_SECRET);

    res.header('auth-token', token).json({
        error: null,
        data: { token }
    });
});

app.get('/authenticated', authenticateToken, async (req, res) => {
    res.send({ 'message': 'Valid token' });
});

async function login(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return response.json();
}

async function authenticated(url) {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return response.json();
}

async function init() {
    await login("http://localhost:3000/login", {
        name: "Christian",
        id: 1
    }).then(res => {
        token = res.data.token;
    }).catch(res => {
        console.log('Something went wrong');
    });
    console.log("Token: " + token);

    authenticated("http://localhost:3000/authenticated")
    .then(res => {
        console.log(res.message);
    }).catch(res => console.log(res));
}

init();
