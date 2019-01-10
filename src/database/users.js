'use strict';

const Users = (sequelize, DataTypes) => {
    return sequelize.define('Users', {
        username: {
            type: DataTypes.STRING,
            primaryKey: true,
            validate: {notEmpty: {msg: '-> Missing username'}}
        },
        fullName: {
            type: DataTypes.STRING,
            validate: {notEmpty: {msg: '-> Missing fullname'}},
            allowNull: false
        },
        country: {
            type: DataTypes.STRING,
            validate: {notEmpty: {msg: '-> Missing country'}},
            allowNull: false
        }
    });
};

module.exports = Users;
