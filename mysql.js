var mysql = require('mysql');

var getFirst = function (rows) {
  if(rows.length > 0) {
    var row = rows[0];
    var key = Object.keys(row)[0];
    return row[key];
  } else {
    throw('NO DATA');
  }
};

var getFirstRow = function (rows) {
  return rows[0] || {};
};

exports.createPool = function (options) {
  var pool = mysql.createPool(options);

  pool.on('connection', function (connection) {
    connection.query("SET SESSION time_zone ='+8:00'");
  });

  var query = function (sql, args) {
    return new Promise(function (resolve, reject) {
      pool.query(sql, args, function (err, rows) {
        if(err) reject(err);
        else resolve(rows);
      });
    });
  };

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
    executeInsert: executeInsert,
    executeUpdate: executeUpdate
  };
};
