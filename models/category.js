module.exports = function(sequelize, DataTypes) {
    var Category = sequelize.define('Category', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
    }, {
        freezeTableName: true,
        classMethods: {
            associate: function(models) {
                Category.hasMany(models.Entity, { foreignKey: 'categoryId' });
            }
        }
    });

    return Category;
}
