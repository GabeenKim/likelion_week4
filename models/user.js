const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model{
    static init(sequelize){
        return super.init({                 
            email : {
                type : Sequelize.STRING(50)
            },
            password : {
                type : Sequelize.STRING(100)
            }
		}, {
            sequelize,
            timestamps: false,
            modelName: 'User',
            tableName: 'Users',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }
    static associate(db){
        db.User.hasMany(db.Post, { foriegnKey: 'UserId', targetKey: 'id'}); //자식릴레이션인 posts에서 User의 id를 사용할 수 있도록 지정.
        }
};