const express = require("express");
const router = express.Router();

const {
    superAdmin
} = require('../models/admin')
const {
    login
} = require('../models/login')
const {
    Head
} = require('../models/head')
const {
    AgentMap
} = require('../models/agentmap');
const {
    Agent
} = require("../models/agent");

// Login

router.post("/login", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    superAdmin.findOne({
        where: {
            email: email
        },
    }).then((user) => {
        if (!user) {
            res.json({
                error: "User not found",
            });
        } else {
            if (password === user.password) {
                const bearertoken = Math.floor(Math.random() * 10000001);
                login
                    .create({
                        secretkey: user.id,
                        bearertoken: bearertoken,
                        category: "admin",
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
            res.json(err.message);
        });
});

router.post('/createAdmin', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    superAdmin.create({
        email,
        password
    }).then(result => {
        res.json({
            message: 'Admin created'
        })
    }).catch(err => {
        res.json({
            error: err.message
        })
        console.log(err)
    })
})

router.post('/createHead', verifyToken, async (req, res) => {
    const company_name = req.body.company_name;
    const head_name = req.body.head_name;
    const head_email = req.body.head_email;
    const head_password = req.body.head_password;
    const service = req.body.service;
    const agentLimit = req.body.agentLimit;
    if (service == 'our' || service == 'self') {
        Head.findOne({
            where: {
                head_email
            }
        }).then(result2 => {
            if (result2) {
                res.json({
                    error: 'Head already exists'
                })
            } else {
                Head.create({
                    company_name,
                    head_name,
                    head_email,
                    head_password,
                    service,
                    agentLimit
                }).then(result => {
                    res.json({
                        message: 'Successfully created'
                    })
                }).catch(err => {
                    res.json({
                        error: err.message
                    })
                    console.log(err)
                })
            }
        }).catch(err2 => {
            res.json({
                error: err2.message
            })
            console.log(err2)
        })
    } else {
        res.json({
            error: 'invalid data'
        })
    }


})

router.get('/viewAllHead', verifyToken, async (req, res) => {
    Head.findAll().then(result => {
        if (result.length == 0) {
            res.json({
                error: 'No companies created yet'
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

router.post('/createAgent', verifyToken, async (req, res) => {
    const agent_name = req.body.agent_name;
    const agent_email = req.body.agent_email;
    const agent_password = req.body.agent_password;
    const agent_phone = req.body.agent_phone;
    Agent.findOne({
        where: {
            agent_email
        }
    }).then(result2 => {
        if (result2) {
            res.json({
                error: 'agent already exists'
            })
        } else {
            Agent.create({
                agent_name,
                agent_email,
                agent_password,
                agent_phone,
                category: 'our'
            }).then(result => {
                res.json({
                    message: 'Agent Created'
                })
            }).catch(err => {
                res.json({
                    error: err.message
                })
                console.log(err)
            })
        }
    }).catch(err2 => {
        res.json({
            error: err2.message
        })
        console.log(err2)
    })

})


router.get('/viewAllAgents', verifyToken, async (req, res) => {
    Agent.findAll({
        where: {
            category: "our"
        }
    }).then(result => {
        if (result.length == 0) {
            res.json({
                error: 'no agents added'
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

router.get('/viewAgents/:head_id', verifyToken, async (req, res) => {
    const head_id = req.params.head_id;
    Head.findOne({
        where: {
            head_id
        }
    }).then(result2 => {
        if (result2) {
            var flag;
            if (result2.service == 'our') {
                flag = 1;
            } else {
                flag = 0
            }
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
                        error: 'No agents created',
                        flag
                    })
                } else {
                    res.json(result, flag)
                }
            }).catch(err => {
                res.json({
                    error: err.message
                })
                console.log(err)
            })
        } else {
            res.json({
                error: 'no such company found'
            })
        }
    }).catch(err2 => {
        res.json({
            error: err2.message
        })
        console.log(err2)
    })

})

router.post('/assignAgent', verifyToken, async (req, res) => {
    const head_id = req.body.head_id;
    const agent_id = req.body.agent_id;
    AgentMap.findOne({
        where: {
            head_id,
            agent_id
        }
    }).then(result => {
        if (result) {
            res.json({
                error: 'Agent already assigned'
            })
        } else {
            AgentMap.create({
                head_id,
                agent_id
            }).then(result2 => {
                res.json({
                    message: 'agent succesfully assigned'
                })
            }).catch(err2 => {
                res.json({
                    error: err2.message
                })
                console.log(err2)
            })
        }
    }).catch(err => {
        res.json({
            error: err.message
        })
        console.log(err.message)
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
                    category: "admin",
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