var fs = require('fs');
var path = require('path');


var _utils = {};

_utils.getAbsolutePathFunc = function() {
    return function(d) {
        return path.resolve(path.join(__dirname, '../app', d))
    };
};

_utils.getRelativePathFunc = function(uniquePath, isWithIndex) {
    return function(d, i) {
        return '/img/' + uniquePath + (isWithIndex ? '-' + i : '') + path.extname(d);
    };
};

_utils.getUploadRelativePath = function(absolutePath) {
    return path.join('/common/upload', path.basename(absolutePath));
};

_utils.upload = function(files) {
    if(!Array.isArray(files)) {
        files = files ? [files] : [];
    }

    var absolutePaths = [];
    var relativePaths = [];

    files.forEach(function(d) {
        absolutePaths.push(d.path);
        relativePaths.push(_utils.getUploadRelativePath(d.path));
    });

    setTimeout(function() {
        absolutePaths.forEach(function(path) {
            fs.exists(path, function(isExists) {
                if(isExists) {
                    fs.unlink(path, function() {
                        console.log('Remove file "' + path + '" successfully!');
                    });
                }
            });
        })
    }, 1800000);

    return relativePaths;
};

_utils.moveOne = function(from, to, aFunc, rFUnc) {
    if(typeof from !== 'string' || typeof to !== 'string') {
        throw 'Arguments 0 and 1 must by String';
        return;
    }

    return _utils.moveAll([from], [to], aFunc, rFUnc)[0];
};

_utils.moveAll = function(fromArr, toArr, aFunc, rFUnc) {
    if(!Array.isArray(fromArr) || !Array.isArray(toArr)) {
        throw 'Arguments 0 and 1 must by Array';
        return;
    }
    if(typeof aFunc !== 'function') {
        aFunc = _utils.getAbsolutePathFunc();
    }
    if(typeof rFUnc !== 'function') {
        rFUnc = _utils.getRelativePathFunc();
    }

    var resultArr = toArr.slice(0);
    var absolutePath;
    var relativePath;

    toArr.forEach(function(d, i) {
        if(d && d != fromArr[i]) {
            absolutePath = aFunc(d);
            relativePath = rFUnc(d, i);

            if(fs.existsSync(absolutePath)) {
                fs.renameSync(absolutePath, aFunc(relativePath));
                resultArr[i] = relativePath;
            }
        }
    });

    fromArr.forEach(function(d) {
        if(d && resultArr.indexOf(d) === -1) {
            absolutePath = aFunc(d);
            if(fs.existsSync(absolutePath)) {
                fs.unlinkSync(absolutePath);
            }
        }
    });

    return resultArr;
};

_utils.move = function(from, to, uniquePath, isNeedJSONParse) {
    var aFunc = _utils.getAbsolutePathFunc();
    var rFUnc = _utils.getRelativePathFunc(uniquePath, isNeedJSONParse);

    if(isNeedJSONParse) {
        return JSON.stringify(_utils.moveAll(JSON.parse(from), JSON.parse(to), aFunc, rFUnc));
    }
    else {
        return _utils.moveOne(from, to, aFunc, rFUnc);
    }
};

_utils.create = function(paths, uniquePath, isNeedJSONParse) {
    var aFunc = _utils.getAbsolutePathFunc();
    var rFUnc = _utils.getRelativePathFunc(uniquePath, isNeedJSONParse);

    if(isNeedJSONParse) {
        return JSON.stringify(_utils.moveAll([], JSON.parse(paths), aFunc, rFUnc));
    }
    else {
        return _utils.moveOne('', paths, aFunc, rFUnc);
    }
};

_utils.remove = function(paths, aFunc) {
    aFunc = aFunc || _utils.getAbsolutePathFunc();
    var absolutePath = aFunc(paths);
    if(fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
    }
};

module.exports = _utils;
