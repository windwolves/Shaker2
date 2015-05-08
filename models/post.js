module.exports = function(sequelize, DataTypes) {
    var Post = sequelize.define('Post', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        likeCount: {
            type: DataTypes.INTEGER(11),
            defaultValue: 0
        },
        isCover: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        status: {
            type: DataTypes.ENUM('pending', 'accept', 'reject'),
            defaultValue: 'pending'
        }
    }, {
        freezeTableName: true,
        classMethods: {
            associate: function(models) {
                Post.belongsTo(models.Entity, { foreignKey: 'entityId' });
                Post.belongsTo(models.User, { as: 'Owner', foreignKey: 'ownerId' });

                Post.hasMany(models.Card, { foreignKey: 'postId' });
            }
        }
    });

    return Post;
}
