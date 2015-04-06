module.exports = function(sequelize, DataTypes) {
    var Theme = sequelize.define('Theme', {
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
            defaultValue: ''
        },
        code: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
    }, {
        freezeTableName: true,
        classMethods: {
            associate: function(models) {
                Theme.hasMany(models.Entity, { foreignKey: 'themeId' });
                Theme.hasMany(models.Layout, { foreignKey: 'themeId' });
                Theme.hasMany(models.Skin, { foreignKey: 'themeId' });
            }
        }
    });

    return Theme;
}
