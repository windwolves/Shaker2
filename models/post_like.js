module.exports = function(sequelize, DataTypes) {
    var PostLike = sequelize.define('Post_Like', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
    }, {
        freezeTableName: true,
        classMethods: {
            associate: function(models) {
                PostLike.belongsTo(models.Post, { foreignKey: 'postId' });
                PostLike.belongsTo(models.User, { as: 'Owner', foreignKey: 'ownerId' });
            }
        }
    });

    return PostLike;
}
