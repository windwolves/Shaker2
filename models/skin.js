module.exports = function(sequelize, DataTypes) {
    var Skin = sequelize.define('Skin', {
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
                Skin.belongsTo(models.Theme, { foreignKey: 'themeId' });

                Skin.hasMany(models.Post, { foreignKey: 'skinId' });
            }
        }
    });

    return Skin;
}
