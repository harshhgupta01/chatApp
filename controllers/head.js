const express = require("express");
const router = express.Router();

const {
    login
} = require('../models/login')
const {
    Head
} = require('../models/head')
const {
    Agent
} = require('../models/agent');
const {
    AgentMap
} = require("../models/agentmap");

// Relations
Head.hasMany(AgentMap, {
    foreignKey: "head_id",
});
AgentMap.belongsTo(Head, {
    foreignKey: "head_id",
});
Agent.hasMany(AgentMap, {
    foreignKey: "agent_id",
});
AgentMap.belongsTo(Agent, {
    foreignKey: "agent_id",
});

// Login

router.post("/login", async (req, res) => {
    const head_email = req.body.email;
    const head_password = req.body.password;
    Head.findOne({
        where: {
            head_email
        },
    }).then((user) => {
        if (!user) {
            res.json({
                error: "User not found",
            });
        } else {
            if (password === user.head_password) {
                const bearertoken = Math.floor(Math.random() * 10000001);
                login
                    .create({
                        secretkey: user.head_id,
                        bearertoken: bearertoken,
                        category: "head",
                    })
                    .then((login) => {
                        res.json({
                            bearertoken
                        });
                    }).catch(err => {
                        res.json({
                            error: err.message
                        })
                        console.log(err)
                    })
            } else {
                res.json({
                    error: 'Invalid Password'
                })
            }
        }
    }).catch(error => {
        res.json({
            error: error.message
        })
    })
});

router.post("/logout", verifyToken, async (req, res) => {
    const token = req.token;
    login
        .destroy({
            where: {
                bearertoken: token,
            },
        })
        .then((result) => {
            console.log(result);
            res.json({
                message: "successfully logged out",
            });
        })
        .catch((err) => {
            console.log(err);
            res.json({
                error: err.message,
            });
        });
});

router.post('/createAgent', verifyToken, async (req, res) => {
    const head_id = req.head_id;
    const agent_name = req.body.agent_name;
    const agent_email = req.body.agent_email;
    const agent_password = req.body.agent_password;
    const agent_phone = req.body.agent_phone;
    Head.findOne({
        where: {
            head_id
        }
    }).then(result1 => {
        if (result1) {
            Agent.create({
                agent_name,
                agent_email,
                agent_password,
                agent_phone
            }).then(result => {
                const agent_id = result.agent_id;
                AgentMap.create({
                    agent_id,
                    head_id
                }).then(result2 => {
                    res.json({
                        message: 'Agent Created'
                    })
                }).catch(err2 => {
                    res.json({
                        error: err2.message
                    })
                })
            }).catch(err => {
                res.json({
                    error: err.message
                })
                console.log(err)
            })
        } else {
            res.json({
                error: 'Company not found'
            })
        }
    }).catch(err1 => {
        res.json({
            error: err1.message
        })
        console.log(err1)
    })

})

router.get('/viewAgents', verifyToken, async (req, res) => {
    const head_id = req.token;
    AgentMap.findAll({
        include: [{
            model: Agent,
            required: true,
        }, ],
        where: {
            head_id
        }
    }).then(result => {
        if (result.length == 0) {
            res.json({
                error: 'No agents created'
            })
        } else {
            res.json(result)
        }
    }).catch(err => {
        res.json({
            error: err.message
        })
        console.log(err)
    })
})


























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
                    category: "head",
                },
            })
            .then((user) => {
                if (!user) {
                    res.json({
                        error: "invalid token",
                    });
                } else {
                    req.token = user.secretkey;
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