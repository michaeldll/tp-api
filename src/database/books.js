'use strict';

const Books = (sequelize, DataTypes) => {
    return sequelize.define('Books', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        bookRef: {
            type: DataTypes.INTEGER,
            validate: {notEmpty: {msg: '-> Missing book reference'}},
            allowNull: false
        },
        publicationYear: {
            type: DataTypes.DATE,
            validate: {notEmpty: {msg: '-> Missing publication year'}},
            allowNull: false
        },
        price: {
            type: DataTypes.FLOAT,
            validate: {notEmpty: {msg: '-> Missing price'}},
            allowNull: false
        },
        summary: {
            type: DataTypes.STRING,
            allowNull: true
        },
        editorWord: {
            type: DataTypes.STRING,
            allowNull: true
        },
        bookSellerWord: {
            type: DataTypes.STRING,
            allowNull: true
        },
        details: {
            type: DataTypes.JSON,
            allowNull: true
        }
    });
};

module.exports = Books;