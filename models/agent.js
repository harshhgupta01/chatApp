const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Agent = sequelize.define('agent', {
    agent_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
        validate: {
            notEmpty: true
        }
    },
    agent_name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    agent_email: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            isEmail: true
        }
    },
    agent_password: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    agent_phone: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            is: /^(\+91[\-\s]?)?[0]?(91)?[56789]\d{9}$/,
        },
    },
    category: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }

});

module.exports = {
    Agent
};