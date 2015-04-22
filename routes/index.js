var express = require('express');
var router = express.Router();

var fileUtils = require('../common/fileUtils');
// var flow = require('../common/flow')('upload/temp');


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

router.post('/upload', function(req, res) {
    res.success(fileUtils.upload(req.files.file));
    // flow.post(req, function(status, filename, original_filename, identifier) {
    //     if(status == 'done') {
    //         res.success({
    //             filename: filename,
    //             original_filename: original_filename,
    //             identifier: identifier
    //         });
    //     }
    //     else {
    //         res.warning({
    //             status: status,
    //             filename: filename,
    //             original_filename: original_filename,
    //             identifier: identifier
    //         });
    //     }
    // });
});

module.exports = router;
