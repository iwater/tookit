var Stream = require('stream').Stream;

var PackageStream = function( obj ){

  var self = this;
  Stream.call( this );

  var options = {
    '32LE': {
      'f'  : 'readUInt32LE',
      'len': 4
    },
    '16LE': {
      'f'  : 'readUInt16LE',
      'len': 2
    },
    '32BE': {
      'f'  : 'readUInt32BE',
      'len': 4
    },
    '16BE': {
      'f'  : 'readUInt16BE',
      'len': 2
    },
  };

  this.check   = obj.checksum || function(){ return true; };
  this.find    = obj.find;
  this.option  = options[ obj.type ];
  this.min_len = this.option.len + obj.offset;
  this.offset  = obj.offset;
  this.start   = obj.start || 0;
  this.stop    = obj.end || 0;
  this.buf     = null;
  this.writable = true;

};

require('util').inherits( PackageStream, Stream );

PackageStream.prototype.write = function( data ){

  var self = this;

  var join = function(buf1, buf2){
    if( !Buffer.isBuffer( buf1 ) || buf1.length == 0 ) {
      return buf2;
    }
    var ret = new Buffer(buf1.length + buf2.length);
    buf1.copy(ret);
    buf2.copy(ret, buf1.length);
    return ret;
  };

  var protocol = function( buf ){
    var len;
    while( buf.length >= self.min_len ) {
      len = buf[ self.option.f ]( self.offset );
      if( buf.length < len ) break;
      var _buf = buf.slice( 0, len );
      if( self.check( _buf ) ) {
        self.emit( 'data', _buf.slice( self.start, len + self.stop ) );
      } else {
        //self.emit( 'error' );
        len = self.find( _buf );
      }
      buf = buf.slice( len );
    }
    return buf;
  };

  this.buf = protocol( join( this.buf, data ) );
};

PackageStream.prototype.end = function() {
  this.emit( 'end' );
};

exports.PackageStream = PackageStream;
