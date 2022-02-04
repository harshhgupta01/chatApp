const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Session = sequelize.define("session", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    socket: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    connections: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: '0',
        validate: {
            notEmpty: true
        }
    }
});

module.exports = {
    Session,
};