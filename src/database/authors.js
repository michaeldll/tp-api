'use strict';

const Authors = (sequelize, DataTypes) => {
    return sequelize.define('Authors', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        lastName: {
            type: DataTypes.STRING,
            validate: {notEmpty: {msg: '-> Missing last name'}},
            allowNull: false
        },
        firstName: {
            type: DataTypes.STRING,
            validate: {notEmpty: {msg: '-> Missing first name'}},
            allowNull: false
        },
        biography: {
            type: DataTypes.STRING,
            allowNull: true
        }
    });
};

module.exports = Authors;
