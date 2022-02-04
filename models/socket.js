const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Socket = sequelize.define("socket", {
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
  }

});

module.exports = {
  Socket,
};