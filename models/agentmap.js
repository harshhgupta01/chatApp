const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const AgentMap = sequelize.define('agentmap', {
    agent_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    head_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },


});

module.exports = {
    AgentMap
};