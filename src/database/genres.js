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
            unique: true,
            validate: {notEmpty: {msg: '-> Missing name'}}
        }
    });
};

module.exports = Genres;
