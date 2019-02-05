'use strict';

const Editors = (sequelize, DataTypes) => {
    return sequelize.define('Editors', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            validate: {notEmpty: {msg: '-> Missing name'}},
            unique: true
        }
    });
};

module.exports = Editors;
