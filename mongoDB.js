/**
 * mongoose操作类(封装mongodb)
 */

var fs = require('fs');
var path = require('path');
var mongoose = require('mongoose');
var log4js = require('log4js');
log4js.configure("./configure/log4js.json");
const logger = log4js.getLogger('mongodb_log');
const logmailer = log4js.getLogger('mailer');

var options = {
    db_user: "",
    db_pwd: "",
    db_host: "10.200.200.157",
    db_port: 27017,
    db_name: "screenshot_qianx_20180201"
};

/*var dbURL = "mongodb://" + options.db_user + ":" + options.db_pwd + "@"
    + options.db_host + ":" + options.db_port + "/" + options.db_name;*/
var dbURL;
if(options.db_user){
    dbURL = "mongodb://" + options.db_user + ":" + options.db_pwd + "@"
        + options.db_host + ":" + options.db_port + "/" + options.db_name;
}else{
    dbURL = "mongodb://" + options.db_host + ":" + options.db_port + "/" + options.db_name;
}
mongoose.connect(dbURL);
var conn = mongoose.connection;

conn.on('connected', function (err) {
    if (err) {
        logger.error('Database connection failure');
        logmailer.info('Database connection failure');
    }
});

conn.on('error', function (err) {
    logger.error('Mongoose connected error ' + err);
    logmailer.info('Mongoose connected error ' + err);
});

conn.on('disconnected', function () {
    logger.error('Mongoose disconnected');
    logmailer.info('Mongoose disconnected');
});

process.on('SIGINT', function () {
    mongoose.connection.close(function () {
        logger.info('Mongoose disconnected through app termination');
        process.exit(0);
    });
});

var DB = function () {
    this.mongoClient = {};
    var filename = path.join(path.dirname(__filename), 'configure/table.json');
    this.tabConf = JSON.parse(fs.readFileSync(path.normalize(filename)));
};

/**
 * 初始化mongoose model
 * @param table_name 表名称(集合名称)
 */
DB.prototype.getConnection = function (table_name) {
    if (!table_name) return;
    if (!this.tabConf[table_name]) {
        logger.error('No table structure');
        return false;
    }

    var client = this.mongoClient[table_name];
    if (!client) {
        //构建用户信息表结构
        var nodeSchema = new mongoose.Schema(this.tabConf[table_name]);

        //构建model
        client = mongoose.model(table_name, nodeSchema, table_name);

        this.mongoClient[table_name] = client;
    }
    return client;
};


/**
 * 保存数据
 * @param table_name 表名
 * @param fields 表数据
 * @param callback 回调方法
 */
DB.prototype.save = function (table_name, fields, callback) {
    if (!fields) {
        if (callback) callback({msg: 'Field is not allowed for null'});
        return false;
    }

    var err_num = 0;
    for (var i in fields) {
        if (!this.tabConf[table_name][i]) err_num ++;
    }
    if (err_num > 0) {
        if (callback) callback({msg: 'Wrong field name'});
        return false;
    }

    var node_model = this.getConnection(table_name);
    var mongooseEntity = new node_model(fields);
    mongooseEntity.save(function (err, res) {
        if (err) {
            if (callback) callback(err);
        } else {
            if (callback) callback(null, res);
        }
    });
};

/**
 * 更新数据
 * @param table_name 表名
 * @param conditions 更新需要的条件 {_id: id, user_name: name}
 * @param update_fields 要更新的字段 {age: 21, sex: 1}
 * @param callback 回调方法
 */
DB.prototype.update = function (table_name, conditions, update_fields, callback) {
    if (!update_fields || !conditions) {
        if (callback) callback({msg: 'Parameter error'});
        return;
    }
    var node_model = this.getConnection(table_name);
    node_model.update(conditions, {$set: update_fields}, {multi: true, upsert: true}, function (err, res) {
        if (err) {
            if (callback) callback(err);
        } else {
            if (callback) callback(null, res);
        }
    });
};

/**
 * 更新数据方法(带操作符的)
 * @param table_name 数据表名
 * @param conditions 更新条件 {_id: id, user_name: name}
 * @param update_fields 更新的操作符 {$set: {id: 123}}
 * @param callback 回调方法
 */
DB.prototype.updateData = function (table_name, conditions, update_fields, callback) {
    if (!update_fields || !conditions) {
        if (callback) callback({msg: 'Parameter error'});
        return;
    }
    var node_model = this.getConnection(table_name);
    node_model.findOneAndUpdate(conditions, update_fields, {multi: true, upsert: true}, function (err, data) {
        if (callback) callback(err, data);
    });
};

/**
 * 删除数据
 * @param table_name 表名
 * @param conditions 删除需要的条件 {_id: id}
 * @param callback 回调方法
 */
