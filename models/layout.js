module.exports = function(sequelize, DataTypes) {
    var Layout = sequelize.define('Layout', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            defaultValue: ''
        },
        code: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },
    }, {
        freezeTableName: true,
        classMethods: {
            associate: function(models) {
                Layout.belongsTo(models.Theme, { foreignKey: 'themeId' });

                Layout.hasMany(models.Post, { foreignKey: 'layoutId' });
            }
        }
    });

    return Layout;
}
