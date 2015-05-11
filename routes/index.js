var express = require('express');
var router = express.Router();

var config = require('../config');
var fileUtils = require('../common/fileUtils');
var handler = require('../common/handler');
// var flow = require('../common/flow')('upload/temp');

var staticDir = config.isProduction ? 'dist' : 'src';


router.get('/', function(req, res) {
    res.sendFile('/index.html', {
        root: __dirname + '/../' + staticDir
    });
});

router.get('/entity/:id', function(req, res) {
    res.sendFile('/entity/main/index.html', {
        root: __dirname + '/../' + staticDir
    });
});

router.get('/entity/:id/catalog', function(req, res) {
    res.sendFile('/entity/catalog/index.html', {
        root: __dirname + '/../' + staticDir
    });
});

router.get('/entity/:id/join', function(req, res) {
    res.sendFile('/entity/join/index.html', {
        root: __dirname + '/../' + staticDir
    });
});

router.get('/entity/:id/joined/:postid', function(req, res) {
    res.sendFile('/entity/joined/index.html', {
        root: __dirname + '/../' + staticDir
    });
});

router.get('/post/:id', function(req, res) {
    res.sendFile('/entity/post/index.html', {
        root: __dirname + '/../' + staticDir
    });
});


router.post('/upload', handler.needLogin, function(req, res) {
    if(req.body.flowTotalSize > 2 * 1024 * 1024) {
        fileUtils.remove(req.files.file.path, function(d) { return d; });
        res.warning('FILE_SIZE_TOO_LARGE');
        return;
    }

    if(req.files.file && req.files.file.size > 2 * 1024 * 1024) {
        fileUtils.remove(req.files.file.path, function(d) { return d; });
        res.warning('FILE_SIZE_TOO_LARGE');
        return;
    }

    if(req.body.origin_file) {
        fileUtils.remove(req.body.origin_file);
    }

    res.success(fileUtils.upload(req.files.file));
});

module.exports = router;
