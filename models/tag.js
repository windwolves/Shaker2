module.exports = function(sequelize, DataTypes) {
    var Tag = sequelize.define('Tag', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        }
    }, {
        freezeTableName: true,
        classMethods: {
            associate: function(models) {
                Tag.belongsToMany(models.Entity, { through: 'entity_tag' });
            }
        }
    });

    return Tag;
}
