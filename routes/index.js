var express = require('express');
var router = express.Router();

var fileUtils = require('../common/fileUtils');
// var flow = require('../common/flow')('upload/temp');


router.get('/', function(req, res) {
    res.sendFile('/index.html', {
        root: __dirname + '/../src'
    });
});

router.get('/module/entity/:id', function(req, res) {
    res.sendFile('/module/entity/index.html', {
        root: __dirname + '/../src'
    });
});

router.get('/entity/:id', function(req, res) {
    res.sendFile('/entity/main/index.html', {
        root: __dirname + '/../src'
    });
});

router.get('/entity/:id/catalog', function(req, res) {
    res.sendFile('/entity/catalog/index.html', {
        root: __dirname + '/../src'
    });
});

router.get('/entity/:id/join', function(req, res) {
    res.sendFile('/entity/join/index.html', {
        root: __dirname + '/../src'
    });
});

router.get('/post/:id', function(req, res) {
    res.sendFile('/entity/post/index.html', {
        root: __dirname + '/../src'
    });
});


router.post('/upload', function(req, res) {
    res.success(fileUtils.upload(req.files.file));
});

module.exports = router;
