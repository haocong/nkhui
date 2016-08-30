var fs = require('fs');
var path = require('path');
var multipart = require('connect-multiparty');
var compose = require('connect-compose');
var qcloud = require('qcloud_cos');

module.exports = function(options) {
  qcloud.conf.setAppInfo(options.appid, options.secretid, options.secretkey);

  var cos = function(req, res, next) {
    if (!req.files) { return next(); }
    var index = length = 0;
    for (var key in req.files) {
      (function (key) {
        var filename = req.files[key].name;
        var filepath = req.files[key].path;
        var filetype = req.files[key].type.split('/')[0];
        var filesize = req.files[key].size;
        if (filesize) {
          length++;
          qcloud.cos.upload(filepath, options.bucket,
            path.join(filetype, Date.now() + '_' +  filename), '', 1,
            function(ret) {
              fs.unlink(filepath);
              if (ret.code !== 0) {
                return next(new Error(ret.message));
              }
              req.body.qcos = req.body.qcos || {};
              req.body.qcos[key] = ret.data.access_url;
              index++;
              if (index === length) {
                next();
              }
            }
          );
        }
      })(key);
    }
  };

  return compose([multipart(), cos]);
};
