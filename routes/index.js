var express = require('express');
var router = express.Router();


router.get('/', function(req, res) {
    res.sendFile('/index.html', {
        root: __dirname + '/../src'
    });
});

router.get('/entity', function(req, res) {
    res.sendFile('/module/entity/list.html', {
        root: __dirname + '/../src'
    });
});

router.get('/entity/*:id', function(req, res) {
    res.sendFile('/module/entity/index.html', {
        root: __dirname + '/../src'
    });
});

module.exports = router;
