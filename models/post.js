module.exports = function(sequelize, DataTypes) {
    var Post = sequelize.define('Post', {
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
        type: {
            type: DataTypes.STRING(50),
            defaultValue: ''
        },
    }, {
        freezeTableName: true,
        classMethods: {
            associate: function(models) {
                Post.belongsTo(models.Entity, { foreignKey: 'entityId' });
                Post.belongsTo(models.Layout, { foreignKey: 'layoutId' });
                Post.belongsTo(models.Skin, { foreignKey: 'skinId' });
                Post.belongsTo(models.User, { as: 'Owner', foreignKey: 'ownerId' });

                Post.hasMany(models.Post_Like, { foreignKey: 'postId' });
            }
        }
    });

    return Post;
}
