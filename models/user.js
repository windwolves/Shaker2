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
        deviceToken: {
            type: DataTypes.STRING(50)
        },
        nickname: {
            type: DataTypes.STRING(50)
        },
        profile: {
            type: DataTypes.TEXT,
        },
        phone: {
            type: DataTypes.INTEGER(11)
        },
        weibo: {
            type: DataTypes.STRING(50)
        },
        wechat: {
            type: DataTypes.STRING(50)
        },
        qq: {
            type: DataTypes.STRING(50)
        },
        openid: {
            type: DataTypes.STRING(50)
        },
        refresh_token: {
            type: DataTypes.STRING(255)
        },
        lastLoginTime: {
            type: DataTypes.DATE
        },
        syncTime: {
            type: DataTypes.DATE
        },
        type: {
            type: DataTypes.STRING(50),
            allowNull: true
        }
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
