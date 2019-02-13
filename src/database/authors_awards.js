'use strict';

const AuthorsAwards = (sequelize, DataTypes) => {
    return sequelize.define('AuthorsAwards', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }
    });
};

module.exports = AuthorsAwards;