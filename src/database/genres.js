'use strict';

const Genres = (sequelize, DataTypes) => {
    return sequelize.define('Genres', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            validate: {notEmpty: {msg: '-> Missing name'}},
            unique: true,
            allowNull: false
        }
    });
};

module.exports = Genres;
