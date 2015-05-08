module.exports = function(sequelize, DataTypes) {
    var Card = sequelize.define('Card', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING(256),
            allowNull: true
        },
        contents: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        pictures: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        index: {
            type: DataTypes.INTEGER(11),
            defaultValue: 0
        }
    }, {
        freezeTableName: true,
        classMethods: {
            associate: function(models) {
                Card.belongsTo(models.Post, { foreignKey: 'postId' });
                Card.belongsTo(models.Layout, { foreignKey: 'layoutId' });
                Card.belongsTo(models.Skin, { foreignKey: 'skinId' });
            }
        }
    });

    return Card;
}
