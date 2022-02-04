const express = require("express");
const router = express.Router();

const {
    login
} = require('../models/login')
const {
    Head
} = require('../models/head')














function randomName(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function verifyToken(req, res, next) {
    // Check if bearer is undefined
    const category = req.body.category;
    if (
        req.headers.authorization &&
        req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
        const token = req.headers.authorization.split(" ")[1];

        login
            .findOne({
                where: {
                    bearertoken: token,
                    category: "agent",
                },
            })
            .then((user) => {
                if (!user) {
                    res.json({
                        error: "invalid token",
                    });
                } else {
                    req.token = token;
                    next();
                }
            })
            .catch((err) => {
                res.json(err.message);
            });
    } else {
        // Forbidden
        res.json({
            error: "Bearer Token is not found",
        });
    }
}

module.exports = router;