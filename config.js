

exports.port = 8083;

exports.cookieSecret = 'shaker2';

exports.isProduction = true;
exports.isRelease = false;

exports.wechat = {
    appid: 'wxd6810c7d3b63d5c6',
    secret: 'dc653b3324aa1fdff691483ec7619530',
    host: 'v2.shaker.mobi'
};

var dbInfo = {
    type: 'mysql',
    username: 'shaker2_admin',
    password: 'Initial1',
    host: 'rdsauea6fyyanf3.mysql.rds.aliyuncs.com',
    port: '3306',
    name: 'shaker2'
};

function getConnectionUrl(type, username, password, host, port, name) {
    if(typeof type == 'object') {
        name = type.name;
        port = type.port;
        host = type.host;
        password = type.password;
        username = type.username;
        type = type.type;
    }
    return type + '://' + username + ':' + password + '@' + host + ':' + port + '/' + name;
}
exports.dbInfo = dbInfo;
exports.dbUrl = getConnectionUrl(dbInfo);
