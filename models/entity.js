module.exports = function(sequelize, DataTypes) {
    var Entity = sequelize.define('Entity', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        title: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT,
            defaultValue: ''
        },
        type: {
            type: DataTypes.STRING(50),
            defaultValue: ''
        },
        postLimit: {
            type: DataTypes.INTEGER(11),
            defaultValue: 0
        },
        recommend: {
            type: DataTypes.INTEGER(11),
            defaultValue: 0
        },
        likeCount: {
            type: DataTypes.INTEGER(11),
            defaultValue: 0
        }
    }, {
        freezeTableName: true,
        classMethods: {
            associate: function(models) {
                Entity.belongsTo(models.Theme, { foreignKey: 'themeId' });
                Entity.belongsTo(models.User, { as: 'Owner', foreignKey: 'ownerId' });

                Entity.hasMany(models.Post, { foreignKey: 'entityId' });
            }
        }
    });

    return Entity;
}
