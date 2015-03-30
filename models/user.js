module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define('User', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        username: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        type: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        deviceToken: {
            type: DataTypes.STRING(50)
        },
        nickname: {
            type: DataTypes.STRING(50)
        },
        profile: {
            type: DataTypes.TEXT,
        },
        telphone: {
            type: DataTypes.INTEGER(11)
        },
        lastLoginTime: {
            type: DataTypes.DATE
        },
        syncTime: {
            type: DataTypes.DATE
        },
    }, {
        freezeTableName: true,
        classMethods: {
            associate: function(models) {
                User.hasMany(models.Entity, { foreignKey: 'ownerId' });
                User.hasMany(models.Post, { foreignKey: 'ownerId' });
                User.hasMany(models.Suggestion, { foreignKey: 'senderId' });
            }
        }
    });

    return User;
}
