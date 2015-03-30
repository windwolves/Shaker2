var apns = require('apn');

var options = {
    cert: __dirname + '/cert/apn_pro.pem',
    key:  __dirname + '/cert/apn_pro_key.pem',
    gateway: 'gateway.push.apple.com',
    port: 2195,
    errorCallback: function(err, notification){
        console.log('error: ' + err);
    }
};

var conn = new apns.Connection(options);

var apnAPI = {
    conn: conn,
    send: function(devoceToken, title, content) {
        var note = new apns.Notification();

        note.expiry = Math.floor(Date.now() / 1000) + 3600;
        note.badge = 1;
        note.sound = 'ping.aiff';
        note.alert = title;
        note.payload = content;
        note.device = new apns.Device(devoceToken);

        conn.sendNotification(note);
    }
};

// apn.send('641f2d8fba11ae534e00adcd48e6c2eee65deb943eabb276e687464aec637db2', 'Apn test', { 'msg': '数据库deviceToken字段长度太短了' });


module.exports = apnAPI;
