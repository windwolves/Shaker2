module.exports = function(sequelize, DataTypes) {
    var Suggestion = sequelize.define('Suggestion', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        type: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
    }, {
        freezeTableName: true,
        classMethods: {
            associate: function(models) {
                Suggestion.belongsTo(models.User, { as: 'Sender', foreignKey: 'senderId' });
            }
        }
    });

    return Suggestion;
}
