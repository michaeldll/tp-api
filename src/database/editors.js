'use strict';

const Editors = (sequelize, DataTypes) => {
    return sequelize.define('Editors', {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            validate: {notEmpty: {msg: '-> Missing name'}},
            allowNull: false
        }
    });
};

module.exports = Editors;
