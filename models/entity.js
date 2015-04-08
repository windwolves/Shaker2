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
        content_text: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        content_pic: {
            type: DataTypes.TEXT,
            allowNull: true
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
        },
        type: {
            type: DataTypes.STRING(50),
            allowNull: true
        }
    }, {
        freezeTableName: true,
        classMethods: {
            associate: function(models) {
                Entity.belongsTo(models.Theme, { foreignKey: 'themeId' });
                Entity.belongsTo(models.User, { as: 'Owner', foreignKey: 'ownerId' });

                Entity.hasMany(models.Post, { foreignKey: 'entityId' });

                Entity.belongsToMany(models.Tag, { through: 'entity_tag' });
            }
        }
    });

    return Entity;
}
