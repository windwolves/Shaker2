module.exports = function(sequelize, DataTypes) {
    var Layout = sequelize.define('Layout', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        code: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
    }, {
        freezeTableName: true,
        classMethods: {
            associate: function(models) {
                Layout.hasMany(models.Post, { foreignKey: 'layoutId' });
            }
        }
    });

    return Layout;
}
