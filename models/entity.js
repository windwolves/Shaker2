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
            allowNull: true
        },
        type: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
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
