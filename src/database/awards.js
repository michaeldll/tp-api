'use strict';

const Awards = (sequelize, DataTypes) => {
    return sequelize.define('Awards', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            primaryKey: false,
            validate: {notEmpty: {msg: '-> Missing name'}}
        }
    });
};

module.exports = Awards;
