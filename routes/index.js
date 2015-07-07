var express = require('express');
var router = express.Router();

var config = require('../config');
var fileUtils = require('../common/fileUtils');
var handler = require('../common/handler');
// var flow = require('../common/flow')('upload/temp');

var root = __dirname + '/../' + (config.isProduction ? 'dist' : 'src');


router.get('/', function(req, res) {
    res.sendFile('/index.html', {
        root: root
    });
});

router.get('/login', function(req, res) {
    if(req.session.user) {
        res.redirect('/admin');
    }
    else {
        res.sendFile('/module/login/index.html', {
            root: root
        });
    }
});

router.get('/admin', function(req, res) {
    if(req.session.user) {
        res.sendFile('/module/admin/index.html', {
            root: root
        });
    }
    else {
        res.redirect('/login');
    }
});

router.get('/admin/post', function(req, res) {
    if(req.session.user) {
        res.sendFile('/module/post/index.html', {
            root: root
        });
    }
    else {
        res.redirect('/login');
    }
});

router.get('/recommen', function(req, res) {
    res.sendFile('/module/recommen/index.html', {
        root: root
    });
});

router.get('/question', function(req, res) {
    res.sendFile('/module/question/index.html', {
        root: root
    });
});

router.get('/humanity', function(req, res) {
    res.sendFile('/module/humanity/index.html', {
        root: root
    });
});

router.get('/entity/:id', function(req, res) {
    res.sendFile('/entity/main/index.html', {
        root: root
    });
});

router.get('/entity/:id/catalog', function(req, res) {
    res.sendFile('/entity/catalog/index.html', {
        root: root
    });
});

router.get('/entity/:id/join', function(req, res) {
    res.sendFile('/entity/join/index.html', {
        root: root
    });
});

router.get('/entity/:id/joined/:postid', function(req, res) {
    res.sendFile('/entity/joined/index.html', {
        root: root
    });
});

router.get('/post/:id', function(req, res) {
    res.sendFile('/entity/post/index.html', {
        root: root
    });
});

var maxFileSize = 1 * 1024 * 1024;

router.post('/upload', handler.needLogin, function(req, res) {
    if(req.body.flowTotalSize > maxFileSize) {
        fileUtils.remove(req.files.file.path, function(d) { return d; });
        res.warning('FILE_SIZE_TOO_LARGE');
        return;
    }

    if(req.files.file && req.files.file.size > maxFileSize) {
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
