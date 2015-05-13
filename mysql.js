var co = require('co');
var mysql = require('mysql');

var getFirst = function (rows) {
  if(rows.length > 0) {
    var row = rows[0];
    var key = Object.keys(row)[0];
    return row[key];
  }
};

var getFirstRow = function (rows) {
  return rows[0] || {};
};

exports.createPool = function (options) {
  var pool = mysql.createPool(options);

  pool.on('error', function (e) {
    console.log(e.stack);
    console.log(options);
  });

  var getConnection = function (pool) {
    return new Promise(function (resolve, reject) {
      pool.getConnection(function(err, connection) {
        err ? reject(err) : resolve(connection);
      });
    });
  };

  var querySerial = co.wrap(function*(queries) {
    var conn = yield getConnection(pool);
    var query = queryFactory(conn);
    var results = [];
    for(var i = 0; i < queries.length; i++) {
      results.push(yield query(queries[i].sql, queries[i].args));
    }
    conn.release();
    return results;
  });

  var queryFactory = function (pool) {
    return function (sql, args) {
      return new Promise(function (resolve, reject) {
        pool.query(sql, args, function (err, rows) {
          if(err) reject(err);
          else resolve(rows);
        });
      });
    };
  };

  var query = queryFactory(pool);

  var queryOne = function (sql, args) {
    return query(sql, args).then(getFirst);
  };

  var queryObject = function (sql, args) {
    return query(sql, args).then(getFirstRow);
  };

  var executeInsert = function (sql, args) {
    return query(sql, args).then(function(result){
      return result.insertId;
    });
  };

  var executeUpdate = function (sql, args) {
    return query(sql, args).then(function(result) {
      return (result.affectedRows > 0);
    });
  };

  return {
    query: query,
    queryOne: queryOne,
    queryObject: queryObject,
    querySerial: querySerial,
    executeInsert: executeInsert,
    executeUpdate: executeUpdate
  };
};
