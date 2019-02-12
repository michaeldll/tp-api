'use strict';

const Events = (sequelize, DataTypes) => {
    return sequelize.define('Events', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        date: {
            type: DataTypes.DATE,
            validate: {notEmpty: {msg: '-> Missing date'}},
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            validate: {notEmpty: {msg: '-> Missing description'}},
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            validate: {notEmpty: {msg: '-> Missing title'}},
            allowNull: false
        }
    });
};

module.exports = Events;