DB.prototype.remove = function (table_name, conditions, callback) {
    var node_model = this.getConnection(table_name);
    node_model.remove(conditions, function (err, res) {
        if (err) {
            if (callback) callback(err);
        } else {
            if (callback) callback(null, res);
        }
    });
};

/**
 * 查询数据
 * @param table_name 表名
 * @param conditions 查询条件
 * @param fields 待返回字段
 * @param callback 回调方法
 */
DB.prototype.find = function (table_name, conditions, fields, callback) {
    var node_model = this.getConnection(table_name);
    node_model.find(conditions, fields || null, {}, function (err, res) {
        if (err) {
            callback(err);
        } else {
            callback(null, res);
        }
    });
};

/**
 * 查询单条数据
 * @param table_name 表名
 * @param conditions 查询条件
 * @param callback 回调方法
 */
DB.prototype.findOne = function (table_name, conditions, callback) {
    var node_model = this.getConnection(table_name);
    node_model.findOne(conditions, function (err, res) {
        if (err) {
            callback(err);
        } else {
            callback(null, res);
        }
    });
};

/**
 * 根据_id查询指定的数据
 * @param table_name 表名
 * @param _id 可以是字符串或 ObjectId 对象。
 * @param callback 回调方法
 */
DB.prototype.findById = function (table_name, _id, callback) {
    var node_model = this.getConnection(table_name);
    node_model.findById(_id, function (err, res){
        if (err) {
            callback(err);
        } else {
            callback(null, res);
        }
    });
};

/**
 * 返回符合条件的文档数
 * @param table_name 表名
 * @param conditions 查询条件
 * @param callback 回调方法
 */
DB.prototype.count = function (table_name, conditions, callback) {
    var node_model = this.getConnection(table_name);
    node_model.count(conditions, function (err, res) {
        if (err) {
            callback(err);
        } else {
            callback(null, res);
        }
    });
};

/**
 * 查询符合条件的文档并返回根据键分组的结果
 * @param table_name 表名
 * @param field 待返回的键值
 * @param conditions 查询条件
 * @param callback 回调方法
 */
DB.prototype.distinct = function (table_name, field, conditions, callback) {
    var node_model = this.getConnection(table_name);
    node_model.distinct(field, conditions, function (err, res) {
        if (err) {
            callback(err);
        } else {
            callback(null, res);
        }
    });
};

/**
 * 连写查询
 * @param table_name 表名
 * @param conditions 查询条件 {a:1, b:2}
 * @param options 选项：{fields: "a b c", sort: {time: -1}, limit: 10}
 * @param callback 回调方法
 */
DB.prototype.where = function (table_name, conditions, options, callback) {
    var node_model = this.getConnection(table_name);
    node_model.find(conditions)
        .select(options.fields || '')
        .sort(options.sort || {})
        .limit(options.limit || {})
        .exec(function (err, res) {
            if (err) {
                callback(err);
            } else {
                callback(null, res);
            }
        });
};

const fileconfig = require('./configure/fileconfig.json');
const Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;

conn.once('open', function () {
    console.log('open');
    let gfs = Grid(conn.db);

    // 写文件
    DB.prototype.writeFile=function(fileName,callback){
        let writestream = gfs.createWriteStream({
            filename:fileName
        });
        fs.createReadStream(path.dirname(__filename)+"/"+fileconfig.inFilePath + fileName).pipe(writestream);

        writestream.on('close', function (file) {
            console.log(file.filename + ' Written To DB');
            callback();
        });
    };

    // 读取文件
    DB.prototype.readFile = function(fileName){
        let fs_write_stream = fs.createWriteStream(path.dirname(__filename)+"/"+fileconfig.outFilePath + fileName);
        let readstream = gfs.createReadStream({
            filename: fileName
        });
        readstream.pipe(fs_write_stream);
        fs_write_stream.on('close', function () {
            console.log('file has been written fully!');
        });
    };

    // 根据文件名称删除
    DB.prototype.deleteFileByFName =function(fileName){
        gfs.remove({filename: fileName}, function (err) {
            if (err) return handleError(err);
            console.log('success');
        });
    };

    // 根据fs.files._id删除
    DB.prototype.deleteFileById =function(id) {
        gfs.remove({_id: id}, function (err) {
            if (err) return handleError(err);
            console.log('success');
        });
    };
    // 判断文件是否存在
    DB.prototype.checkFile = function(fileName) {
        let options = {filename: fileName}; // 使用_id也可以
        gfs.exist(options, function (err, found) {
            if (err) return handleError(err);
            found ? console.log('File exists') : console.log('File does not exist');
        });
    };

    // 获取文件基础信息
    DB.prototype.findByFName = function(fileName){
        gfs.files.find({ filename: fileName }).toArray(function (err, files) {
            if (err) {
                throw (err);
            }
            console.log(files);
        });
    };
});

module.exports = new DB();
