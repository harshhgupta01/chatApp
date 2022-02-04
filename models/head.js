const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Head = sequelize.define('head', {
    head_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
        validate: {
            notEmpty: true
        }
    },
    company_name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    head_name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    head_email: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            isEmail: true
        }
    },
    head_password: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    service: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    agentLimit: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: '4',
        validate: {
            notEmpty: true
        }
    }

});

module.exports = {
    Head
};