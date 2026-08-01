#!/usr/bin/env node
import { createRequire } from 'module'; const require = createRequire(import.meta.url);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../node_modules/adm-zip/util/constants.js
var require_constants = __commonJS({
  "../node_modules/adm-zip/util/constants.js"(exports, module) {
    module.exports = {
      /* The local file header */
      LOCHDR: 30,
      // LOC header size
      LOCSIG: 67324752,
      // "PK\003\004"
      LOCVER: 4,
      // version needed to extract
      LOCFLG: 6,
      // general purpose bit flag
      LOCHOW: 8,
      // compression method
      LOCTIM: 10,
      // modification time (2 bytes time, 2 bytes date)
      LOCCRC: 14,
      // uncompressed file crc-32 value
      LOCSIZ: 18,
      // compressed size
      LOCLEN: 22,
      // uncompressed size
      LOCNAM: 26,
      // filename length
      LOCEXT: 28,
      // extra field length
      /* The Data descriptor */
      EXTSIG: 134695760,
      // "PK\007\008"
      EXTHDR: 16,
      // EXT header size
      EXTCRC: 4,
      // uncompressed file crc-32 value
      EXTSIZ: 8,
      // compressed size
      EXTLEN: 12,
      // uncompressed size
      /* The central directory file header */
      CENHDR: 46,
      // CEN header size
      CENSIG: 33639248,
      // "PK\001\002"
      CENVEM: 4,
      // version made by
      CENVER: 6,
      // version needed to extract
      CENFLG: 8,
      // encrypt, decrypt flags
      CENHOW: 10,
      // compression method
      CENTIM: 12,
      // modification time (2 bytes time, 2 bytes date)
      CENCRC: 16,
      // uncompressed file crc-32 value
      CENSIZ: 20,
      // compressed size
      CENLEN: 24,
      // uncompressed size
      CENNAM: 28,
      // filename length
      CENEXT: 30,
      // extra field length
      CENCOM: 32,
      // file comment length
      CENDSK: 34,
      // volume number start
      CENATT: 36,
      // internal file attributes
      CENATX: 38,
      // external file attributes (host system dependent)
      CENOFF: 42,
      // LOC header offset
      /* The entries in the end of central directory */
      ENDHDR: 22,
      // END header size
      ENDSIG: 101010256,
      // "PK\005\006"
      ENDSUB: 8,
      // number of entries on this disk
      ENDTOT: 10,
      // total number of entries
      ENDSIZ: 12,
      // central directory size in bytes
      ENDOFF: 16,
      // offset of first CEN header
      ENDCOM: 20,
      // zip file comment length
      END64HDR: 20,
      // zip64 END header size
      END64SIG: 117853008,
      // zip64 Locator signature, "PK\006\007"
      END64START: 4,
      // number of the disk with the start of the zip64
      END64OFF: 8,
      // relative offset of the zip64 end of central directory
      END64NUMDISKS: 16,
      // total number of disks
      ZIP64SIG: 101075792,
      // zip64 signature, "PK\006\006"
      ZIP64HDR: 56,
      // zip64 record minimum size
      ZIP64LEAD: 12,
      // leading bytes at the start of the record, not counted by the value stored in ZIP64SIZE
      ZIP64SIZE: 4,
      // zip64 size of the central directory record
      ZIP64VEM: 12,
      // zip64 version made by
      ZIP64VER: 14,
      // zip64 version needed to extract
      ZIP64DSK: 16,
      // zip64 number of this disk
      ZIP64DSKDIR: 20,
      // number of the disk with the start of the record directory
      ZIP64SUB: 24,
      // number of entries on this disk
      ZIP64TOT: 32,
      // total number of entries
      ZIP64SIZB: 40,
      // zip64 central directory size in bytes
      ZIP64OFF: 48,
      // offset of start of central directory with respect to the starting disk number
      ZIP64EXTRA: 56,
      // extensible data sector
      /* Compression methods */
      STORED: 0,
      // no compression
      SHRUNK: 1,
      // shrunk
      REDUCED1: 2,
      // reduced with compression factor 1
      REDUCED2: 3,
      // reduced with compression factor 2
      REDUCED3: 4,
      // reduced with compression factor 3
      REDUCED4: 5,
      // reduced with compression factor 4
      IMPLODED: 6,
      // imploded
      // 7 reserved for Tokenizing compression algorithm
      DEFLATED: 8,
      // deflated
      ENHANCED_DEFLATED: 9,
      // enhanced deflated
      PKWARE: 10,
      // PKWare DCL imploded
      // 11 reserved by PKWARE
      BZIP2: 12,
      //  compressed using BZIP2
      // 13 reserved by PKWARE
      LZMA: 14,
      // LZMA
      // 15-17 reserved by PKWARE
      IBM_TERSE: 18,
      // compressed using IBM TERSE
      IBM_LZ77: 19,
      // IBM LZ77 z
      AES_ENCRYPT: 99,
      // WinZIP AES encryption method
      /* General purpose bit flag */
      // values can obtained with expression 2**bitnr
      FLG_ENC: 1,
      // Bit 0: encrypted file
      FLG_COMP1: 2,
      // Bit 1, compression option
      FLG_COMP2: 4,
      // Bit 2, compression option
      FLG_DESC: 8,
      // Bit 3, data descriptor
      FLG_ENH: 16,
      // Bit 4, enhanced deflating
      FLG_PATCH: 32,
      // Bit 5, indicates that the file is compressed patched data.
      FLG_STR: 64,
      // Bit 6, strong encryption (patented)
      // Bits 7-10: Currently unused.
      FLG_EFS: 2048,
      // Bit 11: Language encoding flag (EFS)
      // Bit 12: Reserved by PKWARE for enhanced compression.
      // Bit 13: encrypted the Central Directory (patented).
      // Bits 14-15: Reserved by PKWARE.
      FLG_MSK: 4096,
      // mask header values
      /* Load type */
      FILE: 2,
      BUFFER: 1,
      NONE: 0,
      /* 4.5 Extensible data fields */
      EF_ID: 0,
      EF_SIZE: 2,
      /* Header IDs */
      ID_ZIP64: 1,
      ID_AVINFO: 7,
      ID_PFS: 8,
      ID_OS2: 9,
      ID_NTFS: 10,
      ID_OPENVMS: 12,
      ID_UNIX: 13,
      ID_FORK: 14,
      ID_PATCH: 15,
      ID_X509_PKCS7: 20,
      ID_X509_CERTID_F: 21,
      ID_X509_CERTID_C: 22,
      ID_STRONGENC: 23,
      ID_RECORD_MGT: 24,
      ID_X509_PKCS7_RL: 25,
      ID_IBM1: 101,
      ID_IBM2: 102,
      ID_POSZIP: 18064,
      EF_ZIP64_OR_32: 4294967295,
      EF_ZIP64_OR_16: 65535,
      EF_ZIP64_SUNCOMP: 0,
      EF_ZIP64_SCOMP: 8,
      EF_ZIP64_RHO: 16,
      EF_ZIP64_DSN: 24
    };
  }
});

// ../node_modules/adm-zip/util/errors.js
var require_errors = __commonJS({
  "../node_modules/adm-zip/util/errors.js"(exports) {
    var errors = {
      /* Header error messages */
      INVALID_LOC: "Invalid LOC header (bad signature)",
      INVALID_CEN: "Invalid CEN header (bad signature)",
      INVALID_END: "Invalid END header (bad signature)",
      /* Descriptor */
      DESCRIPTOR_NOT_EXIST: "No descriptor present",
      DESCRIPTOR_UNKNOWN: "Unknown descriptor format",
      DESCRIPTOR_FAULTY: "Descriptor data is malformed",
      /* ZipEntry error messages*/
      NO_DATA: "Nothing to decompress",
      BAD_CRC: "CRC32 checksum failed {0}",
      FILE_IN_THE_WAY: "There is a file in the way: {0}",
      UNKNOWN_METHOD: "Invalid/unsupported compression method",
      /* Inflater error messages */
      AVAIL_DATA: "inflate::Available inflate data did not terminate",
      INVALID_DISTANCE: "inflate::Invalid literal/length or distance code in fixed or dynamic block",
      TO_MANY_CODES: "inflate::Dynamic block code description: too many length or distance codes",
      INVALID_REPEAT_LEN: "inflate::Dynamic block code description: repeat more than specified lengths",
      INVALID_REPEAT_FIRST: "inflate::Dynamic block code description: repeat lengths with no first length",
      INCOMPLETE_CODES: "inflate::Dynamic block code description: code lengths codes incomplete",
      INVALID_DYN_DISTANCE: "inflate::Dynamic block code description: invalid distance code lengths",
      INVALID_CODES_LEN: "inflate::Dynamic block code description: invalid literal/length code lengths",
      INVALID_STORE_BLOCK: "inflate::Stored block length did not match one's complement",
      INVALID_BLOCK_TYPE: "inflate::Invalid block type (type == 3)",
      /* ADM-ZIP error messages */
      CANT_EXTRACT_FILE: "Could not extract the file",
      CANT_OVERRIDE: "Target file already exists",
      DISK_ENTRY_TOO_LARGE: "Number of disk entries is too large",
      NO_ZIP: "No zip file was loaded",
      NO_ENTRY: "Entry doesn't exist",
      DIRECTORY_CONTENT_ERROR: "A directory cannot have content",
      FILE_NOT_FOUND: 'File not found: "{0}"',
      NOT_IMPLEMENTED: "Not implemented",
      INVALID_FILENAME: "Invalid filename",
      INVALID_FORMAT: "Invalid or unsupported zip format. No END header found",
      INVALID_PASS_PARAM: "Incompatible password parameter",
      WRONG_PASSWORD: "Wrong Password",
      /* ADM-ZIP */
      COMMENT_TOO_LONG: "Comment is too long",
      // Comment can be max 65535 bytes long (NOTE: some non-US characters may take more space)
      EXTRA_FIELD_PARSE_ERROR: "Extra field parsing error"
    };
    function E(message) {
      return function(...args) {
        if (args.length) {
          message = message.replace(/\{(\d)\}/g, (_, n) => args[n] || "");
        }
        return new Error("ADM-ZIP: " + message);
      };
    }
    for (const msg of Object.keys(errors)) {
      exports[msg] = E(errors[msg]);
    }
  }
});

// ../node_modules/adm-zip/util/utils.js
var require_utils = __commonJS({
  "../node_modules/adm-zip/util/utils.js"(exports, module) {
    var fsystem = __require("fs");
    var pth = __require("path");
    var Constants = require_constants();
    var Errors = require_errors();
    var isWin = typeof process === "object" && "win32" === process.platform;
    var is_Obj = (obj) => typeof obj === "object" && obj !== null;
    var crcTable = new Uint32Array(256).map((t, c) => {
      for (let k = 0; k < 8; k++) {
        if ((c & 1) !== 0) {
          c = 3988292384 ^ c >>> 1;
        } else {
          c >>>= 1;
        }
      }
      return c >>> 0;
    });
    function Utils(opts) {
      this.sep = pth.sep;
      this.fs = fsystem;
      if (is_Obj(opts)) {
        if (is_Obj(opts.fs) && typeof opts.fs.statSync === "function") {
          this.fs = opts.fs;
        }
      }
    }
    module.exports = Utils;
    Utils.prototype.makeDir = function(folder) {
      const self = this;
      function mkdirSync(fpath) {
        let resolvedPath = fpath.split(self.sep)[0];
        fpath.split(self.sep).forEach(function(name) {
          if (!name || name.substr(-1, 1) === ":") return;
          resolvedPath += self.sep + name;
          var stat;
          try {
            stat = self.fs.statSync(resolvedPath);
          } catch (e) {
            if (e.message && e.message.startsWith("ENOENT")) {
              self.fs.mkdirSync(resolvedPath);
            } else {
              throw e;
            }
          }
          if (stat && stat.isFile()) throw Errors.FILE_IN_THE_WAY(`"${resolvedPath}"`);
        });
      }
      mkdirSync(folder);
    };
    Utils.prototype.writeFileTo = function(path3, content, overwrite, attr) {
      const self = this;
      if (self.fs.existsSync(path3)) {
        if (!overwrite) return false;
        var stat = self.fs.statSync(path3);
        if (stat.isDirectory()) {
          return false;
        }
      }
      var folder = pth.dirname(path3);
      if (!self.fs.existsSync(folder)) {
        self.makeDir(folder);
      }
      var fd;
      try {
        fd = self.fs.openSync(path3, "w", 438);
      } catch (e) {
        self.fs.chmodSync(path3, 438);
        fd = self.fs.openSync(path3, "w", 438);
      }
      if (fd) {
        try {
          self.fs.writeSync(fd, content, 0, content.length, 0);
        } finally {
          self.fs.closeSync(fd);
        }
      }
      self.fs.chmodSync(path3, attr || 438);
      return true;
    };
    Utils.prototype.writeFileToAsync = function(path3, content, overwrite, attr, callback) {
      if (typeof attr === "function") {
        callback = attr;
        attr = void 0;
      }
      const self = this;
      self.fs.exists(path3, function(exist) {
        if (exist && !overwrite) return callback(false);
        self.fs.stat(path3, function(err, stat) {
          if (exist && stat.isDirectory()) {
            return callback(false);
          }
          var folder = pth.dirname(path3);
          self.fs.exists(folder, function(exists) {
            if (!exists) self.makeDir(folder);
            self.fs.open(path3, "w", 438, function(err2, fd) {
              if (err2) {
                self.fs.chmod(path3, 438, function() {
                  self.fs.open(path3, "w", 438, function(err3, fd2) {
                    self.fs.write(fd2, content, 0, content.length, 0, function() {
                      self.fs.close(fd2, function() {
                        self.fs.chmod(path3, attr || 438, function() {
                          callback(true);
                        });
                      });
                    });
                  });
                });
              } else if (fd) {
                self.fs.write(fd, content, 0, content.length, 0, function() {
                  self.fs.close(fd, function() {
                    self.fs.chmod(path3, attr || 438, function() {
                      callback(true);
                    });
                  });
                });
              } else {
                self.fs.chmod(path3, attr || 438, function() {
                  callback(true);
                });
              }
            });
          });
        });
      });
    };
    Utils.prototype.findFiles = function(path3) {
      const self = this;
      function findSync(dir, pattern, recursive) {
        if (typeof pattern === "boolean") {
          recursive = pattern;
          pattern = void 0;
        }
        let files = [];
        self.fs.readdirSync(dir).forEach(function(file) {
          const path4 = pth.join(dir, file);
          const stat = self.fs.statSync(path4);
          if (!pattern || pattern.test(path4)) {
            files.push(pth.normalize(path4) + (stat.isDirectory() ? self.sep : ""));
          }
          if (stat.isDirectory() && recursive) files = files.concat(findSync(path4, pattern, recursive));
        });
        return files;
      }
      return findSync(path3, void 0, true);
    };
    Utils.prototype.findFilesAsync = function(dir, cb) {
      const self = this;
      let results = [];
      self.fs.readdir(dir, function(err, list) {
        if (err) return cb(err);
        let list_length = list.length;
        if (!list_length) return cb(null, results);
        list.forEach(function(file) {
          file = pth.join(dir, file);
          self.fs.stat(file, function(err2, stat) {
            if (err2) return cb(err2);
            if (stat) {
              results.push(pth.normalize(file) + (stat.isDirectory() ? self.sep : ""));
              if (stat.isDirectory()) {
                self.findFilesAsync(file, function(err3, res) {
                  if (err3) return cb(err3);
                  results = results.concat(res);
                  if (!--list_length) cb(null, results);
                });
              } else {
                if (!--list_length) cb(null, results);
              }
            }
          });
        });
      });
    };
    Utils.prototype.getAttributes = function() {
    };
    Utils.prototype.setAttributes = function() {
    };
    Utils.crc32update = function(crc, byte) {
      return crcTable[(crc ^ byte) & 255] ^ crc >>> 8;
    };
    Utils.crc32 = function(buf) {
      if (typeof buf === "string") {
        buf = Buffer.from(buf, "utf8");
      }
      let len = buf.length;
      let crc = ~0;
      for (let off = 0; off < len; ) crc = Utils.crc32update(crc, buf[off++]);
      return ~crc >>> 0;
    };
    Utils.methodToString = function(method) {
      switch (method) {
        case Constants.STORED:
          return "STORED (" + method + ")";
        case Constants.DEFLATED:
          return "DEFLATED (" + method + ")";
        default:
          return "UNSUPPORTED (" + method + ")";
      }
    };
    Utils.canonical = function(path3) {
      if (!path3) return "";
      const safeSuffix = pth.posix.normalize("/" + path3.split("\\").join("/"));
      return pth.join(".", safeSuffix);
    };
    Utils.zipnamefix = function(path3) {
      if (!path3) return "";
      const safeSuffix = pth.posix.normalize("/" + path3.split("\\").join("/"));
      return pth.posix.join(".", safeSuffix);
    };
    Utils.findLast = function(arr, callback) {
      if (!Array.isArray(arr)) throw new TypeError("arr is not array");
      const len = arr.length >>> 0;
      for (let i = len - 1; i >= 0; i--) {
        if (callback(arr[i], i, arr)) {
          return arr[i];
        }
      }
      return void 0;
    };
    Utils.sanitize = function(prefix, name) {
      prefix = pth.resolve(pth.normalize(prefix));
      var parts = name.split("/");
      for (var i = 0, l = parts.length; i < l; i++) {
        var path3 = pth.normalize(pth.join(prefix, parts.slice(i, l).join(pth.sep)));
        if (path3 === prefix || path3.startsWith(prefix + pth.sep)) {
          return path3;
        }
      }
      return pth.normalize(pth.join(prefix, pth.basename(name)));
    };
    Utils.toBuffer = function toBuffer(input, encoder) {
      if (Buffer.isBuffer(input)) {
        return input;
      } else if (input instanceof Uint8Array) {
        return Buffer.from(input);
      } else {
        return typeof input === "string" ? encoder(input) : Buffer.alloc(0);
      }
    };
    Utils.readBigUInt64LE = function(buffer, index) {
      const lo = buffer.readUInt32LE(index);
      const hi = buffer.readUInt32LE(index + 4);
      return hi * 4294967296 + lo;
    };
    Utils.writeBigUInt64LE = function(buffer, value, index) {
      const lo = value >>> 0;
      const hi = Math.floor(value / 4294967296) >>> 0;
      buffer.writeUInt32LE(lo, index);
      buffer.writeUInt32LE(hi, index + 4);
    };
    Utils.fromDOS2Date = function(val) {
      return new Date((val >> 25 & 127) + 1980, Math.max((val >> 21 & 15) - 1, 0), Math.max(val >> 16 & 31, 1), val >> 11 & 31, val >> 5 & 63, (val & 31) << 1);
    };
    Utils.fromDate2DOS = function(val) {
      let date = 0;
      let time = 0;
      if (val.getFullYear() > 1979) {
        date = (val.getFullYear() - 1980 & 127) << 9 | val.getMonth() + 1 << 5 | val.getDate();
        time = val.getHours() << 11 | val.getMinutes() << 5 | val.getSeconds() >> 1;
      }
      return date << 16 | time;
    };
    Utils.isWin = isWin;
    Utils.crcTable = crcTable;
  }
});

// ../node_modules/adm-zip/util/fattr.js
var require_fattr = __commonJS({
  "../node_modules/adm-zip/util/fattr.js"(exports, module) {
    var pth = __require("path");
    module.exports = function(path3, { fs: fs3 }) {
      var _path = path3 || "", _obj = newAttr(), _stat = null;
      function newAttr() {
        return {
          directory: false,
          readonly: false,
          hidden: false,
          executable: false,
          mtime: 0,
          atime: 0
        };
      }
      if (_path && fs3.existsSync(_path)) {
        _stat = fs3.statSync(_path);
        _obj.directory = _stat.isDirectory();
        _obj.mtime = _stat.mtime;
        _obj.atime = _stat.atime;
        _obj.executable = (73 & _stat.mode) !== 0;
        _obj.readonly = (128 & _stat.mode) === 0;
        _obj.hidden = pth.basename(_path)[0] === ".";
      } else {
        console.warn("Invalid path: " + _path);
      }
      return {
        get directory() {
          return _obj.directory;
        },
        get readOnly() {
          return _obj.readonly;
        },
        get hidden() {
          return _obj.hidden;
        },
        get mtime() {
          return _obj.mtime;
        },
        get atime() {
          return _obj.atime;
        },
        get executable() {
          return _obj.executable;
        },
        decodeAttributes: function() {
        },
        encodeAttributes: function() {
        },
        toJSON: function() {
          return {
            path: _path,
            isDirectory: _obj.directory,
            isReadOnly: _obj.readonly,
            isHidden: _obj.hidden,
            isExecutable: _obj.executable,
            mTime: _obj.mtime,
            aTime: _obj.atime
          };
        },
        toString: function() {
          return JSON.stringify(this.toJSON(), null, "	");
        }
      };
    };
  }
});

// ../node_modules/adm-zip/util/decoder.js
var require_decoder = __commonJS({
  "../node_modules/adm-zip/util/decoder.js"(exports, module) {
    module.exports = {
      efs: true,
      encode: (data) => Buffer.from(data, "utf8"),
      decode: (data) => data.toString("utf8")
    };
  }
});

// ../node_modules/adm-zip/util/index.js
var require_util = __commonJS({
  "../node_modules/adm-zip/util/index.js"(exports, module) {
    module.exports = require_utils();
    module.exports.Constants = require_constants();
    module.exports.Errors = require_errors();
    module.exports.FileAttr = require_fattr();
    module.exports.decoder = require_decoder();
  }
});

// ../node_modules/adm-zip/headers/entryHeader.js
var require_entryHeader = __commonJS({
  "../node_modules/adm-zip/headers/entryHeader.js"(exports, module) {
    var Utils = require_util();
    var Constants = Utils.Constants;
    module.exports = function() {
      var _verMade = 20, _version = 10, _flags = 0, _method = 0, _time = 0, _crc = 0, _compressedSize = 0, _size = 0, _fnameLen = 0, _extraLen = 0, _comLen = 0, _diskStart = 0, _inattr = 0, _attr = 0, _offset = 0;
      _verMade |= Utils.isWin ? 2560 : 768;
      _flags |= Constants.FLG_EFS;
      const _localHeader = {
        extraLen: 0
      };
      const uint32 = (val) => Math.max(0, val) >>> 0;
      const uint16 = (val) => Math.max(0, val) & 65535;
      const uint8 = (val) => Math.max(0, val) & 255;
      _time = Utils.fromDate2DOS(/* @__PURE__ */ new Date());
      return {
        get made() {
          return _verMade;
        },
        set made(val) {
          _verMade = val;
        },
        get version() {
          return _version;
        },
        set version(val) {
          _version = val;
        },
        get flags() {
          return _flags;
        },
        set flags(val) {
          _flags = val;
        },
        get flags_efs() {
          return (_flags & Constants.FLG_EFS) > 0;
        },
        set flags_efs(val) {
          if (val) {
            _flags |= Constants.FLG_EFS;
          } else {
            _flags &= ~Constants.FLG_EFS;
          }
        },
        get flags_desc() {
          return (_flags & Constants.FLG_DESC) > 0;
        },
        set flags_desc(val) {
          if (val) {
            _flags |= Constants.FLG_DESC;
          } else {
            _flags &= ~Constants.FLG_DESC;
          }
        },
        get method() {
          return _method;
        },
        set method(val) {
          switch (val) {
            case Constants.STORED:
              this.version = 10;
              break;
            case Constants.DEFLATED:
            default:
              this.version = 20;
          }
          _method = val;
        },
        get time() {
          return Utils.fromDOS2Date(this.timeval);
        },
        set time(val) {
          val = new Date(val);
          this.timeval = Utils.fromDate2DOS(val);
        },
        get timeval() {
          return _time;
        },
        set timeval(val) {
          _time = uint32(val);
        },
        get timeHighByte() {
          return uint8(_time >>> 8);
        },
        get crc() {
          return _crc;
        },
        set crc(val) {
          _crc = uint32(val);
        },
        get compressedSize() {
          return _compressedSize;
        },
        set compressedSize(val) {
          _compressedSize = uint32(val);
        },
        get size() {
          return _size;
        },
        set size(val) {
          _size = uint32(val);
        },
        get fileNameLength() {
          return _fnameLen;
        },
        set fileNameLength(val) {
          _fnameLen = val;
        },
        get extraLength() {
          return _extraLen;
        },
        set extraLength(val) {
          _extraLen = val;
        },
        get extraLocalLength() {
          return _localHeader.extraLen;
        },
        set extraLocalLength(val) {
          _localHeader.extraLen = val;
        },
        get commentLength() {
          return _comLen;
        },
        set commentLength(val) {
          _comLen = val;
        },
        get diskNumStart() {
          return _diskStart;
        },
        set diskNumStart(val) {
          _diskStart = uint32(val);
        },
        get inAttr() {
          return _inattr;
        },
        set inAttr(val) {
          _inattr = uint32(val);
        },
        get attr() {
          return _attr;
        },
        set attr(val) {
          _attr = uint32(val);
        },
        // get Unix file permissions
        get fileAttr() {
          return (_attr || 0) >> 16 & 4095;
        },
        get offset() {
          return _offset;
        },
        set offset(val) {
          _offset = uint32(val);
        },
        get encrypted() {
          return (_flags & Constants.FLG_ENC) === Constants.FLG_ENC;
        },
        get centralHeaderSize() {
          return Constants.CENHDR + _fnameLen + _extraLen + _comLen;
        },
        get realDataOffset() {
          return _offset + Constants.LOCHDR + _localHeader.fnameLen + _localHeader.extraLen;
        },
        get localHeader() {
          return _localHeader;
        },
        loadLocalHeaderFromBinary: function(input) {
          var data = input.slice(_offset, _offset + Constants.LOCHDR);
          if (data.readUInt32LE(0) !== Constants.LOCSIG) {
            throw Utils.Errors.INVALID_LOC();
          }
          _localHeader.version = data.readUInt16LE(Constants.LOCVER);
          _localHeader.flags = data.readUInt16LE(Constants.LOCFLG);
          _localHeader.flags_desc = (_localHeader.flags & Constants.FLG_DESC) > 0;
          _localHeader.method = data.readUInt16LE(Constants.LOCHOW);
          _localHeader.time = data.readUInt32LE(Constants.LOCTIM);
          _localHeader.crc = data.readUInt32LE(Constants.LOCCRC);
          _localHeader.compressedSize = data.readUInt32LE(Constants.LOCSIZ);
          _localHeader.size = data.readUInt32LE(Constants.LOCLEN);
          _localHeader.fnameLen = data.readUInt16LE(Constants.LOCNAM);
          _localHeader.extraLen = data.readUInt16LE(Constants.LOCEXT);
          const extraStart = _offset + Constants.LOCHDR + _localHeader.fnameLen;
          const extraEnd = extraStart + _localHeader.extraLen;
          return input.slice(extraStart, extraEnd);
        },
        loadFromBinary: function(data) {
          if (data.length !== Constants.CENHDR || data.readUInt32LE(0) !== Constants.CENSIG) {
            throw Utils.Errors.INVALID_CEN();
          }
          _verMade = data.readUInt16LE(Constants.CENVEM);
          _version = data.readUInt16LE(Constants.CENVER);
          _flags = data.readUInt16LE(Constants.CENFLG);
          _method = data.readUInt16LE(Constants.CENHOW);
          _time = data.readUInt32LE(Constants.CENTIM);
          _crc = data.readUInt32LE(Constants.CENCRC);
          _compressedSize = data.readUInt32LE(Constants.CENSIZ);
          _size = data.readUInt32LE(Constants.CENLEN);
          _fnameLen = data.readUInt16LE(Constants.CENNAM);
          _extraLen = data.readUInt16LE(Constants.CENEXT);
          _comLen = data.readUInt16LE(Constants.CENCOM);
          _diskStart = data.readUInt16LE(Constants.CENDSK);
          _inattr = data.readUInt16LE(Constants.CENATT);
          _attr = data.readUInt32LE(Constants.CENATX);
          _offset = data.readUInt32LE(Constants.CENOFF);
        },
        localHeaderToBinary: function() {
          var data = Buffer.alloc(Constants.LOCHDR);
          data.writeUInt32LE(Constants.LOCSIG, 0);
          data.writeUInt16LE(_version, Constants.LOCVER);
          data.writeUInt16LE(_flags & ~Constants.FLG_DESC, Constants.LOCFLG);
          data.writeUInt16LE(_method, Constants.LOCHOW);
          data.writeUInt32LE(_time, Constants.LOCTIM);
          data.writeUInt32LE(_crc, Constants.LOCCRC);
          data.writeUInt32LE(_compressedSize, Constants.LOCSIZ);
          data.writeUInt32LE(_size, Constants.LOCLEN);
          data.writeUInt16LE(_fnameLen, Constants.LOCNAM);
          data.writeUInt16LE(_localHeader.extraLen, Constants.LOCEXT);
          return data;
        },
        centralHeaderToBinary: function() {
          var data = Buffer.alloc(Constants.CENHDR + _fnameLen + _extraLen + _comLen);
          data.writeUInt32LE(Constants.CENSIG, 0);
          data.writeUInt16LE(_verMade, Constants.CENVEM);
          data.writeUInt16LE(_version, Constants.CENVER);
          data.writeUInt16LE(_flags & ~Constants.FLG_DESC, Constants.CENFLG);
          data.writeUInt16LE(_method, Constants.CENHOW);
          data.writeUInt32LE(_time, Constants.CENTIM);
          data.writeUInt32LE(_crc, Constants.CENCRC);
          data.writeUInt32LE(_compressedSize, Constants.CENSIZ);
          data.writeUInt32LE(_size, Constants.CENLEN);
          data.writeUInt16LE(_fnameLen, Constants.CENNAM);
          data.writeUInt16LE(_extraLen, Constants.CENEXT);
          data.writeUInt16LE(_comLen, Constants.CENCOM);
          data.writeUInt16LE(_diskStart, Constants.CENDSK);
          data.writeUInt16LE(_inattr, Constants.CENATT);
          data.writeUInt32LE(_attr, Constants.CENATX);
          data.writeUInt32LE(_offset, Constants.CENOFF);
          return data;
        },
        toJSON: function() {
          const bytes = function(nr) {
            return nr + " bytes";
          };
          return {
            made: _verMade,
            version: _version,
            flags: _flags,
            method: Utils.methodToString(_method),
            time: this.time,
            crc: "0x" + _crc.toString(16).toUpperCase(),
            compressedSize: bytes(_compressedSize),
            size: bytes(_size),
            fileNameLength: bytes(_fnameLen),
            extraLength: bytes(_extraLen),
            commentLength: bytes(_comLen),
            diskNumStart: _diskStart,
            inAttr: _inattr,
            attr: _attr,
            offset: _offset,
            centralHeaderSize: bytes(Constants.CENHDR + _fnameLen + _extraLen + _comLen)
          };
        },
        toString: function() {
          return JSON.stringify(this.toJSON(), null, "	");
        }
      };
    };
  }
});

// ../node_modules/adm-zip/headers/mainHeader.js
var require_mainHeader = __commonJS({
  "../node_modules/adm-zip/headers/mainHeader.js"(exports, module) {
    var Utils = require_util();
    var Constants = Utils.Constants;
    module.exports = function() {
      var _volumeEntries = 0, _totalEntries = 0, _size = 0, _offset = 0, _commentLength = 0;
      const needsZip64 = () => _volumeEntries > Constants.EF_ZIP64_OR_16 || _totalEntries > Constants.EF_ZIP64_OR_16 || _size > Constants.EF_ZIP64_OR_32 || _offset > Constants.EF_ZIP64_OR_32;
      return {
        get diskEntries() {
          return _volumeEntries;
        },
        set diskEntries(val) {
          _volumeEntries = _totalEntries = val;
        },
        get totalEntries() {
          return _totalEntries;
        },
        set totalEntries(val) {
          _totalEntries = _volumeEntries = val;
        },
        get size() {
          return _size;
        },
        set size(val) {
          _size = val;
        },
        get offset() {
          return _offset;
        },
        set offset(val) {
          _offset = val;
        },
        get commentLength() {
          return _commentLength;
        },
        set commentLength(val) {
          _commentLength = val;
        },
        get mainHeaderSize() {
          return (needsZip64() ? Constants.ZIP64HDR + Constants.END64HDR : 0) + Constants.ENDHDR + _commentLength;
        },
        loadFromBinary: function(data) {
          if ((data.length !== Constants.ENDHDR || data.readUInt32LE(0) !== Constants.ENDSIG) && (data.length < Constants.ZIP64HDR || data.readUInt32LE(0) !== Constants.ZIP64SIG)) {
            throw Utils.Errors.INVALID_END();
          }
          if (data.readUInt32LE(0) === Constants.ENDSIG) {
            _volumeEntries = data.readUInt16LE(Constants.ENDSUB);
            _totalEntries = data.readUInt16LE(Constants.ENDTOT);
            _size = data.readUInt32LE(Constants.ENDSIZ);
            _offset = data.readUInt32LE(Constants.ENDOFF);
            _commentLength = data.readUInt16LE(Constants.ENDCOM);
          } else {
            _volumeEntries = Utils.readBigUInt64LE(data, Constants.ZIP64SUB);
            _totalEntries = Utils.readBigUInt64LE(data, Constants.ZIP64TOT);
            _size = Utils.readBigUInt64LE(data, Constants.ZIP64SIZB);
            _offset = Utils.readBigUInt64LE(data, Constants.ZIP64OFF);
            _commentLength = 0;
          }
        },
        toBinary: function() {
          if (!needsZip64()) {
            var b = Buffer.alloc(Constants.ENDHDR + _commentLength);
            b.writeUInt32LE(Constants.ENDSIG, 0);
            b.writeUInt32LE(0, 4);
            b.writeUInt16LE(_volumeEntries, Constants.ENDSUB);
            b.writeUInt16LE(_totalEntries, Constants.ENDTOT);
            b.writeUInt32LE(_size, Constants.ENDSIZ);
            b.writeUInt32LE(_offset, Constants.ENDOFF);
            b.writeUInt16LE(_commentLength, Constants.ENDCOM);
            b.fill(" ", Constants.ENDHDR);
            return b;
          }
          var b = Buffer.alloc(this.mainHeaderSize);
          let offset = 0;
          b.writeUInt32LE(Constants.ZIP64SIG, offset);
          Utils.writeBigUInt64LE(b, Constants.ZIP64HDR - Constants.ZIP64LEAD, offset + Constants.ZIP64SIZE);
          b.writeUInt16LE(45, offset + Constants.ZIP64VEM);
          b.writeUInt16LE(45, offset + Constants.ZIP64VER);
          b.writeUInt32LE(0, offset + Constants.ZIP64DSK);
          b.writeUInt32LE(0, offset + Constants.ZIP64DSKDIR);
          Utils.writeBigUInt64LE(b, _volumeEntries, offset + Constants.ZIP64SUB);
          Utils.writeBigUInt64LE(b, _totalEntries, offset + Constants.ZIP64TOT);
          Utils.writeBigUInt64LE(b, _size, offset + Constants.ZIP64SIZB);
          Utils.writeBigUInt64LE(b, _offset, offset + Constants.ZIP64OFF);
          const zip64EndOffset = _offset + _size;
          offset += Constants.ZIP64HDR;
          b.writeUInt32LE(Constants.END64SIG, offset);
          b.writeUInt32LE(0, offset + Constants.END64START);
          Utils.writeBigUInt64LE(b, zip64EndOffset, offset + Constants.END64OFF);
          b.writeUInt32LE(1, offset + Constants.END64NUMDISKS);
          offset += Constants.END64HDR;
          b.writeUInt32LE(Constants.ENDSIG, offset);
          b.writeUInt32LE(0, offset + 4);
          b.writeUInt16LE(Math.min(_volumeEntries, Constants.EF_ZIP64_OR_16), offset + Constants.ENDSUB);
          b.writeUInt16LE(Math.min(_totalEntries, Constants.EF_ZIP64_OR_16), offset + Constants.ENDTOT);
          b.writeUInt32LE(Math.min(_size, Constants.EF_ZIP64_OR_32), offset + Constants.ENDSIZ);
          b.writeUInt32LE(Math.min(_offset, Constants.EF_ZIP64_OR_32), offset + Constants.ENDOFF);
          b.writeUInt16LE(_commentLength, offset + Constants.ENDCOM);
          b.fill(" ", offset + Constants.ENDHDR);
          return b;
        },
        toJSON: function() {
          const offset = function(nr, len) {
            let offs = nr.toString(16).toUpperCase();
            while (offs.length < len) offs = "0" + offs;
            return "0x" + offs;
          };
          return {
            diskEntries: _volumeEntries,
            totalEntries: _totalEntries,
            size: _size + " bytes",
            offset: offset(_offset, 4),
            commentLength: _commentLength
          };
        },
        toString: function() {
          return JSON.stringify(this.toJSON(), null, "	");
        }
      };
    };
  }
});

// ../node_modules/adm-zip/headers/index.js
var require_headers = __commonJS({
  "../node_modules/adm-zip/headers/index.js"(exports) {
    exports.EntryHeader = require_entryHeader();
    exports.MainHeader = require_mainHeader();
  }
});

// ../node_modules/adm-zip/methods/deflater.js
var require_deflater = __commonJS({
  "../node_modules/adm-zip/methods/deflater.js"(exports, module) {
    module.exports = function(inbuf) {
      var zlib = __require("zlib");
      var opts = { chunkSize: (parseInt(inbuf.length / 1024) + 1) * 1024 };
      return {
        deflate: function() {
          return zlib.deflateRawSync(inbuf, opts);
        },
        deflateAsync: function(callback) {
          var tmp = zlib.createDeflateRaw(opts), parts = [], total = 0;
          tmp.on("data", function(data) {
            parts.push(data);
            total += data.length;
          });
          tmp.on("end", function() {
            var buf = Buffer.alloc(total), written = 0;
            buf.fill(0);
            for (var i = 0; i < parts.length; i++) {
              var part = parts[i];
              part.copy(buf, written);
              written += part.length;
            }
            callback && callback(buf);
          });
          tmp.end(inbuf);
        }
      };
    };
  }
});

// ../node_modules/adm-zip/methods/inflater.js
var require_inflater = __commonJS({
  "../node_modules/adm-zip/methods/inflater.js"(exports, module) {
    var version = +(process?.versions?.node ?? "").split(".")[0] || 0;
    module.exports = function(inbuf, expectedLength) {
      var zlib = __require("zlib");
      const option = version >= 15 && expectedLength > 0 ? { maxOutputLength: expectedLength } : {};
      return {
        inflate: function() {
          return zlib.inflateRawSync(inbuf, option);
        },
        inflateAsync: function(callback) {
          var tmp = zlib.createInflateRaw(option), parts = [], total = 0;
          tmp.on("data", function(data) {
            parts.push(data);
            total += data.length;
          });
          tmp.on("end", function() {
            var buf = Buffer.alloc(total), written = 0;
            buf.fill(0);
            for (var i = 0; i < parts.length; i++) {
              var part = parts[i];
              part.copy(buf, written);
              written += part.length;
            }
            callback && callback(buf);
          });
          tmp.end(inbuf);
        }
      };
    };
  }
});

// ../node_modules/adm-zip/methods/zipcrypto.js
var require_zipcrypto = __commonJS({
  "../node_modules/adm-zip/methods/zipcrypto.js"(exports, module) {
    "use strict";
    var { randomFillSync } = __require("crypto");
    var Errors = require_errors();
    var crctable = new Uint32Array(256).map((t, crc) => {
      for (let j = 0; j < 8; j++) {
        if (0 !== (crc & 1)) {
          crc = crc >>> 1 ^ 3988292384;
        } else {
          crc >>>= 1;
        }
      }
      return crc >>> 0;
    });
    var uMul = (a, b) => Math.imul(a, b) >>> 0;
    var crc32update = (pCrc32, bval) => {
      return crctable[(pCrc32 ^ bval) & 255] ^ pCrc32 >>> 8;
    };
    var genSalt = () => {
      if ("function" === typeof randomFillSync) {
        return randomFillSync(Buffer.alloc(12));
      } else {
        return genSalt.node();
      }
    };
    genSalt.node = () => {
      const salt = Buffer.alloc(12);
      const len = salt.length;
      for (let i = 0; i < len; i++) salt[i] = Math.random() * 256 & 255;
      return salt;
    };
    var config = {
      genSalt
    };
    function Initkeys(pw) {
      const pass = Buffer.isBuffer(pw) ? pw : Buffer.from(pw);
      this.keys = new Uint32Array([305419896, 591751049, 878082192]);
      for (let i = 0; i < pass.length; i++) {
        this.updateKeys(pass[i]);
      }
    }
    Initkeys.prototype.updateKeys = function(byteValue) {
      const keys = this.keys;
      keys[0] = crc32update(keys[0], byteValue);
      keys[1] += keys[0] & 255;
      keys[1] = uMul(keys[1], 134775813) + 1;
      keys[2] = crc32update(keys[2], keys[1] >>> 24);
      return byteValue;
    };
    Initkeys.prototype.next = function() {
      const k = (this.keys[2] | 2) >>> 0;
      return uMul(k, k ^ 1) >> 8 & 255;
    };
    function make_decrypter(pwd) {
      const keys = new Initkeys(pwd);
      return function(data) {
        const result = Buffer.alloc(data.length);
        let pos = 0;
        for (let c of data) {
          result[pos++] = keys.updateKeys(c ^ keys.next());
        }
        return result;
      };
    }
    function make_encrypter(pwd) {
      const keys = new Initkeys(pwd);
      return function(data, result, pos = 0) {
        if (!result) result = Buffer.alloc(data.length);
        for (let c of data) {
          const k = keys.next();
          result[pos++] = c ^ k;
          keys.updateKeys(c);
        }
        return result;
      };
    }
    function decrypt(data, header, pwd) {
      if (!data || !Buffer.isBuffer(data) || data.length < 12) {
        return Buffer.alloc(0);
      }
      const decrypter = make_decrypter(pwd);
      const salt = decrypter(data.slice(0, 12));
      const verifyByte = (header.flags & 8) === 8 ? header.timeHighByte : header.crc >>> 24;
      if (salt[11] !== verifyByte) {
        throw Errors.WRONG_PASSWORD();
      }
      return decrypter(data.slice(12));
    }
    function _salter(data) {
      if (Buffer.isBuffer(data) && data.length >= 12) {
        config.genSalt = function() {
          return data.slice(0, 12);
        };
      } else if (data === "node") {
        config.genSalt = genSalt.node;
      } else {
        config.genSalt = genSalt;
      }
    }
    function encrypt(data, header, pwd, oldlike = false) {
      if (data == null) data = Buffer.alloc(0);
      if (!Buffer.isBuffer(data)) data = Buffer.from(data.toString());
      const encrypter = make_encrypter(pwd);
      const salt = config.genSalt();
      salt[11] = header.crc >>> 24 & 255;
      if (oldlike) salt[10] = header.crc >>> 16 & 255;
      const result = Buffer.alloc(data.length + 12);
      encrypter(salt, result);
      return encrypter(data, result, 12);
    }
    module.exports = { decrypt, encrypt, _salter };
  }
});

// ../node_modules/adm-zip/methods/index.js
var require_methods = __commonJS({
  "../node_modules/adm-zip/methods/index.js"(exports) {
    exports.Deflater = require_deflater();
    exports.Inflater = require_inflater();
    exports.ZipCrypto = require_zipcrypto();
  }
});

// ../node_modules/adm-zip/zipEntry.js
var require_zipEntry = __commonJS({
  "../node_modules/adm-zip/zipEntry.js"(exports, module) {
    var Utils = require_util();
    var Headers = require_headers();
    var Constants = Utils.Constants;
    var Methods = require_methods();
    module.exports = function(options, input) {
      var _centralHeader = new Headers.EntryHeader(), _entryName = Buffer.alloc(0), _comment = Buffer.alloc(0), _isDirectory = false, uncompressedData = null, _extra = Buffer.alloc(0), _extralocal = Buffer.alloc(0), _efs = true;
      const opts = options;
      const decoder = typeof opts.decoder === "object" ? opts.decoder : Utils.decoder;
      _efs = decoder.hasOwnProperty("efs") ? decoder.efs : false;
      function getCompressedDataFromZip() {
        if (!input || !(input instanceof Uint8Array)) {
          return Buffer.alloc(0);
        }
        _extralocal = _centralHeader.loadLocalHeaderFromBinary(input);
        return input.slice(_centralHeader.realDataOffset, _centralHeader.realDataOffset + _centralHeader.compressedSize);
      }
      function crc32OK(data) {
        if (!_centralHeader.flags_desc && !_centralHeader.localHeader.flags_desc) {
          if (Utils.crc32(data) !== _centralHeader.localHeader.crc) {
            return false;
          }
        } else {
          const descriptor = {};
          const dataEndOffset = _centralHeader.realDataOffset + _centralHeader.compressedSize;
          if (input.readUInt32LE(dataEndOffset) == Constants.LOCSIG || input.readUInt32LE(dataEndOffset) == Constants.CENSIG) {
            throw Utils.Errors.DESCRIPTOR_NOT_EXIST();
          }
          if (input.readUInt32LE(dataEndOffset) == Constants.EXTSIG) {
            descriptor.crc = input.readUInt32LE(dataEndOffset + Constants.EXTCRC);
            descriptor.compressedSize = input.readUInt32LE(dataEndOffset + Constants.EXTSIZ);
            descriptor.size = input.readUInt32LE(dataEndOffset + Constants.EXTLEN);
          } else if (input.readUInt16LE(dataEndOffset + 12) === 19280) {
            descriptor.crc = input.readUInt32LE(dataEndOffset + Constants.EXTCRC - 4);
            descriptor.compressedSize = input.readUInt32LE(dataEndOffset + Constants.EXTSIZ - 4);
            descriptor.size = input.readUInt32LE(dataEndOffset + Constants.EXTLEN - 4);
          } else {
            throw Utils.Errors.DESCRIPTOR_UNKNOWN();
          }
          if (descriptor.compressedSize !== _centralHeader.compressedSize || descriptor.size !== _centralHeader.size || descriptor.crc !== _centralHeader.crc) {
            throw Utils.Errors.DESCRIPTOR_FAULTY();
          }
          if (Utils.crc32(data) !== descriptor.crc) {
            return false;
          }
        }
        return true;
      }
      function decompress(async, callback, pass) {
        if (typeof callback === "undefined" && typeof async === "string") {
          pass = async;
          async = void 0;
        }
        if (_isDirectory) {
          if (async && callback) {
            callback(Buffer.alloc(0), Utils.Errors.DIRECTORY_CONTENT_ERROR());
          }
          return Buffer.alloc(0);
        }
        var compressedData = getCompressedDataFromZip();
        if (compressedData.length === 0) {
          if (async && callback) callback(compressedData);
          return compressedData;
        }
        if (_centralHeader.encrypted) {
          if ("string" !== typeof pass && !Buffer.isBuffer(pass)) {
            throw Utils.Errors.INVALID_PASS_PARAM();
          }
          compressedData = Methods.ZipCrypto.decrypt(compressedData, _centralHeader, pass);
        }
        var data = Buffer.alloc(_centralHeader.size);
        switch (_centralHeader.method) {
          case Utils.Constants.STORED:
            compressedData.copy(data);
            if (!crc32OK(data)) {
              if (async && callback) callback(data, Utils.Errors.BAD_CRC());
              throw Utils.Errors.BAD_CRC();
            } else {
              if (async && callback) callback(data);
              return data;
            }
          case Utils.Constants.DEFLATED:
            var inflater = new Methods.Inflater(compressedData, _centralHeader.size);
            if (!async) {
              const result = inflater.inflate(data);
              result.copy(data, 0);
              if (!crc32OK(data)) {
                throw Utils.Errors.BAD_CRC(`"${decoder.decode(_entryName)}"`);
              }
              return data;
            } else {
              inflater.inflateAsync(function(result) {
                result.copy(result, 0);
                if (callback) {
                  if (!crc32OK(result)) {
                    callback(result, Utils.Errors.BAD_CRC());
                  } else {
                    callback(result);
                  }
                }
              });
            }
            break;
          default:
            if (async && callback) callback(Buffer.alloc(0), Utils.Errors.UNKNOWN_METHOD());
            throw Utils.Errors.UNKNOWN_METHOD();
        }
      }
      function compress(async, callback) {
        if ((!uncompressedData || !uncompressedData.length) && Buffer.isBuffer(input)) {
          if (async && callback) callback(getCompressedDataFromZip());
          return getCompressedDataFromZip();
        }
        if (uncompressedData.length && !_isDirectory) {
          var compressedData;
          switch (_centralHeader.method) {
            case Utils.Constants.STORED:
              _centralHeader.compressedSize = _centralHeader.size;
              compressedData = Buffer.alloc(uncompressedData.length);
              uncompressedData.copy(compressedData);
              if (async && callback) callback(compressedData);
              return compressedData;
            default:
            case Utils.Constants.DEFLATED:
              var deflater = new Methods.Deflater(uncompressedData);
              if (!async) {
                var deflated = deflater.deflate();
                _centralHeader.compressedSize = deflated.length;
                return deflated;
              } else {
                deflater.deflateAsync(function(data) {
                  compressedData = Buffer.alloc(data.length);
                  _centralHeader.compressedSize = data.length;
                  data.copy(compressedData);
                  callback && callback(compressedData);
                });
              }
              deflater = null;
              break;
          }
        } else if (async && callback) {
          callback(Buffer.alloc(0));
        } else {
          return Buffer.alloc(0);
        }
      }
      function readUInt64LE(buffer, offset) {
        return Utils.readBigUInt64LE(buffer, offset);
      }
      function parseExtra(data) {
        try {
          var offset = 0;
          var signature, size, part;
          while (offset + 4 < data.length) {
            signature = data.readUInt16LE(offset);
            offset += 2;
            size = data.readUInt16LE(offset);
            offset += 2;
            part = data.slice(offset, offset + size);
            offset += size;
            if (Constants.ID_ZIP64 === signature) {
              parseZip64ExtendedInformation(part);
            }
          }
        } catch (error) {
          throw Utils.Errors.EXTRA_FIELD_PARSE_ERROR();
        }
      }
      function parseZip64ExtendedInformation(data) {
        var size, compressedSize, offset, diskNumStart;
        if (data.length >= Constants.EF_ZIP64_SCOMP) {
          size = readUInt64LE(data, Constants.EF_ZIP64_SUNCOMP);
          if (_centralHeader.size === Constants.EF_ZIP64_OR_32) {
            _centralHeader.size = size;
          }
        }
        if (data.length >= Constants.EF_ZIP64_RHO) {
          compressedSize = readUInt64LE(data, Constants.EF_ZIP64_SCOMP);
          if (_centralHeader.compressedSize === Constants.EF_ZIP64_OR_32) {
            _centralHeader.compressedSize = compressedSize;
          }
        }
        if (data.length >= Constants.EF_ZIP64_DSN) {
          offset = readUInt64LE(data, Constants.EF_ZIP64_RHO);
          if (_centralHeader.offset === Constants.EF_ZIP64_OR_32) {
            _centralHeader.offset = offset;
          }
        }
        if (data.length >= Constants.EF_ZIP64_DSN + 4) {
          diskNumStart = data.readUInt32LE(Constants.EF_ZIP64_DSN);
          if (_centralHeader.diskNumStart === Constants.EF_ZIP64_OR_16) {
            _centralHeader.diskNumStart = diskNumStart;
          }
        }
      }
      return {
        get entryName() {
          return decoder.decode(_entryName);
        },
        get rawEntryName() {
          return _entryName;
        },
        set entryName(val) {
          _entryName = Utils.toBuffer(val, decoder.encode);
          var lastChar = _entryName[_entryName.length - 1];
          _isDirectory = lastChar === 47 || lastChar === 92;
          _centralHeader.fileNameLength = _entryName.length;
        },
        get efs() {
          if (typeof _efs === "function") {
            return _efs(this.entryName);
          } else {
            return _efs;
          }
        },
        get extra() {
          return _extra;
        },
        set extra(val) {
          _extra = val;
          _centralHeader.extraLength = val.length;
          parseExtra(val);
        },
        get comment() {
          return decoder.decode(_comment);
        },
        set comment(val) {
          _comment = Utils.toBuffer(val, decoder.encode);
          _centralHeader.commentLength = _comment.length;
          if (_comment.length > 65535) throw Utils.Errors.COMMENT_TOO_LONG();
        },
        get name() {
          var n = decoder.decode(_entryName);
          return _isDirectory ? n.substr(n.length - 1).split("/").pop() : n.split("/").pop();
        },
        get isDirectory() {
          return _isDirectory;
        },
        getCompressedData: function() {
          return compress(false, null);
        },
        getCompressedDataAsync: function(callback) {
          compress(true, callback);
        },
        setData: function(value) {
          uncompressedData = Utils.toBuffer(value, Utils.decoder.encode);
          if (!_isDirectory && uncompressedData.length) {
            _centralHeader.size = uncompressedData.length;
            _centralHeader.method = Utils.Constants.DEFLATED;
            _centralHeader.crc = Utils.crc32(value);
            _centralHeader.changed = true;
          } else {
            _centralHeader.method = Utils.Constants.STORED;
          }
        },
        getData: function(pass) {
          if (_centralHeader.changed) {
            return uncompressedData;
          } else {
            return decompress(false, null, pass);
          }
        },
        getDataAsync: function(callback, pass) {
          if (_centralHeader.changed) {
            callback(uncompressedData);
          } else {
            decompress(true, callback, pass);
          }
        },
        set attr(attr) {
          _centralHeader.attr = attr;
        },
        get attr() {
          return _centralHeader.attr;
        },
        set header(data) {
          _centralHeader.loadFromBinary(data);
        },
        get header() {
          return _centralHeader;
        },
        packCentralHeader: function() {
          _centralHeader.flags_efs = this.efs;
          _centralHeader.extraLength = _extra.length;
          var header = _centralHeader.centralHeaderToBinary();
          var addpos = Utils.Constants.CENHDR;
          _entryName.copy(header, addpos);
          addpos += _entryName.length;
          _extra.copy(header, addpos);
          addpos += _centralHeader.extraLength;
          _comment.copy(header, addpos);
          return header;
        },
        packLocalHeader: function() {
          let addpos = 0;
          _centralHeader.flags_efs = this.efs;
          _centralHeader.extraLocalLength = _extralocal.length;
          const localHeaderBuf = _centralHeader.localHeaderToBinary();
          const localHeader = Buffer.alloc(localHeaderBuf.length + _entryName.length + _centralHeader.extraLocalLength);
          localHeaderBuf.copy(localHeader, addpos);
          addpos += localHeaderBuf.length;
          _entryName.copy(localHeader, addpos);
          addpos += _entryName.length;
          _extralocal.copy(localHeader, addpos);
          addpos += _extralocal.length;
          return localHeader;
        },
        toJSON: function() {
          const bytes = function(nr) {
            return "<" + (nr && nr.length + " bytes buffer" || "null") + ">";
          };
          return {
            entryName: this.entryName,
            name: this.name,
            comment: this.comment,
            isDirectory: this.isDirectory,
            header: _centralHeader.toJSON(),
            compressedData: bytes(input),
            data: bytes(uncompressedData)
          };
        },
        toString: function() {
          return JSON.stringify(this.toJSON(), null, "	");
        }
      };
    };
  }
});

// ../node_modules/adm-zip/zipFile.js
var require_zipFile = __commonJS({
  "../node_modules/adm-zip/zipFile.js"(exports, module) {
    var ZipEntry = require_zipEntry();
    var Headers = require_headers();
    var Utils = require_util();
    module.exports = function(inBuffer, options) {
      var entryList = [], entryTable = {}, _comment = Buffer.alloc(0), mainHeader = new Headers.MainHeader(), loadedEntries = false;
      var password = null;
      const temporary = /* @__PURE__ */ new Set();
      const opts = options;
      const { noSort, decoder } = opts;
      if (inBuffer) {
        readMainHeader(opts.readEntries);
      } else {
        loadedEntries = true;
      }
      function makeTemporaryFolders() {
        const foldersList = /* @__PURE__ */ new Set();
        for (const elem of Object.keys(entryTable)) {
          const elements = elem.split("/");
          elements.pop();
          if (!elements.length) continue;
          for (let i = 0; i < elements.length; i++) {
            const sub = elements.slice(0, i + 1).join("/") + "/";
            foldersList.add(sub);
          }
        }
        for (const elem of foldersList) {
          if (!(elem in entryTable)) {
            const tempfolder = new ZipEntry(opts);
            tempfolder.entryName = elem;
            tempfolder.attr = 16;
            tempfolder.temporary = true;
            entryList.push(tempfolder);
            entryTable[tempfolder.entryName] = tempfolder;
            temporary.add(tempfolder);
          }
        }
      }
      function readEntries() {
        loadedEntries = true;
        entryTable = {};
        if (mainHeader.diskEntries > (inBuffer.length - mainHeader.offset) / Utils.Constants.CENHDR) {
          throw Utils.Errors.DISK_ENTRY_TOO_LARGE();
        }
        entryList = new Array(mainHeader.diskEntries);
        var index = mainHeader.offset;
        for (var i = 0; i < entryList.length; i++) {
          var tmp = index, entry = new ZipEntry(opts, inBuffer);
          entry.header = inBuffer.slice(tmp, tmp += Utils.Constants.CENHDR);
          entry.entryName = inBuffer.slice(tmp, tmp += entry.header.fileNameLength);
          if (entry.header.extraLength) {
            entry.extra = inBuffer.slice(tmp, tmp += entry.header.extraLength);
          }
          if (entry.header.commentLength) entry.comment = inBuffer.slice(tmp, tmp + entry.header.commentLength);
          index += entry.header.centralHeaderSize;
          entryList[i] = entry;
          entryTable[entry.entryName] = entry;
        }
        temporary.clear();
        makeTemporaryFolders();
      }
      function readMainHeader(readNow) {
        var i = inBuffer.length - Utils.Constants.ENDHDR, max = Math.max(0, i - 65535), n = max, endStart = inBuffer.length, endOffset = -1, commentEnd = 0;
        const trailingSpace = typeof opts.trailingSpace === "boolean" ? opts.trailingSpace : false;
        if (trailingSpace) max = 0;
        for (i; i >= n; i--) {
          if (inBuffer[i] !== 80) continue;
          if (inBuffer.readUInt32LE(i) === Utils.Constants.ENDSIG) {
            endOffset = i;
            commentEnd = i;
            endStart = i + Utils.Constants.ENDHDR;
            n = i - Utils.Constants.END64HDR;
            continue;
          }
          if (inBuffer.readUInt32LE(i) === Utils.Constants.END64SIG) {
            n = max;
            continue;
          }
          if (inBuffer.readUInt32LE(i) === Utils.Constants.ZIP64SIG) {
            endOffset = i;
            endStart = i + Utils.readBigUInt64LE(inBuffer, i + Utils.Constants.ZIP64SIZE) + Utils.Constants.ZIP64LEAD;
            break;
          }
        }
        if (endOffset == -1) throw Utils.Errors.INVALID_FORMAT();
        mainHeader.loadFromBinary(inBuffer.slice(endOffset, endStart));
        if (mainHeader.commentLength) {
          _comment = inBuffer.slice(commentEnd + Utils.Constants.ENDHDR);
        }
        if (readNow) readEntries();
      }
      function sortEntries() {
        if (entryList.length > 1 && !noSort) {
          entryList.sort((a, b) => a.entryName.toLowerCase().localeCompare(b.entryName.toLowerCase()));
        }
      }
      return {
        /**
         * Returns an array of ZipEntry objects existent in the current opened archive
         * @return Array
         */
        get entries() {
          if (!loadedEntries) {
            readEntries();
          }
          return entryList.filter((e) => !temporary.has(e));
        },
        /**
         * Archive comment
         * @return {String}
         */
        get comment() {
          return decoder.decode(_comment);
        },
        set comment(val) {
          _comment = Utils.toBuffer(val, decoder.encode);
          mainHeader.commentLength = _comment.length;
        },
        getEntryCount: function() {
          if (!loadedEntries) {
            return mainHeader.diskEntries;
          }
          return entryList.length;
        },
        forEach: function(callback) {
          this.entries.forEach(callback);
        },
        /**
         * Returns a reference to the entry with the given name or null if entry is inexistent
         *
         * @param entryName
         * @return ZipEntry
         */
        getEntry: function(entryName) {
          if (!loadedEntries) {
            readEntries();
          }
          return entryTable[entryName] || null;
        },
        /**
         * Adds the given entry to the entry list
         *
         * @param entry
         */
        setEntry: function(entry) {
          if (!loadedEntries) {
            readEntries();
          }
          entryList.push(entry);
          entryTable[entry.entryName] = entry;
          mainHeader.totalEntries = entryList.length;
        },
        /**
         * Removes the file with the given name from the entry list.
         *
         * If the entry is a directory, then all nested files and directories will be removed
         * @param entryName
         * @returns {void}
         */
        deleteFile: function(entryName, withsubfolders = true) {
          if (!loadedEntries) {
            readEntries();
          }
          const entry = entryTable[entryName];
          const list = this.getEntryChildren(entry, withsubfolders).map((child) => child.entryName);
          list.forEach(this.deleteEntry);
        },
        /**
         * Removes the entry with the given name from the entry list.
         *
         * @param {string} entryName
         * @returns {void}
         */
        deleteEntry: function(entryName) {
          if (!loadedEntries) {
            readEntries();
          }
          const entry = entryTable[entryName];
          const index = entryList.indexOf(entry);
          if (index >= 0) {
            entryList.splice(index, 1);
            delete entryTable[entryName];
            mainHeader.totalEntries = entryList.length;
          }
        },
        /**
         *  Iterates and returns all nested files and directories of the given entry
         *
         * @param entry
         * @return Array
         */
        getEntryChildren: function(entry, subfolders = true) {
          if (!loadedEntries) {
            readEntries();
          }
          if (typeof entry === "object") {
            if (entry.isDirectory && subfolders) {
              const list = [];
              const name = entry.entryName;
              for (const zipEntry of entryList) {
                if (zipEntry.entryName.startsWith(name)) {
                  list.push(zipEntry);
                }
              }
              return list;
            } else {
              return [entry];
            }
          }
          return [];
        },
        /**
         *  How many child elements entry has
         *
         * @param {ZipEntry} entry
         * @return {integer}
         */
        getChildCount: function(entry) {
          if (entry && entry.isDirectory) {
            const list = this.getEntryChildren(entry);
            return list.includes(entry) ? list.length - 1 : list.length;
          }
          return 0;
        },
        /**
         * Returns the zip file
         *
         * @return Buffer
         */
        compressToBuffer: function() {
          if (!loadedEntries) {
            readEntries();
          }
          sortEntries();
          const dataBlock = [];
          const headerBlocks = [];
          let totalSize = 0;
          let dindex = 0;
          mainHeader.size = 0;
          mainHeader.offset = 0;
          let totalEntries = 0;
          for (const entry of this.entries) {
            const compressedData = entry.getCompressedData();
            entry.header.offset = dindex;
            const localHeader = entry.packLocalHeader();
            const dataLength = localHeader.length + compressedData.length;
            dindex += dataLength;
            dataBlock.push(localHeader);
            dataBlock.push(compressedData);
            const centralHeader = entry.packCentralHeader();
            headerBlocks.push(centralHeader);
            mainHeader.size += centralHeader.length;
            totalSize += dataLength + centralHeader.length;
            totalEntries++;
          }
          totalSize += mainHeader.mainHeaderSize;
          mainHeader.offset = dindex;
          mainHeader.totalEntries = totalEntries;
          dindex = 0;
          const outBuffer = Buffer.alloc(totalSize);
          for (const content of dataBlock) {
            content.copy(outBuffer, dindex);
            dindex += content.length;
          }
          for (const content of headerBlocks) {
            content.copy(outBuffer, dindex);
            dindex += content.length;
          }
          const mh = mainHeader.toBinary();
          if (_comment) {
            _comment.copy(mh, mh.length - _comment.length);
          }
          mh.copy(outBuffer, dindex);
          inBuffer = outBuffer;
          loadedEntries = false;
          return outBuffer;
        },
        toAsyncBuffer: function(onSuccess, onFail, onItemStart, onItemEnd) {
          try {
            if (!loadedEntries) {
              readEntries();
            }
            sortEntries();
            const dataBlock = [];
            const centralHeaders = [];
            let totalSize = 0;
            let dindex = 0;
            let totalEntries = 0;
            mainHeader.size = 0;
            mainHeader.offset = 0;
            const compress2Buffer = function(entryLists) {
              if (entryLists.length > 0) {
                const entry = entryLists.shift();
                const name = entry.entryName + entry.extra.toString();
                if (onItemStart) onItemStart(name);
                entry.getCompressedDataAsync(function(compressedData) {
                  if (onItemEnd) onItemEnd(name);
                  entry.header.offset = dindex;
                  const localHeader = entry.packLocalHeader();
                  const dataLength = localHeader.length + compressedData.length;
                  dindex += dataLength;
                  dataBlock.push(localHeader);
                  dataBlock.push(compressedData);
                  const centalHeader = entry.packCentralHeader();
                  centralHeaders.push(centalHeader);
                  mainHeader.size += centalHeader.length;
                  totalSize += dataLength + centalHeader.length;
                  totalEntries++;
                  compress2Buffer(entryLists);
                });
              } else {
                totalSize += mainHeader.mainHeaderSize;
                mainHeader.offset = dindex;
                mainHeader.totalEntries = totalEntries;
                dindex = 0;
                const outBuffer = Buffer.alloc(totalSize);
                dataBlock.forEach(function(content) {
                  content.copy(outBuffer, dindex);
                  dindex += content.length;
                });
                centralHeaders.forEach(function(content) {
                  content.copy(outBuffer, dindex);
                  dindex += content.length;
                });
                const mh = mainHeader.toBinary();
                if (_comment) {
                  _comment.copy(mh, mh.length - _comment.length);
                }
                mh.copy(outBuffer, dindex);
                inBuffer = outBuffer;
                loadedEntries = false;
                onSuccess(outBuffer);
              }
            };
            compress2Buffer(Array.from(this.entries));
          } catch (e) {
            onFail(e);
          }
        }
      };
    };
  }
});

// ../node_modules/adm-zip/adm-zip.js
var require_adm_zip = __commonJS({
  "../node_modules/adm-zip/adm-zip.js"(exports, module) {
    var Utils = require_util();
    var pth = __require("path");
    var ZipEntry = require_zipEntry();
    var ZipFile = require_zipFile();
    var get_Bool = (...val) => Utils.findLast(val, (c) => typeof c === "boolean");
    var get_Str = (...val) => Utils.findLast(val, (c) => typeof c === "string");
    var get_Fun = (...val) => Utils.findLast(val, (c) => typeof c === "function");
    var defaultOptions = {
      // option "noSort" : if true it disables files sorting
      noSort: false,
      // read entries during load (initial loading may be slower)
      readEntries: false,
      // default method is none
      method: Utils.Constants.NONE,
      // file system
      fs: null
    };
    module.exports = function(input, options) {
      let inBuffer = null;
      const opts = Object.assign(/* @__PURE__ */ Object.create(null), defaultOptions);
      if (input && "object" === typeof input) {
        if (!(input instanceof Uint8Array)) {
          Object.assign(opts, input);
          input = opts.input ? opts.input : void 0;
          if (opts.input) delete opts.input;
        }
        if (Buffer.isBuffer(input)) {
          inBuffer = input;
          opts.method = Utils.Constants.BUFFER;
          input = void 0;
        }
      }
      Object.assign(opts, options);
      const filetools = new Utils(opts);
      if (typeof opts.decoder !== "object" || typeof opts.decoder.encode !== "function" || typeof opts.decoder.decode !== "function") {
        opts.decoder = Utils.decoder;
      }
      if (input && "string" === typeof input) {
        if (filetools.fs.existsSync(input)) {
          opts.method = Utils.Constants.FILE;
          opts.filename = input;
          inBuffer = filetools.fs.readFileSync(input);
        } else {
          throw Utils.Errors.INVALID_FILENAME();
        }
      }
      const _zip = new ZipFile(inBuffer, opts);
      const { canonical, sanitize, zipnamefix } = Utils;
      function getEntry(entry) {
        if (entry && _zip) {
          var item;
          if (typeof entry === "string") item = _zip.getEntry(pth.posix.normalize(entry));
          if (typeof entry === "object" && typeof entry.entryName !== "undefined" && typeof entry.header !== "undefined") item = _zip.getEntry(entry.entryName);
          if (item) {
            return item;
          }
        }
        return null;
      }
      function fixPath(zipPath) {
        const { join, normalize, sep } = pth.posix;
        return join(pth.isAbsolute(zipPath) ? "/" : ".", normalize(sep + zipPath.split("\\").join(sep) + sep));
      }
      function filenameFilter(filterfn) {
        if (filterfn instanceof RegExp) {
          return /* @__PURE__ */ (function(rx) {
            return function(filename) {
              return rx.test(filename);
            };
          })(filterfn);
        } else if ("function" !== typeof filterfn) {
          return () => true;
        }
        return filterfn;
      }
      const relativePath = (local, entry) => {
        let lastChar = entry.slice(-1);
        lastChar = lastChar === filetools.sep ? filetools.sep : "";
        return pth.relative(local, entry) + lastChar;
      };
      return {
        /**
         * Extracts the given entry from the archive and returns the content as a Buffer object
         * @param {ZipEntry|string} entry ZipEntry object or String with the full path of the entry
         * @param {Buffer|string} [pass] - password
         * @return Buffer or Null in case of error
         */
        readFile: function(entry, pass) {
          var item = getEntry(entry);
          return item && item.getData(pass) || null;
        },
        /**
         * Returns how many child elements has on entry (directories) on files it is always 0
         * @param {ZipEntry|string} entry ZipEntry object or String with the full path of the entry
         * @returns {integer}
         */
        childCount: function(entry) {
          const item = getEntry(entry);
          if (item) {
            return _zip.getChildCount(item);
          }
        },
        /**
         * Asynchronous readFile
         * @param {ZipEntry|string} entry ZipEntry object or String with the full path of the entry
         * @param {callback} callback
         *
         * @return Buffer or Null in case of error
         */
        readFileAsync: function(entry, callback) {
          var item = getEntry(entry);
          if (item) {
            item.getDataAsync(callback);
          } else {
            callback(null, "getEntry failed for:" + entry);
          }
        },
        /**
         * Extracts the given entry from the archive and returns the content as plain text in the given encoding
         * @param {ZipEntry|string} entry - ZipEntry object or String with the full path of the entry
         * @param {string} encoding - Optional. If no encoding is specified utf8 is used
         *
         * @return String
         */
        readAsText: function(entry, encoding) {
          var item = getEntry(entry);
          if (item) {
            var data = item.getData();
            if (data && data.length) {
              return data.toString(encoding || "utf8");
            }
          }
          return "";
        },
        /**
         * Asynchronous readAsText
         * @param {ZipEntry|string} entry ZipEntry object or String with the full path of the entry
         * @param {callback} callback
         * @param {string} [encoding] - Optional. If no encoding is specified utf8 is used
         *
         * @return String
         */
        readAsTextAsync: function(entry, callback, encoding) {
          var item = getEntry(entry);
          if (item) {
            item.getDataAsync(function(data, err) {
              if (err) {
                callback(data, err);
                return;
              }
              if (data && data.length) {
                callback(data.toString(encoding || "utf8"));
              } else {
                callback("");
              }
            });
          } else {
            callback("");
          }
        },
        /**
         * Remove the entry from the file or the entry and all it's nested directories and files if the given entry is a directory
         *
         * @param {ZipEntry|string} entry
         * @param {boolean} withsubfolders
         * @returns {void}
         */
        deleteFile: function(entry, withsubfolders = true) {
          var item = getEntry(entry);
          if (item) {
            _zip.deleteFile(item.entryName, withsubfolders);
          }
        },
        /**
         * Remove the entry from the file or directory without affecting any nested entries
         *
         * @param {ZipEntry|string} entry
         * @returns {void}
         */
        deleteEntry: function(entry) {
          var item = getEntry(entry);
          if (item) {
            _zip.deleteEntry(item.entryName);
          }
        },
        /**
         * Adds a comment to the zip. The zip must be rewritten after adding the comment.
         *
         * @param {string} comment
         */
        addZipComment: function(comment) {
          _zip.comment = comment;
        },
        /**
         * Returns the zip comment
         *
         * @return String
         */
        getZipComment: function() {
          return _zip.comment || "";
        },
        /**
         * Adds a comment to a specified zipEntry. The zip must be rewritten after adding the comment
         * The comment cannot exceed 65535 characters in length
         *
         * @param {ZipEntry} entry
         * @param {string} comment
         */
        addZipEntryComment: function(entry, comment) {
          var item = getEntry(entry);
          if (item) {
            item.comment = comment;
          }
        },
        /**
         * Returns the comment of the specified entry
         *
         * @param {ZipEntry} entry
         * @return String
         */
        getZipEntryComment: function(entry) {
          var item = getEntry(entry);
          if (item) {
            return item.comment || "";
          }
          return "";
        },
        /**
         * Updates the content of an existing entry inside the archive. The zip must be rewritten after updating the content
         *
         * @param {ZipEntry} entry
         * @param {Buffer} content
         */
        updateFile: function(entry, content) {
          var item = getEntry(entry);
          if (item) {
            item.setData(content);
          }
        },
        /**
         * Adds a file from the disk to the archive
         *
         * @param {string} localPath File to add to zip
         * @param {string} [zipPath] Optional path inside the zip
         * @param {string} [zipName] Optional name for the file
         * @param {string} [comment] Optional file comment
         */
        addLocalFile: function(localPath, zipPath, zipName, comment) {
          if (filetools.fs.existsSync(localPath)) {
            zipPath = zipPath ? fixPath(zipPath) : "";
            const p = pth.win32.basename(pth.win32.normalize(localPath));
            zipPath += zipName ? zipName : p;
            const _attr = filetools.fs.statSync(localPath);
            const data = _attr.isFile() ? filetools.fs.readFileSync(localPath) : Buffer.alloc(0);
            if (_attr.isDirectory()) zipPath += filetools.sep;
            this.addFile(zipPath, data, comment, _attr);
          } else {
            throw Utils.Errors.FILE_NOT_FOUND(localPath);
          }
        },
        /**
         * Callback for showing if everything was done.
         *
         * @callback doneCallback
         * @param {Error} err - Error object
         * @param {boolean} done - was request fully completed
         */
        /**
         * Adds a file from the disk to the archive
         *
         * @param {(object|string)} options - options object, if it is string it us used as localPath.
         * @param {string} options.localPath - Local path to the file.
         * @param {string} [options.comment] - Optional file comment.
         * @param {string} [options.zipPath] - Optional path inside the zip
         * @param {string} [options.zipName] - Optional name for the file
         * @param {doneCallback} callback - The callback that handles the response.
         */
        addLocalFileAsync: function(options2, callback) {
          options2 = typeof options2 === "object" ? options2 : { localPath: options2 };
          const localPath = pth.resolve(options2.localPath);
          const { comment } = options2;
          let { zipPath, zipName } = options2;
          const self = this;
          filetools.fs.stat(localPath, function(err, stats) {
            if (err) return callback(err, false);
            zipPath = zipPath ? fixPath(zipPath) : "";
            const p = pth.win32.basename(pth.win32.normalize(localPath));
            zipPath += zipName ? zipName : p;
            if (stats.isFile()) {
              filetools.fs.readFile(localPath, function(err2, data) {
                if (err2) return callback(err2, false);
                self.addFile(zipPath, data, comment, stats);
                return setImmediate(callback, void 0, true);
              });
            } else if (stats.isDirectory()) {
              zipPath += filetools.sep;
              self.addFile(zipPath, Buffer.alloc(0), comment, stats);
              return setImmediate(callback, void 0, true);
            }
          });
        },
        /**
         * Adds a local directory and all its nested files and directories to the archive
         *
         * @param {string} localPath - local path to the folder
         * @param {string} [zipPath] - optional path inside zip
         * @param {(RegExp|function)} [filter] - optional RegExp or Function if files match will be included.
         */
        addLocalFolder: function(localPath, zipPath, filter) {
          filter = filenameFilter(filter);
          zipPath = zipPath ? fixPath(zipPath) : "";
          localPath = pth.normalize(localPath);
          if (filetools.fs.existsSync(localPath)) {
            const items = filetools.findFiles(localPath);
            const self = this;
            if (items.length) {
              for (const filepath of items) {
                const p = pth.join(zipPath, relativePath(localPath, filepath));
                if (filter(p)) {
                  self.addLocalFile(filepath, pth.dirname(p));
                }
              }
            }
          } else {
            throw Utils.Errors.FILE_NOT_FOUND(localPath);
          }
        },
        /**
         * Asynchronous addLocalFolder
         * @param {string} localPath
         * @param {callback} callback
         * @param {string} [zipPath] optional path inside zip
         * @param {RegExp|function} [filter] optional RegExp or Function if files match will
         *               be included.
         */
        addLocalFolderAsync: function(localPath, callback, zipPath, filter) {
          filter = filenameFilter(filter);
          zipPath = zipPath ? fixPath(zipPath) : "";
          localPath = pth.normalize(localPath);
          var self = this;
          filetools.fs.open(localPath, "r", function(err) {
            if (err && err.code === "ENOENT") {
              callback(void 0, Utils.Errors.FILE_NOT_FOUND(localPath));
            } else if (err) {
              callback(void 0, err);
            } else {
              var items = filetools.findFiles(localPath);
              var i = -1;
              var next = function() {
                i += 1;
                if (i < items.length) {
                  var filepath = items[i];
                  var p = relativePath(localPath, filepath).split("\\").join("/");
                  p = p.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, "");
                  if (filter(p)) {
                    filetools.fs.stat(filepath, function(er0, stats) {
                      if (er0) callback(void 0, er0);
                      if (stats.isFile()) {
                        filetools.fs.readFile(filepath, function(er1, data) {
                          if (er1) {
                            callback(void 0, er1);
                          } else {
                            self.addFile(zipPath + p, data, "", stats);
                            next();
                          }
                        });
                      } else {
                        self.addFile(zipPath + p + "/", Buffer.alloc(0), "", stats);
                        next();
                      }
                    });
                  } else {
                    process.nextTick(() => {
                      next();
                    });
                  }
                } else {
                  callback(true, void 0);
                }
              };
              next();
            }
          });
        },
        /**
         * Adds a local directory and all its nested files and directories to the archive
         *
         * @param {object | string} options - options object, if it is string it us used as localPath.
         * @param {string} options.localPath - Local path to the folder.
         * @param {string} [options.zipPath] - optional path inside zip.
         * @param {RegExp|function} [options.filter] - optional RegExp or Function if files match will be included.
         * @param {function|string} [options.namefix] - optional function to help fix filename
         * @param {doneCallback} callback - The callback that handles the response.
         *
         */
        addLocalFolderAsync2: function(options2, callback) {
          const self = this;
          options2 = typeof options2 === "object" ? options2 : { localPath: options2 };
          const localPath = pth.resolve(fixPath(options2.localPath));
          let { zipPath, filter, namefix } = options2;
          if (filter instanceof RegExp) {
            filter = /* @__PURE__ */ (function(rx) {
              return function(filename) {
                return rx.test(filename);
              };
            })(filter);
          } else if ("function" !== typeof filter) {
            filter = function() {
              return true;
            };
          }
          zipPath = zipPath ? fixPath(zipPath) : "";
          if (namefix === "latin1") {
            namefix = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, "");
          }
          if (typeof namefix !== "function") namefix = (str) => str;
          const relPathFix = (entry) => pth.join(zipPath, namefix(relativePath(localPath, entry)));
          const fileNameFix = (entry) => pth.win32.basename(pth.win32.normalize(namefix(entry)));
          filetools.fs.open(localPath, "r", function(err) {
            if (err && err.code === "ENOENT") {
              callback(void 0, Utils.Errors.FILE_NOT_FOUND(localPath));
            } else if (err) {
              callback(void 0, err);
            } else {
              filetools.findFilesAsync(localPath, function(err2, fileEntries) {
                if (err2) return callback(err2);
                fileEntries = fileEntries.filter((dir) => filter(relPathFix(dir)));
                if (!fileEntries.length) callback(void 0, false);
                setImmediate(
                  fileEntries.reverse().reduce(function(next, entry) {
                    return function(err3, done) {
                      if (err3 || done === false) return setImmediate(next, err3, false);
                      self.addLocalFileAsync(
                        {
                          localPath: entry,
                          zipPath: pth.dirname(relPathFix(entry)),
                          zipName: fileNameFix(entry)
                        },
                        next
                      );
                    };
                  }, callback)
                );
              });
            }
          });
        },
        /**
         * Adds a local directory and all its nested files and directories to the archive
         *
         * @param {string} localPath - path where files will be extracted
         * @param {object} props - optional properties
         * @param {string} [props.zipPath] - optional path inside zip
         * @param {RegExp|function} [props.filter] - optional RegExp or Function if files match will be included.
         * @param {function|string} [props.namefix] - optional function to help fix filename
         */
        addLocalFolderPromise: function(localPath, props) {
          return new Promise((resolve, reject) => {
            this.addLocalFolderAsync2(Object.assign({ localPath }, props), (err, done) => {
              if (err) reject(err);
              if (done) resolve(this);
            });
          });
        },
        /**
         * Allows you to create a entry (file or directory) in the zip file.
         * If you want to create a directory the entryName must end in / and a null buffer should be provided.
         * Comment and attributes are optional
         *
         * @param {string} entryName
         * @param {Buffer | string} content - file content as buffer or utf8 coded string
         * @param {string} [comment] - file comment
         * @param {number | object} [attr] - number as unix file permissions, object as filesystem Stats object
         */
        addFile: function(entryName, content, comment, attr) {
          entryName = zipnamefix(entryName);
          let entry = getEntry(entryName);
          const update = entry != null;
          if (!update) {
            entry = new ZipEntry(opts);
            entry.entryName = entryName;
          }
          entry.comment = comment || "";
          const isStat = "object" === typeof attr && attr instanceof filetools.fs.Stats;
          if (isStat) {
            entry.header.time = attr.mtime;
          }
          var fileattr = entry.isDirectory ? 16 : 0;
          let unix = entry.isDirectory ? 16384 : 32768;
          if (isStat) {
            unix |= 4095 & attr.mode;
          } else if ("number" === typeof attr) {
            unix |= 4095 & attr;
          } else {
            unix |= entry.isDirectory ? 493 : 420;
          }
          fileattr = (fileattr | unix << 16) >>> 0;
          entry.attr = fileattr;
          entry.setData(content);
          if (!update) _zip.setEntry(entry);
          return entry;
        },
        /**
         * Returns an array of ZipEntry objects representing the files and folders inside the archive
         *
         * @param {string} [password]
         * @returns Array
         */
        getEntries: function(password) {
          _zip.password = password;
          return _zip ? _zip.entries : [];
        },
        /**
         * Returns a ZipEntry object representing the file or folder specified by ``name``.
         *
         * @param {string} name
         * @return ZipEntry
         */
        getEntry: function(name) {
          return getEntry(name);
        },
        getEntryCount: function() {
          return _zip.getEntryCount();
        },
        forEach: function(callback) {
          return _zip.forEach(callback);
        },
        /**
         * Extracts the given entry to the given targetPath
         * If the entry is a directory inside the archive, the entire directory and it's subdirectories will be extracted
         *
         * @param {string|ZipEntry} entry - ZipEntry object or String with the full path of the entry
         * @param {string} targetPath - Target folder where to write the file
         * @param {boolean} [maintainEntryPath=true] - If maintainEntryPath is true and the entry is inside a folder, the entry folder will be created in targetPath as well. Default is TRUE
         * @param {boolean} [overwrite=false] - If the file already exists at the target path, the file will be overwriten if this is true.
         * @param {boolean} [keepOriginalPermission=false] - The file will be set as the permission from the entry if this is true.
         * @param {string} [outFileName] - String If set will override the filename of the extracted file (Only works if the entry is a file)
         *
         * @return Boolean
         */
        extractEntryTo: function(entry, targetPath, maintainEntryPath, overwrite, keepOriginalPermission, outFileName) {
          overwrite = get_Bool(false, overwrite);
          keepOriginalPermission = get_Bool(false, keepOriginalPermission);
          maintainEntryPath = get_Bool(true, maintainEntryPath);
          outFileName = get_Str(keepOriginalPermission, outFileName);
          var item = getEntry(entry);
          if (!item) {
            throw Utils.Errors.NO_ENTRY();
          }
          var entryName = canonical(item.entryName);
          var target = sanitize(targetPath, outFileName && !item.isDirectory ? canonical(outFileName) : maintainEntryPath ? entryName : pth.basename(entryName));
          if (item.isDirectory) {
            var children = _zip.getEntryChildren(item);
            children.forEach(function(child) {
              if (child.isDirectory) return;
              var content2 = child.getData();
              if (!content2) {
                throw Utils.Errors.CANT_EXTRACT_FILE();
              }
              var name = canonical(child.entryName);
              var childName = sanitize(targetPath, maintainEntryPath ? name : pth.basename(name));
              const fileAttr2 = keepOriginalPermission ? child.header.fileAttr : void 0;
              filetools.writeFileTo(childName, content2, overwrite, fileAttr2);
            });
            return true;
          }
          var content = item.getData(_zip.password);
          if (!content) throw Utils.Errors.CANT_EXTRACT_FILE();
          if (filetools.fs.existsSync(target) && !overwrite) {
            throw Utils.Errors.CANT_OVERRIDE();
          }
          const fileAttr = keepOriginalPermission ? entry.header.fileAttr : void 0;
          filetools.writeFileTo(target, content, overwrite, fileAttr);
          return true;
        },
        /**
         * Test the archive
         * @param {string} [pass]
         */
        test: function(pass) {
          if (!_zip) {
            return false;
          }
          for (var entry of _zip.entries) {
            try {
              if (entry.isDirectory) {
                continue;
              }
              var content = _zip.entries[entry].getData(pass);
              if (!content) {
                return false;
              }
            } catch (err) {
              return false;
            }
          }
          return true;
        },
        /**
         * Extracts the entire archive to the given location
         *
         * @param {string} targetPath Target location
         * @param {boolean} [overwrite=false] If the file already exists at the target path, the file will be overwriten if this is true.
         *                  Default is FALSE
         * @param {boolean} [keepOriginalPermission=false] The file will be set as the permission from the entry if this is true.
         *                  Default is FALSE
         * @param {string|Buffer} [pass] password
         */
        extractAllTo: function(targetPath, overwrite, keepOriginalPermission, pass) {
          keepOriginalPermission = get_Bool(false, keepOriginalPermission);
          pass = get_Str(keepOriginalPermission, pass);
          overwrite = get_Bool(false, overwrite);
          if (!_zip) throw Utils.Errors.NO_ZIP();
          _zip.entries.forEach(function(entry) {
            var entryName = sanitize(targetPath, canonical(entry.entryName));
            if (entry.isDirectory) {
              filetools.makeDir(entryName);
              return;
            }
            var content = entry.getData(pass);
            if (!content) {
              throw Utils.Errors.CANT_EXTRACT_FILE();
            }
            const fileAttr = keepOriginalPermission ? entry.header.fileAttr : void 0;
            filetools.writeFileTo(entryName, content, overwrite, fileAttr);
            try {
              filetools.fs.utimesSync(entryName, entry.header.time, entry.header.time);
            } catch (err) {
              throw Utils.Errors.CANT_EXTRACT_FILE();
            }
          });
        },
        /**
         * Asynchronous extractAllTo
         *
         * @param {string} targetPath Target location
         * @param {boolean} [overwrite=false] If the file already exists at the target path, the file will be overwriten if this is true.
         *                  Default is FALSE
         * @param {boolean} [keepOriginalPermission=false] The file will be set as the permission from the entry if this is true.
         *                  Default is FALSE
         * @param {function} callback The callback will be executed when all entries are extracted successfully or any error is thrown.
         */
        extractAllToAsync: function(targetPath, overwrite, keepOriginalPermission, callback) {
          callback = get_Fun(overwrite, keepOriginalPermission, callback);
          keepOriginalPermission = get_Bool(false, keepOriginalPermission);
          overwrite = get_Bool(false, overwrite);
          if (!callback) {
            return new Promise((resolve, reject) => {
              this.extractAllToAsync(targetPath, overwrite, keepOriginalPermission, function(err) {
                if (err) {
                  reject(err);
                } else {
                  resolve(this);
                }
              });
            });
          }
          if (!_zip) {
            callback(Utils.Errors.NO_ZIP());
            return;
          }
          targetPath = pth.resolve(targetPath);
          const getPath = (entry) => sanitize(targetPath, pth.normalize(canonical(entry.entryName)));
          const getError = (msg, file) => new Error(msg + ': "' + file + '"');
          const dirEntries = [];
          const fileEntries = [];
          _zip.entries.forEach((e) => {
            if (e.isDirectory) {
              dirEntries.push(e);
            } else {
              fileEntries.push(e);
            }
          });
          for (const entry of dirEntries) {
            const dirPath = getPath(entry);
            const dirAttr = keepOriginalPermission ? entry.header.fileAttr : void 0;
            try {
              filetools.makeDir(dirPath);
              if (dirAttr) filetools.fs.chmodSync(dirPath, dirAttr);
              filetools.fs.utimesSync(dirPath, entry.header.time, entry.header.time);
            } catch (er) {
              callback(getError("Unable to create folder", dirPath));
            }
          }
          fileEntries.reverse().reduce(function(next, entry) {
            return function(err) {
              if (err) {
                next(err);
              } else {
                const entryName = pth.normalize(canonical(entry.entryName));
                const filePath = sanitize(targetPath, entryName);
                entry.getDataAsync(function(content, err_1) {
                  if (err_1) {
                    next(err_1);
                  } else if (!content) {
                    next(Utils.Errors.CANT_EXTRACT_FILE());
                  } else {
                    const fileAttr = keepOriginalPermission ? entry.header.fileAttr : void 0;
                    filetools.writeFileToAsync(filePath, content, overwrite, fileAttr, function(succ) {
                      if (!succ) {
                        next(getError("Unable to write file", filePath));
                      }
                      filetools.fs.utimes(filePath, entry.header.time, entry.header.time, function(err_2) {
                        if (err_2) {
                          next(getError("Unable to set times", filePath));
                        } else {
                          next();
                        }
                      });
                    });
                  }
                });
              }
            };
          }, callback)();
        },
        /**
         * Writes the newly created zip file to disk at the specified location or if a zip was opened and no ``targetFileName`` is provided, it will overwrite the opened zip
         *
         * @param {string} targetFileName
         * @param {function} callback
         */
        writeZip: function(targetFileName, callback) {
          if (arguments.length === 1) {
            if (typeof targetFileName === "function") {
              callback = targetFileName;
              targetFileName = "";
            }
          }
          if (!targetFileName && opts.filename) {
            targetFileName = opts.filename;
          }
          if (!targetFileName) return;
          var zipData = _zip.compressToBuffer();
          if (zipData) {
            var ok = filetools.writeFileTo(targetFileName, zipData, true);
            if (typeof callback === "function") callback(!ok ? new Error("failed") : null, "");
          }
        },
        /**
                 *
                 * @param {string} targetFileName
                 * @param {object} [props]
                 * @param {boolean} [props.overwrite=true] If the file already exists at the target path, the file will be overwriten if this is true.
                 * @param {boolean} [props.perm] The file will be set as the permission from the entry if this is true.
        
                 * @returns {Promise<void>}
                 */
        writeZipPromise: function(targetFileName, props) {
          const { overwrite, perm } = Object.assign({ overwrite: true }, props);
          return new Promise((resolve, reject) => {
            if (!targetFileName && opts.filename) targetFileName = opts.filename;
            if (!targetFileName) reject("ADM-ZIP: ZIP File Name Missing");
            this.toBufferPromise().then((zipData) => {
              const ret = (done) => done ? resolve(done) : reject("ADM-ZIP: Wasn't able to write zip file");
              filetools.writeFileToAsync(targetFileName, zipData, overwrite, perm, ret);
            }, reject);
          });
        },
        /**
         * @returns {Promise<Buffer>} A promise to the Buffer.
         */
        toBufferPromise: function() {
          return new Promise((resolve, reject) => {
            _zip.toAsyncBuffer(resolve, reject);
          });
        },
        /**
         * Returns the content of the entire zip file as a Buffer object
         *
         * @prop {function} [onSuccess]
         * @prop {function} [onFail]
         * @prop {function} [onItemStart]
         * @prop {function} [onItemEnd]
         * @returns {Buffer}
         */
        toBuffer: function(onSuccess, onFail, onItemStart, onItemEnd) {
          if (typeof onSuccess === "function") {
            _zip.toAsyncBuffer(onSuccess, onFail, onItemStart, onItemEnd);
            return null;
          }
          return _zip.compressToBuffer();
        }
      };
    };
  }
});

// cli.js
var import_adm_zip = __toESM(require_adm_zip(), 1);
import fs2 from "fs";
import path2 from "path";
import crypto from "crypto";
import os from "os";
import http from "http";
import { exec } from "child_process";
import { fileURLToPath as fileURLToPath2 } from "url";

// create.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
async function createPlugin(pluginName, options = {}) {
  if (!pluginName) {
    console.error("\u274C \u8BF7\u6307\u5B9A\u63D2\u4EF6\u540D\u79F0\u3002\u4F8B\u5982\uFF1Anode plugins-sdk/create.js my-timer-plugin");
    process.exit(1);
  }
  let rootDir = process.cwd();
  let isMonorepo = false;
  while (rootDir !== path.dirname(rootDir)) {
    if (fs.existsSync(path.join(rootDir, "plugins-dev")) && fs.existsSync(path.join(rootDir, "plugins-sdk"))) {
      isMonorepo = true;
      break;
    }
    rootDir = path.dirname(rootDir);
  }
  if (!isMonorepo) {
    rootDir = process.cwd();
    if (path.basename(rootDir) === "plugins-dev") {
      rootDir = path.dirname(rootDir);
    }
  }
  const targetDir = path.resolve(rootDir, "plugins-dev", pluginName);
  if (fs.existsSync(targetDir)) {
    console.error(`\u274C \u63D2\u4EF6\u76EE\u5F55\u5DF2\u5B58\u5728\uFF1A${targetDir}`);
    process.exit(1);
  }
  const sdkPkgPath = path.join(__dirname, "package.json");
  let sdkVersion = "^1.0.6";
  if (fs.existsSync(sdkPkgPath)) {
    try {
      const sdkPkg = JSON.parse(fs.readFileSync(sdkPkgPath, "utf8"));
      if (sdkPkg.version) {
        sdkVersion = `^${sdkPkg.version}`;
      }
    } catch (err) {
    }
  }
  const sdkDependencyValue = isMonorepo ? "file:../../plugins-sdk" : sdkVersion;
  console.log(`\u{1F680} \u6B63\u5728\u521B\u5EFA\u63D2\u4EF6 "${pluginName}" \u81F3: ${targetDir}...`);
  fs.mkdirSync(path.join(targetDir, "src"), { recursive: true });
  fs.mkdirSync(path.join(targetDir, "tests"), { recursive: true });
  const packageJson = {
    name: pluginName,
    version: "1.0.0",
    description: `\u4E3A\u8393\u8393\u5370\u8BB0\u6DFB\u52A0 ${pluginName} \u529F\u80FD\u7684\u81EA\u5B9A\u4E49\u63D2\u4EF6`,
    main: "src/index.js",
    type: "module",
    scripts: {
      "test": "vitest run"
    },
    devDependencies: {
      "vitest": "^1.0.0",
      "berrytrace-plugin-sdk": sdkDependencyValue
    }
  };
  fs.writeFileSync(
    path.join(targetDir, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );
  const cleanName = pluginName.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase();
  const deviceId = Math.floor(Math.random() * (1 << 10)) & 1023;
  const timePart = Date.now() & 1048575;
  const randomPart = Math.floor(Math.random() * (1 << 10)) & 1023;
  const uuid = timePart * 67108864 + deviceId * 65536 + randomPart;
  if (!options.id && !cleanName) {
    console.error(`\u274C \u63D2\u4EF6\u540D "${pluginName}" \u4E0D\u542B\u6709\u6548\u82F1\u6587\u5B57\u7B26\uFF0C\u65E0\u6CD5\u81EA\u52A8\u751F\u6210 ID\u3002`);
    console.error(`   \u8BF7\u4F7F\u7528 --id \u53C2\u6570\u663E\u5F0F\u6307\u5B9A\uFF0C\u4F8B\u5982\uFF1A--id com.berrytrace.plugin.${cleanName}-${uuid}`);
    process.exit(1);
  }
  const pluginId = options.id || `com.berrytrace.plugin.${cleanName}-${uuid}`;
  const namespace = cleanName;
  const pluginJson = {
    id: pluginId,
    name: pluginName.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    version: "1.0.0",
    description: `\u4E3A\u8393\u8393\u5370\u8BB0\u6DFB\u52A0 ${pluginName} \u529F\u80FD\u7684\u81EA\u5B9A\u4E49\u63D2\u4EF6\u3002`,
    namespace,
    category: "",
    type: "panel",
    main: "src/index.js",
    permissions: ["ai:inference", "context:active-app"],
    mcp: {
      tools: [
        {
          "name": `${pluginName.replace(/-/g, "_")}_run_action`,
          "description": "\u6267\u884C\u63D2\u4EF6\u63D0\u4F9B\u7684\u81EA\u5B9A\u4E49\u64CD\u4F5C",
          "inputSchema": {
            "type": "object",
            "properties": {
              "input": { "type": "string", "description": "\u547D\u4EE4\u6216\u8F93\u5165\u6587\u672C" }
            },
            "required": ["input"]
          }
        }
      ]
    }
  };
  fs.writeFileSync(
    path.join(targetDir, "plugin.json"),
    JSON.stringify(pluginJson, null, 2)
  );
  const testIndex = `import { vi, describe, it, expect, beforeEach, beforeAll } from 'vitest';

// \u521B\u5EFA Mock SDK
const mockSdk = {
  mcp: {
    registerToolHandler: vi.fn(),
  },
  ai: {
    chat: vi.fn().mockResolvedValue({
      content: 'AI \u603B\u7ED3\u7ED3\u679C',
    }),
  },
  storage: {
    kv: {
      get: vi.fn(),
      set: vi.fn(),
    },
  },
  filesystem: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
  },
};

// \u6CE8\u5165\u5168\u5C40 berrytrace \u5B9E\u4F8B\u4EE5\u8FDB\u884C\u5355\u6D4B
globalThis.berrytrace = mockSdk;

let activate;
let deactivate;

beforeAll(async () => {
  const module = await import('../src/index.js');
  activate = module.activate;
  deactivate = module.deactivate;
});

describe('Plugin Lifecycle & MCP Tool Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should register tool handler on activate', async () => {
    await activate();

    // \u9A8C\u8BC1\u662F\u5426\u6CE8\u518C\u4E86\u5BF9\u5E94\u540D\u79F0\u7684\u5DE5\u5177
    expect(mockSdk.mcp.registerToolHandler).toHaveBeenCalledWith(
      expect.stringContaining('${pluginName.replace(/-/g, "_")}_run_action'),
      expect.any(Function)
    );
  });

  it('should call tool handler and return correct content', async () => {
    await activate();

    // \u83B7\u53D6\u6CE8\u518C\u7684 handler
    const handler = mockSdk.mcp.registerToolHandler.mock.calls[0][1];
    const result = await handler({ input: '\u6D4B\u8BD5\u8F93\u5165' });

    // \u9A8C\u8BC1 AI \u662F\u5426\u88AB\u8C03\u7528\u4E86
    expect(mockSdk.ai.chat).toHaveBeenCalled();
    // \u9A8C\u8BC1\u8FD4\u56DE\u7ED3\u679C
    expect(result.content[0].text).toContain('\u6D4B\u8BD5\u8F93\u5165');
    expect(result.content[0].text).toContain('AI \u603B\u7ED3\u7ED3\u679C');
  });

  it('should cleanup on deactivate', async () => {
    await deactivate();
  });
});
`;
  fs.writeFileSync(path.join(targetDir, "tests", "index.test.js"), testIndex);
  const srcIndex = `const sdk = globalThis.berrytrace;

export async function activate() {
  console.log('\u{1F50C} \u63D2\u4EF6 "${pluginName}" \u5DF2\u6210\u529F\u6FC0\u6D3B\uFF01');

  // \u6CE8\u518C MCP \u5DE5\u5177\u5904\u7406\u5668
  sdk.mcp.registerToolHandler('${pluginName.replace(/-/g, "_")}_run_action', async (args) => {
    const input = String(args.input || '');
    console.log('[\u63D2\u4EF6] \u6536\u5230\u5DE5\u5177\u6267\u884C\u8BF7\u6C42\uFF0C\u8F93\u5165\u4E3A\uFF1A', input);

    // \u8C03\u7528\u5BBF\u4E3B AI \u6DA6\u8272\u603B\u7ED3\u56DE\u7B54
    const aiResponse = await sdk.ai.chat({
      messages: [
        {
          role: 'system',
          content: '\u4F60\u662F\u4E00\u4E2A\u8F85\u52A9\u63D2\u4EF6\u8FD0\u884C\u7684 AI \u52A9\u624B\u3002\u8BF7\u6F02\u4EAE\u5730\u603B\u7ED3\u7528\u6237\u7684\u8F93\u5165\u3002'
        },
        {
          role: 'user',
          content: input
        }
      ]
    });

    return {
      content: [
        {
          type: 'text',
          text: \`\u63D2\u4EF6\u5DF2\u5904\u7406\u8F93\u5165: "\${input}"\u3002\\n\\nAI \u6DA6\u8272\u603B\u7ED3: \\"\${aiResponse.content}\\"\`
        }
      ]
    };
  });
}

export async function deactivate() {
  console.log('\u{1F50C} \u63D2\u4EF6 "${pluginName}" \u5DF2\u505C\u7528\u3002');
}

// utilityProcess \u81EA\u52A8\u6267\u884C\u6FC0\u6D3B
activate().catch(err => {
  console.error('[\u63D2\u4EF6] Activation error:', err);
});
`;
  fs.writeFileSync(path.join(targetDir, "src", "index.js"), srcIndex);
  console.log(`
\u2705 \u63D2\u4EF6\u9879\u76EE\u521D\u59CB\u5316\u6210\u529F\uFF01

\u26A0\uFE0F  \u91CD\u8981\u63D0\u793A\uFF1A
   \u8BF7\u6253\u5F00\u5E76\u7F16\u8F91 "plugin.json"\uFF0C\u586B\u5199 "category" \u5B57\u6BB5\uFF08\u5206\u7C7B\uFF09\u3002
   \u60A8\u53EF\u4EE5\u8BBF\u95EE www.getdear.cn \u67E5\u8BE2\u6709\u54EA\u4E9B\u5206\u7C7B\u3002\u6B64\u5B57\u6BB5\u4E3A\u5FC5\u586B\u9879\uFF0C\u5982\u679C\u4E0D\u586B\u5199\u5C06\u65E0\u6CD5\u6210\u529F\u6253\u5305\u4E0A\u4F20\u63D2\u4EF6\u3002

\u540E\u7EED\u6B65\u9AA4\uFF1A
  1. cd plugins-dev/${pluginName}
  2. npm install
  3. npm run test

\u542F\u52A8\u8393\u8393\u5370\u8BB0\u4E3B\u5E94\u7528\u7A0B\u5E8F\u5373\u53EF\u81EA\u52A8\u52A0\u8F7D\u5E76\u6D4B\u8BD5\u8BE5\u63D2\u4EF6\u3002

--- AI AGENT OUTPUT (DO NOT REMOVE) ---
PLUGIN_ID=${pluginId}
PLUGIN_PATH=${targetDir}
PLUGIN_TYPE=panel
--- END AI AGENT OUTPUT ---
`);
}
var isDirectRun = process.argv[1] && (process.argv[1].endsWith("create.js") || process.argv[1].endsWith("create-berrytrace-plugin"));
if (isDirectRun) {
  const name = process.argv[2];
  const idIndex = process.argv.indexOf("--id");
  const id = idIndex !== -1 ? process.argv[idIndex + 1] : void 0;
  createPlugin(name, { id }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

// cli.js
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path2.dirname(__filename2);
var cliVersion = "unknown";
try {
  const pkgPath = path2.join(__dirname2, "../package.json");
  const pkg = JSON.parse(fs2.readFileSync(pkgPath, "utf8"));
  if (pkg.name === "berrytrace-plugin-sdk") {
    cliVersion = pkg.version;
  } else {
    throw new Error("Not the right package");
  }
} catch (e) {
  try {
    const pkgPath = path2.join(__dirname2, "./package.json");
    const pkg = JSON.parse(fs2.readFileSync(pkgPath, "utf8"));
    if (pkg.name === "berrytrace-plugin-sdk") {
      cliVersion = pkg.version;
    }
  } catch (e2) {
  }
}
function semverGt(v1, v2) {
  const a = v1.split(/[.-]/).map((x) => isNaN(x) ? x : Number(x));
  const b = v2.split(/[.-]/).map((x) => isNaN(x) ? x : Number(x));
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const va = a[i] === void 0 ? 0 : a[i];
    const vb = b[i] === void 0 ? 0 : b[i];
    if (typeof va === "number" && typeof vb === "number") {
      if (va > vb) return true;
      if (va < vb) return false;
    } else {
      if (va.toString() > vb.toString()) return true;
      if (va.toString() < vb.toString()) return false;
    }
  }
  return false;
}
function getUpdateConfigPath() {
  return path2.join(os.homedir(), ".berrytrace", "update.json");
}
function getLatestVersion() {
  return new Promise((resolve) => {
    exec("npm view berrytrace-plugin-sdk version", (err, stdout) => {
      if (!err && stdout) {
        const ver = stdout.trim();
        if (ver) {
          resolve(ver);
          return;
        }
      }
      const options = {
        hostname: "registry.npmjs.org",
        path: "/berrytrace-plugin-sdk/latest",
        method: "GET",
        headers: { "User-Agent": "berrytrace-cli" },
        timeout: 3e3
      };
      const req = http.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => data += chunk);
        res.on("end", () => {
          try {
            const pkg = JSON.parse(data);
            resolve(pkg.version || null);
          } catch (e) {
            resolve(null);
          }
        });
      });
      req.on("error", () => resolve(null));
      req.on("timeout", () => {
        req.destroy();
        resolve(null);
      });
      req.end();
    });
  });
}
function runUpgrade() {
  return new Promise((resolve, reject) => {
    console.log("\u{1F504} \u6B63\u5728\u5347\u7EA7 berrytrace-plugin-sdk...");
    exec("npm install -g berrytrace-plugin-sdk", (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
async function checkAndUpgrade(force = false) {
  if (__dirname2.includes("/work/work/") || __dirname2.includes("berrytrace_app")) {
    return;
  }
  const configPath = getUpdateConfigPath();
  let config = { lastCheck: 0, latestVersion: "" };
  if (fs2.existsSync(configPath)) {
    try {
      config = JSON.parse(fs2.readFileSync(configPath, "utf8"));
    } catch (e) {
    }
  }
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1e3;
  if (force || now - config.lastCheck > ONE_DAY) {
    const latest = await getLatestVersion();
    if (latest) {
      config.lastCheck = now;
      config.latestVersion = latest;
      try {
        fs2.mkdirSync(path2.dirname(configPath), { recursive: true });
        fs2.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
      } catch (e) {
      }
      if (semverGt(latest, cliVersion)) {
        console.log(`\u2728 \u53D1\u73B0\u65B0\u7248\u672C v${latest} (\u5F53\u524D\u7248\u672C v${cliVersion})`);
        try {
          await runUpgrade();
          console.log(`\u2713 \u81EA\u52A8\u5347\u7EA7\u6210\u529F\uFF01\u5F53\u524D\u7248\u672C\u5DF2\u66F4\u65B0\u4E3A v${latest}\u3002`);
          cliVersion = latest;
        } catch (err) {
          console.warn(`\u26A0\uFE0F \u81EA\u52A8\u5347\u7EA7\u5931\u8D25: ${err.message}`);
          console.warn("\u5EFA\u8BAE\u8FD0\u884C\u4EE5\u4E0B\u547D\u4EE4\u8FDB\u884C\u624B\u52A8\u5347\u7EA7\uFF1A");
          console.warn("  npm install -g berrytrace-plugin-sdk");
        }
      } else if (force) {
        console.log(`\u2713 \u5F53\u524D\u5DF2\u662F\u6700\u65B0\u7248\u672C v${cliVersion}\u3002`);
      }
    } else if (force) {
      console.error("\u274C \u68C0\u67E5\u66F4\u65B0\u5931\u8D25\uFF0C\u65E0\u6CD5\u8FDE\u63A5\u5230 npm \u6CE8\u518C\u8868\u3002");
    }
  }
}
function openBrowser(url) {
  const start = process.platform === "darwin" ? "open" : process.platform === "win32" ? 'start ""' : "xdg-open";
  exec(`${start} "${url}"`);
}
function getCanonicalPackageString(pluginId, version, files) {
  const sortedFiles = {};
  for (const key of Object.keys(files).sort()) {
    sortedFiles[key] = files[key];
  }
  const canonicalObj = {
    pluginId,
    version,
    files: sortedFiles
  };
  return JSON.stringify(canonicalObj);
}
function generateKeys(targetDir = process.cwd()) {
  console.log("\u6B63\u5728\u751F\u6210 ECDSA P-256 \u5BC6\u94A5\u5BF9...");
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ec", {
    namedCurve: "prime256v1",
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" }
  });
  const pubPath = path2.join(targetDir, "public_key.pem");
  const privPath = path2.join(targetDir, "private_key.pem");
  fs2.writeFileSync(pubPath, publicKey);
  fs2.writeFileSync(privPath, privateKey);
  console.log(`\u2713 \u516C\u94A5\u5DF2\u4FDD\u5B58\u81F3: ${pubPath}`);
  console.log(`\u2713 \u79C1\u94A5\u5DF2\u4FDD\u5B58\u81F3: ${privPath}`);
  const gitignorePath = path2.join(targetDir, ".gitignore");
  if (fs2.existsSync(gitignorePath)) {
    const gitignoreContent = fs2.readFileSync(gitignorePath, "utf8");
    if (!gitignoreContent.includes("private_key.pem")) {
      fs2.appendFileSync(gitignorePath, "\n# \u8393\u8393\u5370\u8BB0\u5F00\u53D1\u8005\u79C1\u94A5\nprivate_key.pem\n");
      console.log("\u2713 \u5DF2\u5C06 private_key.pem \u6DFB\u52A0\u81F3 .gitignore");
    }
  }
  console.log("\n==================================================");
  console.log("\u26A0\uFE0F  \u91CD\u8981\u5B89\u5168\u8B66\u544A\uFF1A");
  console.log('1. \u8BF7\u59A5\u5584\u4FDD\u7BA1\u60A8\u7684\u79C1\u94A5 "private_key.pem"\uFF0C\u5207\u52FF\u6CC4\u9732\u3002');
  console.log("   \u8BF7\u52FF\u5C06\u5176\u63D0\u4EA4\u5230 Git \u6216\u4E0A\u4F20\u5230\u4EFB\u4F55\u516C\u5F00\u7F51\u7EDC\u5E73\u53F0\u3002");
  console.log("2. \u6B64\u79C1\u94A5\u662F\u60A8\u540E\u7EED\u66F4\u65B0\u53D1\u5E03\u8BE5\u63D2\u4EF6\u7684\u552F\u4E00\u51ED\u8BC1\u3002");
  console.log("   \u4E00\u65E6\u4E22\u5931\uFF0C\u60A8\u5C06\u65E0\u6CD5\u4E3A\u540C\u4E00\u4E2A\u63D2\u4EF6 ID \u53D1\u5E03\u4EFB\u4F55\u65B0\u7248\u672C\u3002");
  console.log("==================================================\n");
  return { publicKey, privateKey };
}
async function performSdkBuild(pluginPath) {
  try {
    const pluginJsonPath = path2.join(pluginPath, "plugin.json");
    if (!fs2.existsSync(pluginJsonPath)) {
      console.error("\u274C \u672A\u627E\u5230 plugin.json \u6587\u4EF6");
      return false;
    }
    const pluginJson = JSON.parse(fs2.readFileSync(pluginJsonPath, "utf8"));
    const { id, main: main2, view } = pluginJson;
    console.log(`\u{1F528} \u6B63\u5728\u4F7F\u7528 BerryTrace SDK \u6784\u5EFA\u63D2\u4EF6 "${id}"...`);
    const { build } = await import("esbuild");
    const aliasPlugin = {
      name: "berrytrace-alias-plugin",
      setup(buildContext) {
        const getProjectRoot = () => {
          let curr = __dirname2;
          for (let i = 0; i < 8; i++) {
            if (fs2.existsSync(path2.resolve(curr, "src")) && fs2.existsSync(path2.resolve(curr, "electron"))) {
              return curr;
            }
            const parent = path2.dirname(curr);
            if (parent === curr) break;
            curr = parent;
          }
          if (fs2.existsSync(path2.resolve(__dirname2, "../src"))) return path2.resolve(__dirname2, "..");
          if (fs2.existsSync(path2.resolve(__dirname2, "../../src"))) return path2.resolve(__dirname2, "../..");
          return path2.resolve(__dirname2, "..");
        };
        const ROOT = getProjectRoot();
        buildContext.onResolve({ filter: /^@\// }, (args) => {
          const targetPath = path2.resolve(ROOT, "src", args.path.slice(2));
          const exts = ["", ".ts", ".tsx", ".js", ".jsx", "/index.ts", "/index.tsx", "/index.js", "/index.jsx"];
          for (const ext of exts) {
            const fullPath = targetPath + ext;
            if (fs2.existsSync(fullPath) && fs2.statSync(fullPath).isFile()) {
              return { path: fullPath };
            }
          }
          return { path: targetPath };
        });
      }
    };
    const defaultStubPlugin = {
      name: "berrytrace-stub-plugin",
      setup(buildContext) {
        buildContext.onResolve({ filter: /\.node$/ }, (args) => ({
          path: args.path,
          namespace: "node-stub"
        }));
        buildContext.onLoad({ filter: /.*/, namespace: "node-stub" }, () => ({
          contents: `module.exports = {}; export default null;`
        }));
        buildContext.onResolve({ filter: /^registry-js$/ }, () => ({
          path: "registry-js-stub",
          namespace: "stub-ns"
        }));
        buildContext.onLoad({ filter: /^registry-js-stub$/, namespace: "stub-ns" }, () => ({
          contents: `
            export const HKEY = {
              HKEY_LOCAL_MACHINE: 'HKLM',
              HKEY_CURRENT_USER: 'HKCU',
              HKEY_CLASSES_ROOT: 'HKCR',
              HKEY_CURRENT_CONFIG: 'HKCC',
              HKEY_USERS: 'HKU'
            };
            export function enumerateValuesSafe() { return []; }
            export default { HKEY, enumerateValuesSafe };
          `
        }));
        buildContext.onResolve({ filter: /^fsevents$/ }, () => ({
          path: "fsevents-stub",
          namespace: "stub-ns"
        }));
        buildContext.onLoad({ filter: /^fsevents-stub$/, namespace: "stub-ns" }, () => ({
          contents: `export default null;`
        }));
        buildContext.onResolve({ filter: /^chromium-bidi/ }, (args) => ({
          path: args.path + "-stub",
          namespace: "stub-ns"
        }));
        buildContext.onLoad({ filter: /-stub$/, namespace: "stub-ns" }, () => ({
          contents: `module.exports = {}; export default {};`
        }));
      }
    };
    const umdFixPlugin = {
      name: "berrytrace-umd-fix-plugin",
      setup(buildContext) {
        buildContext.onLoad({ filter: /node_modules\/.*\.js$/ }, async (args) => {
          const contents = await fs2.promises.readFile(args.path, "utf8");
          if (/function\s*\(require,\s*exports\)/.test(contents)) {
            const modified = contents.replace(/function\s*\(require,\s*exports\)/g, "function (__umd_require, exports)");
            return {
              contents: modified,
              loader: "js"
            };
          }
          return null;
        });
      }
    };
    if (main2) {
      const srcMain = main2.replace(/^dist\//, "src/").replace(/\.js$/, ".ts");
      const srcMainJs = main2.replace(/^dist\//, "src/");
      let entryPoint = path2.join(pluginPath, srcMain);
      if (!fs2.existsSync(entryPoint)) {
        entryPoint = path2.join(pluginPath, srcMainJs);
      }
      if (!fs2.existsSync(entryPoint)) {
        console.error(`\u274C \u672A\u627E\u5230 background \u5165\u53E3\u6587\u4EF6: ${entryPoint}`);
        return false;
      }
      console.log(`\u{1F4E6} \u6B63\u5728\u7F16\u8BD1 background \u5165\u53E3: ${entryPoint} -> ${main2}`);
      const pkgJsonPath = path2.join(pluginPath, "package.json");
      let dependencies = [];
      if (fs2.existsSync(pkgJsonPath)) {
        try {
          const pkg = JSON.parse(fs2.readFileSync(pkgJsonPath, "utf8"));
          dependencies = pkg.dependencies ? Object.keys(pkg.dependencies) : [];
        } catch (err) {
          console.warn("[Packager] Failed to parse package.json dependencies for build:", err);
        }
      }
      await build({
        entryPoints: [entryPoint],
        outfile: path2.join(pluginPath, main2),
        bundle: true,
        platform: "node",
        target: ["node20"],
        format: "esm",
        minify: false,
        allowOverwrite: true,
        mainFields: ["module", "main"],
        plugins: [defaultStubPlugin, umdFixPlugin],
        tsconfigRaw: {
          compilerOptions: {
            experimentalDecorators: true
          }
        },
        banner: {
          js: "import { createRequire as __createRequire } from 'module'; import { fileURLToPath as __fileURLToPath } from 'url'; import { dirname as __dirnamePolyfill } from 'path'; const require = __createRequire(import.meta.url); const __filename = __fileURLToPath(import.meta.url); const __dirname = __dirnamePolyfill(__filename);"
        },
        logLevel: "info",
        external: [
          "berrytrace-plugin-sdk",
          "sherpa-onnx-node",
          "electron",
          ...dependencies,
          ...dependencies.map((d) => `${d}/*`)
        ]
      });
    }
    if (view) {
      const srcViewTsx = view.replace(/^dist\//, "src/").replace(/\.js$/, ".tsx");
      const srcViewTs = view.replace(/^dist\//, "src/").replace(/\.js$/, ".ts");
      const srcViewJsx = view.replace(/^dist\//, "src/").replace(/\.js$/, ".jsx");
      const srcViewVanilla = view.replace(/^dist\//, "src/");
      let entryPoint = path2.join(pluginPath, srcViewTsx);
      if (!fs2.existsSync(entryPoint)) {
        entryPoint = path2.join(pluginPath, srcViewTs);
      }
      if (!fs2.existsSync(entryPoint)) {
        entryPoint = path2.join(pluginPath, srcViewJsx);
      }
      if (!fs2.existsSync(entryPoint)) {
        entryPoint = path2.join(pluginPath, srcViewVanilla);
      }
      if (!fs2.existsSync(entryPoint)) {
        console.error(`\u274C \u672A\u627E\u5230 view \u5165\u53E3\u6587\u4EF6: ${entryPoint}`);
        return false;
      }
      console.log(`\u{1F4E6} \u6B63\u5728\u7F16\u8BD1 view \u5165\u53E3: ${entryPoint} -> ${view}`);
      const cssPlugin = {
        name: "berrytrace-css-plugin",
        setup(buildContext) {
          buildContext.onResolve({ filter: /\.css$/ }, (args) => {
            let resolvedPath = "";
            if (args.path.startsWith(".") || args.path.startsWith("/") || path2.isAbsolute(args.path)) {
              resolvedPath = path2.resolve(args.resolveDir, args.path);
            } else {
              const getProjectRoot = () => {
                let curr = __dirname2;
                for (let i = 0; i < 8; i++) {
                  if (fs2.existsSync(path2.resolve(curr, "src")) && fs2.existsSync(path2.resolve(curr, "electron"))) {
                    return curr;
                  }
                  const parent = path2.dirname(curr);
                  if (parent === curr) break;
                  curr = parent;
                }
                if (fs2.existsSync(path2.resolve(__dirname2, "../src"))) return path2.resolve(__dirname2, "..");
                if (fs2.existsSync(path2.resolve(__dirname2, "../../src"))) return path2.resolve(__dirname2, "../..");
                return path2.resolve(__dirname2, "..");
              };
              const ROOT = getProjectRoot();
              const candidates = [
                path2.resolve(args.resolveDir, args.path),
                path2.resolve(pluginPath, "node_modules", args.path),
                path2.resolve(ROOT, "node_modules", args.path)
              ];
              try {
                resolvedPath = __require.resolve(args.path, { paths: [args.resolveDir, pluginPath, ROOT] });
              } catch (e) {
                resolvedPath = candidates.find((c) => fs2.existsSync(c)) || candidates[0];
              }
              if (!fs2.existsSync(resolvedPath)) {
                resolvedPath = candidates.find((c) => fs2.existsSync(c)) || resolvedPath;
              }
            }
            return {
              path: resolvedPath,
              namespace: "css-ns"
            };
          });
          buildContext.onLoad({ filter: /.*/, namespace: "css-ns" }, (args) => {
            const css = fs2.readFileSync(args.path, "utf-8").replace(/\s+/g, " ");
            return {
              contents: `const el = document.createElement('style'); el.textContent = ${JSON.stringify(css)}; document.head.appendChild(el); export default null;`,
              loader: "js"
            };
          });
        }
      };
      const globalSdkPlugin = {
        name: "berrytrace-global-sdk-plugin",
        setup(buildContext) {
          buildContext.onResolve({ filter: /^berrytrace-plugin-sdk$/ }, (args) => ({
            path: args.path,
            namespace: "global-sdk-ns"
          }));
          buildContext.onLoad({ filter: /.*/, namespace: "global-sdk-ns" }, () => {
            return {
              contents: `
                const sdk = (typeof window !== 'undefined' ? window : globalThis).berrytrace;
                export default sdk;
                export const createPluginSDK = sdk ? sdk.createPluginSDK : undefined;
                export const Plugin = sdk ? sdk.Plugin : undefined;
                export const View = sdk ? sdk.View : undefined;
              `,
              loader: "js"
            };
          });
        }
      };
      const globalReactPlugin = {
        name: "berrytrace-global-react-plugin",
        setup(buildContext) {
          buildContext.onResolve({ filter: /.*/ }, (args) => {
            const matches = ["react", "react-dom", "react-dom/client", "zustand", "lucide-react", "xterm", "xterm-addon-fit", "react-tooltip", "framer-motion", "motion"];
            if (matches.includes(args.path) || args.path.startsWith("react/") || args.path.startsWith("react-dom/")) {
              return { path: args.path, namespace: "global-react-ns" };
            }
            return null;
          });
          buildContext.onLoad({ filter: /.*/, namespace: "global-react-ns" }, (args) => {
            if (args.path === "react") {
              return {
                contents: `
                  const React = (typeof window !== 'undefined' ? window : globalThis).React;
                  export default React;
                  export const useState = React.useState;
                  export const useEffect = React.useEffect;
                  export const useContext = React.useContext;
                  export const useRef = React.useRef;
                  export const useCallback = React.useCallback;
                  export const useMemo = React.useMemo;
                  export const useReducer = React.useReducer;
                  export const useId = React.useId;
                  export const useTransition = React.useTransition;
                  export const useDeferredValue = React.useDeferredValue;
                  export const useSyncExternalStore = React.useSyncExternalStore;
                  export const createContext = React.createContext;
                  export const startTransition = React.startTransition;
                  export const memo = React.memo;
                  export const lazy = React.lazy;
                  export const Fragment = React.Fragment;
                  export const StrictMode = React.StrictMode;
                  export const Suspense = React.Suspense;
                  export const createElement = React.createElement;
                  export const useLayoutEffect = React.useLayoutEffect;
                  export const useInsertionEffect = React.useInsertionEffect;
                  export const Children = React.Children;
                  export const isValidElement = React.isValidElement;
                  export const forwardRef = React.forwardRef;
                  export const Component = React.Component;
                  export const PureComponent = React.PureComponent;
                  export const cloneElement = React.cloneElement;
                  export const createRef = React.createRef;
                  export const useImperativeHandle = React.useImperativeHandle;
                  export const useDebugValue = React.useDebugValue;
                  export const Profiler = React.Profiler;
                `,
                loader: "js"
              };
            }
            if (args.path === "react/jsx-runtime" || args.path === "react/jsx-dev-runtime") {
              return {
                contents: `
                  const React = (typeof window !== 'undefined' ? window : globalThis).React;
                  export const jsx = React.createElement;
                  export const jsxs = React.createElement;
                  export const Fragment = React.Fragment;
                `,
                loader: "js"
              };
            }
            if (args.path.startsWith("react/")) {
              return {
                contents: `
                  const React = (typeof window !== 'undefined' ? window : globalThis).React;
                  export default React;
                `,
                loader: "js"
              };
            }
            if (args.path === "react-dom" || args.path === "react-dom/client" || args.path.startsWith("react-dom/")) {
              return {
                contents: `
                  const ReactDOM = (typeof window !== 'undefined' ? window : globalThis).ReactDOM;
                  export default ReactDOM;
                  export const createRoot = ReactDOM.createRoot;
                  export const hydrateRoot = ReactDOM.hydrateRoot;
                  export const flushSync = ReactDOM.flushSync;
                  export const createPortal = ReactDOM.createPortal;
                `,
                loader: "js"
              };
            }
            if (args.path === "zustand") {
              return {
                contents: `
                  const Zustand = (typeof window !== 'undefined' ? window : globalThis).Zustand;
                  export default Zustand;
                  export const create = Zustand.create;
                  export const useStore = Zustand.useStore;
                `,
                loader: "js"
              };
            }
            if (args.path === "lucide-react") {
              return {
                contents: `
                  const _L = (typeof window !== 'undefined' ? window : globalThis).__lucide || {};
                  export default _L;
                  // Proxy getter\uFF1A\u4EFB\u610F named import \u5747\u4ECE window.__lucide \u53D6\uFF0C\u5B9E\u73B0\u6309\u9700\u8BBF\u95EE
                  export const Loader2         = _L.Loader2;
                  export const CheckCircle2    = _L.CheckCircle2;
                  export const AlertCircle     = _L.AlertCircle;
                  export const Circle          = _L.Circle;
                  export const Wrench          = _L.Wrench;
                  export const X               = _L.X;
                  export const Terminal        = _L.Terminal;
                  export const Database        = _L.Database;
                  export const FileCode        = _L.FileCode;
                  export const Sparkles        = _L.Sparkles;
                  export const RefreshCw       = _L.RefreshCw;
                  export const Upload          = _L.Upload;
                  export const Server          = _L.Server;
                  export const HardDrive       = _L.HardDrive;
                  export const Globe           = _L.Globe;
                  export const Plus            = _L.Plus;
                  export const Trash2          = _L.Trash2;
                  export const Lock            = _L.Lock;
                  export const Settings2       = _L.Settings2;
                  export const Zap             = _L.Zap;
                  export const Eye             = _L.Eye;
                  export const MoreVertical    = _L.MoreVertical;
                  export const ArrowLeft       = _L.ArrowLeft;
                  export const ArrowRight      = _L.ArrowRight;
                  export const ArrowUp         = _L.ArrowUp;
                  export const ArrowDown       = _L.ArrowDown;
                  export const Link2           = _L.Link2;
                  export const AlertTriangle   = _L.AlertTriangle;
                  export const Save            = _L.Save;
                  export const ChevronDown     = _L.ChevronDown;
                  export const ChevronUp       = _L.ChevronUp;
                  export const ChevronLeft     = _L.ChevronLeft;
                  export const ChevronRight    = _L.ChevronRight;
                  export const Info            = _L.Info;
                  export const Search          = _L.Search;
                  export const Copy            = _L.Copy;
                  export const ExternalLink    = _L.ExternalLink;
                  export const Check           = _L.Check;
                  export const Edit            = _L.Edit;
                  export const Edit2           = _L.Edit2;
                  export const Edit3           = _L.Edit3;
                  export const Pencil          = _L.Pencil;
                  export const Folder          = _L.Folder;
                  export const FolderOpen      = _L.FolderOpen;
                  export const File            = _L.File;
                  export const FileText        = _L.FileText;
                  export const Network         = _L.Network;
                  export const Shield          = _L.Shield;
                  export const Key             = _L.Key;
                  export const Clock           = _L.Clock;
                  export const Activity        = _L.Activity;
                  export const Table           = _L.Table;
                  export const Code            = _L.Code;
                  export const Filter          = _L.Filter;
                  export const List            = _L.List;
                  export const Grid            = _L.Grid;
                  export const Settings        = _L.Settings;
                  export const User            = _L.User;
                  export const Users           = _L.Users;
                  export const Home            = _L.Home;
                  export const Bell            = _L.Bell;
                  export const LogOut          = _L.LogOut;
                  export const LogIn           = _L.LogIn;
                  export const Power           = _L.Power;
                  export const Download        = _L.Download;
                  export const Share           = _L.Share;
                  export const Share2          = _L.Share2;
                  export const Star            = _L.Star;
                  export const Heart           = _L.Heart;
                  export const Tag             = _L.Tag;
                  export const Tags            = _L.Tags;
                  export const Bookmark        = _L.Bookmark;
                  export const Link            = _L.Link;
                  export const Image           = _L.Image;
                  export const Video           = _L.Video;
                  export const Music           = _L.Music;
                  export const Package         = _L.Package;
                  export const Layers          = _L.Layers;
                  export const GitBranch       = _L.GitBranch;
                  export const BarChart        = _L.BarChart;
                  export const BarChart2       = _L.BarChart2;
                  export const LineChart       = _L.LineChart;
                  export const PieChart        = _L.PieChart;
                  export const TrendingUp      = _L.TrendingUp;
                  export const TrendingDown    = _L.TrendingDown;
                  export const Map             = _L.Map;
                  export const Menu            = _L.Menu;
                  export const MoreHorizontal  = _L.MoreHorizontal;
                  export const Clipboard       = _L.Clipboard;
                  export const ClipboardCheck  = _L.ClipboardCheck;
                  export const ThumbsUp        = _L.ThumbsUp;
                  export const ThumbsDown      = _L.ThumbsDown;
                  export const Flag            = _L.Flag;
                  export const Paperclip       = _L.Paperclip;
                  export const MinusCircle     = _L.MinusCircle;
                  export const PlusCircle      = _L.PlusCircle;
                  export const RefreshCcw      = _L.RefreshCcw;
                  export const RotateCcw       = _L.RotateCcw;
                  export const RotateCw        = _L.RotateCw;
                  export const Cpu             = _L.Cpu;
                  export const Wifi            = _L.Wifi;
                  export const WifiOff         = _L.WifiOff;
                  export const Bot             = _L.Bot;
                  export const Wand            = _L.Wand;
                  export const Wand2           = _L.Wand2;
                  export const Microscope      = _L.Microscope;
                  export const FlaskConical    = _L.FlaskConical;
                  export const Play            = _L.Play;
                  export const Pause           = _L.Pause;
                  export const Stop            = _L.Stop;
                  export const Volume2         = _L.Volume2;
                  export const VolumeX         = _L.VolumeX;
                  export const Maximize        = _L.Maximize;
                  export const Minimize        = _L.Minimize;
                  export const ChevronUpDown   = _L.ChevronUpDown;
                  export const ChevronsUpDown  = _L.ChevronsUpDown;
                  export const SortAsc         = _L.SortAsc;
                  export const SortDesc        = _L.SortDesc;
                  export const LayoutGrid      = _L.LayoutGrid;
                  export const LayoutList      = _L.LayoutList;
                  export const Sidebar         = _L.Sidebar;
                  export const PanelLeft       = _L.PanelLeft;
                  export const PanelRight      = _L.PanelRight;
                  export const MessageSquare   = _L.MessageSquare;
                  export const MessageCircle   = _L.MessageCircle;
                  export const Send            = _L.Send;
                  export const AtSign          = _L.AtSign;
                  export const Hash            = _L.Hash;
                  export const AlertOctagon    = _L.AlertOctagon;
                  export const XCircle         = _L.XCircle;
                  export const CheckCircle     = _L.CheckCircle;
                  export const HelpCircle      = _L.HelpCircle;
                  export const Lightbulb       = _L.Lightbulb;
                  export const Zap2            = _L.Zap2;
                  export const Gauge           = _L.Gauge;
                  export const Sliders         = _L.Sliders;
                  export const SlidersHorizontal = _L.SlidersHorizontal;
                  export const Mic             = _L.Mic;
                  export const PackageCheck    = _L.PackageCheck;
                  export const Square          = _L.Square;
                  export const Monitor         = _L.Monitor;
                  export const Cloud           = _L.Cloud;
                  export const Cat             = _L.Cat;
                  export const Swords          = _L.Swords;
                  export const Ghost           = _L.Ghost;
                  export const Moon            = _L.Moon;
                `,
                loader: "js"
              };
            }
            if (args.path === "xterm") {
              return {
                contents: `
                  const XTerm = (typeof window !== 'undefined' ? window : globalThis).XTerm || {};
                  export const Terminal = XTerm.Terminal;
                `,
                loader: "js"
              };
            }
            if (args.path === "xterm-addon-fit") {
              return {
                contents: `
                  const XTerm = (typeof window !== 'undefined' ? window : globalThis).XTerm || {};
                  export const FitAddon = XTerm.FitAddon;
                `,
                loader: "js"
              };
            }
            if (args.path === "react-tooltip") {
              return {
                contents: `
                  const ReactTooltip = (typeof window !== 'undefined' ? window : globalThis).ReactTooltip;
                  export default ReactTooltip;
                  export const Tooltip = ReactTooltip;
                `,
                loader: "js"
              };
            }
            if (args.path === "framer-motion") {
              return {
                contents: `
                  // framer-motion \u2192 window.FramerMotion\uFF08\u5BBF\u4E3B main.tsx \u5DF2\u66B4\u9732\uFF09
                  // \u5171\u4EAB\u540C\u4E00\u5B9E\u4F8B\uFF0C\u907F\u514D\u53CC\u91CD\u5B9E\u4F8B\u5BFC\u81F4 AnimatePresence/PresenceContext \u51B2\u7A81
                  const _FM = (typeof window !== 'undefined' ? window : globalThis).FramerMotion || {};
                  export default _FM;
                  export const motion           = _FM.motion;
                  export const AnimatePresence  = _FM.AnimatePresence;
                  export const animate          = _FM.animate;
                  export const useAnimate       = _FM.useAnimate;
                  export const useAnimation     = _FM.useAnimation;
                  export const useMotionValue   = _FM.useMotionValue;
                  export const useTransform     = _FM.useTransform;
                  export const useSpring        = _FM.useSpring;
                  export const useScroll        = _FM.useScroll;
                  export const useInView        = _FM.useInView;
                  export const useDragControls  = _FM.useDragControls;
                  export const LayoutGroup      = _FM.LayoutGroup;
                  export const LazyMotion       = _FM.LazyMotion;
                  export const m                = _FM.m;
                  export const domAnimation     = _FM.domAnimation;
                  export const domMax           = _FM.domMax;
                  export const stagger          = _FM.stagger;
                  export const spring           = _FM.spring;
                  export const easing           = _FM.easing;
                `,
                loader: "js"
              };
            }
            if (args.path === "motion") {
              return {
                contents: `
                  const _FM = (typeof window !== 'undefined' ? window : globalThis).FramerMotion || {};
                  export default _FM;
                  export const motion           = _FM.motion;
                  export const AnimatePresence  = _FM.AnimatePresence;
                  export const animate          = _FM.animate;
                  export const useAnimate       = _FM.useAnimate;
                  export const useMotionValue   = _FM.useMotionValue;
                  export const useTransform     = _FM.useTransform;
                  export const useSpring        = _FM.useSpring;
                  export const useScroll        = _FM.useScroll;
                  export const useInView        = _FM.useInView;
                  export const m                = _FM.m;
                  export const stagger          = _FM.stagger;
                `,
                loader: "js"
              };
            }
            return null;
          });
        }
      };
      const globalHostImportsPlugin = {
        name: "berrytrace-global-host-imports-plugin",
        setup(buildContext) {
          const getProjectRoot = () => {
            let curr = __dirname2;
            for (let i = 0; i < 8; i++) {
              if (fs2.existsSync(path2.resolve(curr, "src")) && fs2.existsSync(path2.resolve(curr, "electron"))) {
                return curr;
              }
              const parent = path2.dirname(curr);
              if (parent === curr) break;
              curr = parent;
            }
            if (fs2.existsSync(path2.resolve(__dirname2, "../src"))) return path2.resolve(__dirname2, "..");
            if (fs2.existsSync(path2.resolve(__dirname2, "../../src"))) return path2.resolve(__dirname2, "../..");
            return path2.resolve(__dirname2, "..");
          };
          const ROOT = getProjectRoot();
          const hostImports = {
            "@/stores/user": `
              const useUserStore = (typeof window !== 'undefined' ? window : globalThis).useUserStore;
              export { useUserStore };
            `,
            "@/stores/app": `
              const useAppStore = (typeof window !== 'undefined' ? window : globalThis).useAppStore;
              export { useAppStore };
            `,
            "@/services/http": `
              const httpService = (typeof window !== 'undefined' ? window : globalThis).httpService;
              export { httpService };
            `,
            "@/services/event_bus": `
              const event_bus = (typeof window !== 'undefined' ? window : globalThis).event_bus;
              export default event_bus;
            `,
            "@/services/publish_bridge": `
              const publish_bridge = (typeof window !== 'undefined' ? window : globalThis).publish_bridge;
              export const bindConsumers = publish_bridge ? publish_bridge.bindConsumers : undefined;
              export const unbindConsumers = publish_bridge ? publish_bridge.unbindConsumers : undefined;
            `,
            "@/plugins/PluginRegistry": `
              const PluginRegistry = (typeof window !== 'undefined' ? window : globalThis).PluginRegistry;
              export { PluginRegistry };
            `
          };
          buildContext.onResolve({ filter: /.*/ }, (args) => {
            if (!args.resolveDir) return null;
            let absolutePath = "";
            if (args.path.startsWith("@/")) {
              absolutePath = path2.resolve(ROOT, "src", args.path.slice(2));
            } else if (args.path.startsWith(".")) {
              absolutePath = path2.resolve(args.resolveDir, args.path);
            } else {
              return null;
            }
            const normalized = absolutePath.replace(/\.(?:ts|tsx|js|jsx)$/, "");
            const userStorePath = path2.resolve(ROOT, "src/stores/user");
            const appStorePath = path2.resolve(ROOT, "src/stores/app");
            const httpServicePath = path2.resolve(ROOT, "src/services/http");
            const eventBusPath = path2.resolve(ROOT, "src/services/event_bus");
            const publishBridgePath = path2.resolve(ROOT, "src/services/publish_bridge");
            const pluginRegistryPath = path2.resolve(ROOT, "src/plugins/PluginRegistry");
            if (normalized === userStorePath) {
              return { path: "@/stores/user", namespace: "global-host-imports-ns" };
            }
            if (normalized === appStorePath) {
              return { path: "@/stores/app", namespace: "global-host-imports-ns" };
            }
            if (normalized === httpServicePath) {
              return { path: "@/services/http", namespace: "global-host-imports-ns" };
            }
            if (normalized === eventBusPath) {
              return { path: "@/services/event_bus", namespace: "global-host-imports-ns" };
            }
            if (normalized === publishBridgePath) {
              return { path: "@/services/publish_bridge", namespace: "global-host-imports-ns" };
            }
            if (normalized === pluginRegistryPath) {
              return { path: "@/plugins/PluginRegistry", namespace: "global-host-imports-ns" };
            }
            return null;
          });
          buildContext.onLoad({ filter: /.*/, namespace: "global-host-imports-ns" }, (args) => {
            return { contents: hostImports[args.path], loader: "js" };
          });
        }
      };
      await build({
        entryPoints: [entryPoint],
        outfile: path2.join(pluginPath, view),
        bundle: true,
        platform: "browser",
        target: ["es2022"],
        format: "esm",
        minify: true,
        jsxFactory: "React.createElement",
        jsxFragment: "React.Fragment",
        plugins: [globalHostImportsPlugin, aliasPlugin, cssPlugin, globalSdkPlugin, globalReactPlugin],
        tsconfigRaw: {
          compilerOptions: {
            experimentalDecorators: true
          }
        },
        logLevel: "info",
        external: ["electron"],
        define: {
          "import.meta.env": JSON.stringify({
            DEV: true,
            MODE: "development",
            VITE_APP_SOCKET_URL: "",
            VITE_BASE_URL: "",
            VITE_APP_API_URL: "",
            VITE_UPLOAD_URL: "",
            VITE_APP_USE_MOCK: "true",
            VITE_BERRYTRACE_MODEL: "qwen3-vl-plus",
            VITE_BERRYTRACE_ENDPOINT: "",
            VITE_WEB_APP: "false",
            VITE_ENABLE_PHONE_LOGIN: "false"
          })
        }
      });
    }
    console.log(`\u2713 \u63D2\u4EF6 "${id}" \u6784\u5EFA\u6210\u529F\uFF01
`);
    return { success: true, pluginId: id };
  } catch (err) {
    console.error("\u274C \u6784\u5EFA\u63D2\u4EF6\u5931\u8D25:", err);
    return { success: false, pluginId: null };
  }
}
function notifyLocalServer(pluginId, pluginPath) {
  return new Promise((resolve) => {
    const configPath = path2.join(os.homedir(), ".berrytrace", "local_server.json");
    if (!fs2.existsSync(configPath)) {
      console.log("\u{1F4A1} \u672A\u68C0\u6D4B\u5230\u5BBF\u4E3B\u8FD0\u884C\u7684 LocalServer \u914D\u7F6E (~/.berrytrace/local_server.json)\uFF0C\u8DF3\u8FC7\u70ED\u91CD\u8F7D\u901A\u77E5\u3002");
      resolve(false);
      return;
    }
    try {
      const config = JSON.parse(fs2.readFileSync(configPath, "utf8"));
      const { port, token } = config;
      const req = http.request({
        hostname: "127.0.0.1",
        port: port || 31828,
        path: "/ping",
        method: "GET",
        timeout: 2e3
      }, (res) => {
        if (res.statusCode !== 200) {
          console.log("\u{1F4A1} \u5BBF\u4E3B LocalServer \u672A\u54CD\u5E94 (/ping)\uFF0C\u8DF3\u8FC7\u70ED\u91CD\u8F7D\u901A\u77E5\u3002");
          resolve(false);
          return;
        }
        const reloadReq = http.request({
          hostname: "127.0.0.1",
          port: port || 31828,
          path: `/reload-plugin?id=${encodeURIComponent(pluginId)}`,
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          timeout: 5e3
        }, (reloadRes) => {
          let body = "";
          reloadRes.on("data", (chunk) => body += chunk);
          reloadRes.on("end", () => {
            if (reloadRes.statusCode === 200) {
              console.log(`\u2705 \u6210\u529F\u901A\u77E5 BerryTrace \u5BBF\u4E3B\u70ED\u91CD\u8F7D\u63D2\u4EF6 "${pluginId}"\uFF01`);
              resolve(true);
            } else {
              const absPath = path2.resolve(pluginPath);
              const loadReq = http.request({
                hostname: "127.0.0.1",
                port: port || 31828,
                path: `/load-unpacked-plugin?path=${encodeURIComponent(absPath)}`,
                method: "GET",
                headers: {
                  "Authorization": `Bearer ${token}`
                },
                timeout: 5e3
              }, (loadRes) => {
                let loadBody = "";
                loadRes.on("data", (chunk) => loadBody += chunk);
                loadRes.on("end", () => {
                  if (loadRes.statusCode === 200) {
                    console.log(`\u2705 \u6210\u529F\u901A\u77E5 BerryTrace \u5BBF\u4E3B\u52A0\u8F7D\u672A\u6253\u5305\u63D2\u4EF6 "${pluginId}"\uFF01`);
                    resolve(true);
                  } else {
                    console.warn(`\u26A0\uFE0F \u901A\u77E5\u5BBF\u4E3B\u52A0\u8F7D\u63D2\u4EF6\u5931\u8D25 (HTTP ${loadRes.statusCode}): ${loadBody}`);
                    resolve(false);
                  }
                });
              });
              loadReq.on("error", (err) => {
                console.warn(`\u26A0\uFE0F \u8BF7\u6C42 /load-unpacked-plugin \u5F02\u5E38: ${err.message}`);
                resolve(false);
              });
              loadReq.end();
            }
          });
        });
        reloadReq.on("error", (err) => {
          console.warn(`\u26A0\uFE0F \u8BF7\u6C42 /reload-plugin \u5F02\u5E38: ${err.message}`);
          resolve(false);
        });
        reloadReq.end();
      });
      req.on("error", () => {
        console.log("\u{1F4A1} BerryTrace \u5BBF\u4E3B\u672A\u542F\u52A8\uFF0C\u8DF3\u8FC7\u70ED\u91CD\u8F7D\u901A\u77E5\u3002");
        resolve(false);
      });
      req.end();
    } catch (err) {
      console.warn("\u26A0\uFE0F \u8BFB\u53D6 LocalServer Token \u6216\u901A\u77E5\u5931\u8D25:", err.message);
      resolve(false);
    }
  });
}
function fetchLogsFromLocalServerOrFile(pluginId, limit = 50) {
  return new Promise((resolve) => {
    const configPath = path2.join(os.homedir(), ".berrytrace", "local_server.json");
    if (fs2.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs2.readFileSync(configPath, "utf8"));
        const { port, token } = config;
        const query = pluginId ? `?pluginId=${encodeURIComponent(pluginId)}&limit=${limit}` : `?limit=${limit}`;
        const req = http.request({
          hostname: "127.0.0.1",
          port: port || 31828,
          path: `/get-logs${query}`,
          method: "GET",
          headers: { "Authorization": `Bearer ${token}` },
          timeout: 2e3
        }, (res) => {
          let body = "";
          res.on("data", (chunk) => body += chunk);
          res.on("end", () => {
            if (res.statusCode === 200) {
              try {
                const data = JSON.parse(body);
                if (data.logs && Array.isArray(data.logs)) {
                  console.log(`\u{1F4CB} ===== \u5BBF\u4E3B\u8FD0\u884C\u65E5\u5FD7 (\u6700\u8FD1 ${data.logs.length} \u6761) =====`);
                  data.logs.forEach((log) => {
                    const time = new Date(log.timestamp).toLocaleTimeString();
                    console.log(`[${time}] [${log.level.toUpperCase()}] [${log.source}] ${log.message}`);
                  });
                  resolve(true);
                  return;
                }
              } catch {
              }
            }
            readFallbackFileLogs(pluginId, limit).then(resolve);
          });
        });
        req.on("error", () => {
          readFallbackFileLogs(pluginId, limit).then(resolve);
        });
        req.end();
        return;
      } catch {
      }
    }
    readFallbackFileLogs(pluginId, limit).then(resolve);
  });
}
function readFallbackFileLogs(pluginId, limit = 50) {
  return new Promise((resolve) => {
    const possiblePaths = [
      path2.join(process.cwd(), "logs", "app.log"),
      path2.join(os.homedir(), "Library", "Application Support", "berrytrace-dev", "logs", "app.log"),
      path2.join(os.homedir(), "Library", "Application Support", "berrytrace", "logs", "app.log"),
      path2.join(os.homedir(), "AppData", "Roaming", "berrytrace", "logs", "app.log"),
      path2.join(os.homedir(), ".config", "berrytrace", "logs", "app.log")
    ];
    let foundPath = null;
    for (const p of possiblePaths) {
      if (fs2.existsSync(p)) {
        foundPath = p;
        break;
      }
    }
    if (!foundPath) {
      console.log("\u{1F4A1} \u672A\u627E\u5230\u5BBF\u4E3B\u8FD0\u884C\u8BB0\u5F55\u6216\u672C\u5730 app.log \u6587\u4EF6");
      resolve(false);
      return;
    }
    try {
      console.log(`\u{1F4C4} \u8BFB\u53D6\u672C\u5730\u65E5\u5FD7\u6587\u4EF6: ${foundPath}`);
      const content = fs2.readFileSync(foundPath, "utf8");
      const lines = content.split("\n").filter(Boolean);
      let matched = lines;
      if (pluginId) {
        matched = lines.filter((line) => line.includes(pluginId));
      }
      const recent = matched.slice(-limit);
      console.log(`\u{1F4CB} ===== \u78C1\u76D8\u65E5\u5FD7 (\u6700\u8FD1 ${recent.length} \u6761) =====`);
      recent.forEach((line) => console.log(line));
      resolve(true);
    } catch (err) {
      console.error("\u274C \u8BFB\u53D6\u65E5\u5FD7\u6587\u4EF6\u5931\u8D25:", err.message);
      resolve(false);
    }
  });
}
function runLocalBuild(pluginPath) {
  return new Promise((resolve) => {
    const pkgPath = path2.join(pluginPath, "package.json");
    if (!fs2.existsSync(pkgPath)) {
      resolve(true);
      return;
    }
    try {
      const pkg = JSON.parse(fs2.readFileSync(pkgPath, "utf8"));
      if (pkg.scripts && pkg.scripts.build) {
        console.log(`\u{1F528} \u68C0\u6D4B\u5230\u672C\u5730\u6784\u5EFA\u811A\u672C\uFF0C\u6B63\u5728\u6267\u884C: npm run build...`);
        exec("npm run build", { cwd: pluginPath }, (err, stdout, stderr) => {
          if (stdout && stdout.trim()) {
            console.log(stdout.trim());
          }
          if (err) {
            if (stderr && stderr.trim()) {
              console.error(stderr.trim());
            }
            console.error(`\u274C \u81EA\u52A8\u6784\u5EFA\u5931\u8D25: npm run build \u6267\u884C\u51FA\u9519`);
            resolve(false);
          } else {
            console.log(`\u2713 \u81EA\u52A8\u6784\u5EFA\u6210\u529F\uFF01
`);
            resolve(true);
          }
        });
      } else {
        resolve(true);
      }
    } catch (e) {
      console.warn(`\u26A0\uFE0F \u89E3\u6790 package.json \u5931\u8D25\uFF0C\u8DF3\u8FC7\u81EA\u52A8\u6784\u5EFA: ${e.message}`);
      resolve(true);
    }
  });
}
function scanDirRecursive(dir, baseDir, filesList = []) {
  const files = fs2.readdirSync(dir);
  for (const file of files) {
    const fullPath = path2.join(dir, file);
    const relPath = path2.relative(baseDir, fullPath);
    const stat = fs2.statSync(fullPath);
    if (file === ".git" || file === "private_key.pem" || file === ".DS_Store" || relPath.endsWith(".btp")) {
      continue;
    }
    if (stat.isDirectory()) {
      scanDirRecursive(fullPath, baseDir, filesList);
    } else if (stat.isFile()) {
      filesList.push(relPath);
    }
  }
  return filesList;
}
function getFileHash(filePath) {
  const content = fs2.readFileSync(filePath);
  return crypto.createHash("sha256").update(content).digest("hex");
}
function packPlugin(pluginPath = process.cwd()) {
  const manifestPath = path2.join(pluginPath, "plugin.json");
  if (!fs2.existsSync(manifestPath)) {
    console.error(`\u274C \u9519\u8BEF: \u672A\u5728 ${manifestPath} \u627E\u5230 plugin.json\u3002\u8BF7\u786E\u4FDD\u60A8\u5F53\u524D\u5904\u4E8E\u63D2\u4EF6\u76EE\u5F55\u4E2D\u3002`);
    process.exit(1);
  }
  let manifest;
  try {
    manifest = JSON.parse(fs2.readFileSync(manifestPath, "utf8"));
  } catch (err) {
    console.error(`\u274C \u89E3\u6790 plugin.json \u5931\u8D25: ${err.message}`);
    process.exit(1);
  }
  const { id, version, category } = manifest;
  if (!id || !version) {
    console.error(`\u274C \u9519\u8BEF: plugin.json \u5FC5\u987B\u5305\u542B 'id' \u548C 'version' \u5B57\u6BB5\u3002`);
    process.exit(1);
  }
  if (!category || !category.trim()) {
    console.error(`\u274C \u9519\u8BEF: plugin.json \u5FC5\u987B\u5305\u542B 'category' \u5B57\u6BB5\uFF08\u5206\u7C7B\uFF09\uFF0C\u4E14\u4E0D\u80FD\u4E3A\u7A7A\u3002`);
    console.error(`   \u60A8\u53EF\u4EE5\u8BBF\u95EE www.getdear.cn \u67E5\u8BE2\u6709\u54EA\u4E9B\u5206\u7C7B\u3002`);
    process.exit(1);
  }
  let privateKeyPath = path2.join(pluginPath, "private_key.pem");
  let publicKeyPath = path2.join(pluginPath, "public_key.pem");
  if (!fs2.existsSync(privateKeyPath) || !fs2.existsSync(publicKeyPath)) {
    console.log("\u26A0\uFE0F \u672A\u68C0\u6D4B\u5230\u5F00\u53D1\u8005\u5BC6\u94A5\u5BF9\u3002\u6B63\u5728\u81EA\u52A8\u751F\u6210\u65B0\u5BC6\u94A5...");
    generateKeys(pluginPath);
  }
  const privateKeyPem = fs2.readFileSync(privateKeyPath, "utf8");
  const publicKeyPem = fs2.readFileSync(publicKeyPath, "utf8");
  console.log(`\u{1F4E6} \u6B63\u5728\u6253\u5305\u5E76\u7B7E\u540D\u63D2\u4EF6 "${id}" (v${version})...`);
  let filesToPack = scanDirRecursive(pluginPath, pluginPath);
  if (Array.isArray(manifest.files)) {
    const allowedPatterns = manifest.files.map((p) => p.replace(/\\/g, "/"));
    filesToPack = filesToPack.filter((relPath) => {
      const normalizedPath = relPath.replace(/\\/g, "/");
      return allowedPatterns.some((pattern) => {
        return normalizedPath === pattern || normalizedPath.startsWith(pattern + "/");
      });
    });
  } else {
    const hasDist = fs2.existsSync(path2.join(pluginPath, "dist"));
    filesToPack = filesToPack.filter((relPath) => {
      const normalizedPath = relPath.replace(/\\/g, "/");
      const parts = normalizedPath.split("/");
      const firstPart = parts[0];
      const part0Lower = firstPart.toLowerCase();
      const fileNameLower = parts[parts.length - 1].toLowerCase();
      if (part0Lower === ".git" || part0Lower === "private_key.pem" || part0Lower === "public_key.pem" || part0Lower === ".ds_store" || fileNameLower === ".ds_store" || normalizedPath.endsWith(".btp") || part0Lower === ".gitignore" || part0Lower === "package-lock.json" || part0Lower === "pnpm-lock.yaml" || part0Lower === "yarn.lock" || part0Lower === "src" || part0Lower === "scripts" || part0Lower === ".github" || part0Lower === ".idea" || part0Lower === ".vscode" || part0Lower === ".cursor" || fileNameLower.endsWith(".map") || parts.includes("test") || parts.includes("tests") || parts.includes("__tests__") || parts.includes("docs") || fileNameLower.endsWith(".cpp") || fileNameLower.endsWith(".hpp") || fileNameLower.endsWith(".c") || fileNameLower.endsWith(".h") || fileNameLower.endsWith(".o") || fileNameLower.endsWith(".obj")) {
        return false;
      }
      if (fileNameLower.endsWith(".ts") || fileNameLower.endsWith(".tsx")) {
        if (!fileNameLower.endsWith(".d.ts")) {
          return false;
        }
      }
      if (part0Lower === "node_modules") {
        if (pluginPath.includes(".berrytrace") && pluginPath.includes("pack-")) {
          return true;
        }
        try {
          const pkgJsonPath = path2.join(pluginPath, "package.json");
          if (fs2.existsSync(pkgJsonPath)) {
            const pkg = JSON.parse(fs2.readFileSync(pkgJsonPath, "utf8"));
            const deps = pkg.dependencies ? Object.keys(pkg.dependencies) : [];
            const subPart = parts[1];
            if (subPart) {
              if (subPart.startsWith("@")) {
                const scopeName = `${subPart}/${parts[2]}`;
                if (deps.some((d) => d === scopeName || d.startsWith(scopeName + "/"))) {
                  return true;
                }
              } else {
                if (deps.some((d) => d === subPart || d.startsWith(subPart + "/"))) {
                  return true;
                }
              }
            }
          }
        } catch (err) {
          console.warn("[Packager] Failed to filter node_modules dependencies:", err);
        }
        return false;
      }
      if (hasDist) {
        const isMetaFile = parts.length === 1 && (firstPart === "plugin.json" || firstPart === "package.json" || firstPart.endsWith(".json") || firstPart.endsWith(".md") || firstPart.toLowerCase() === "license" || firstPart.toLowerCase() === "licence");
        const isInAllowedDir = part0Lower === "dist" || part0Lower === "skills" || part0Lower === ".skills";
        return isInAllowedDir || isMetaFile;
      } else {
        if (fileNameLower === "tsconfig.json" || fileNameLower.startsWith("tsconfig.") || fileNameLower.startsWith("vite.config.") || fileNameLower.startsWith("webpack.config.") || fileNameLower.startsWith("tailwind.config.") || fileNameLower.startsWith("postcss.config.") || fileNameLower.startsWith("eslint.config.") || fileNameLower.startsWith(".eslintrc") || fileNameLower.startsWith(".prettierrc")) {
          return false;
        }
        return true;
      }
    });
  }
  const filesHashes = {};
  for (const relPath of filesToPack) {
    filesHashes[relPath] = getFileHash(path2.join(pluginPath, relPath));
  }
  const canonicalStr = getCanonicalPackageString(id, version, filesHashes);
  const signer = crypto.createSign("SHA256");
  signer.update(canonicalStr);
  signer.end();
  const signature = signer.sign(privateKeyPem, "hex");
  const signatureData = {
    pluginId: id,
    version,
    publicKey: publicKeyPem,
    signature,
    files: filesHashes
  };
  const zip = new import_adm_zip.default();
  for (const relPath of filesToPack) {
    const fullPath = path2.join(pluginPath, relPath);
    const dirName = path2.dirname(relPath);
    if (dirName === ".") {
      zip.addLocalFile(fullPath);
    } else {
      zip.addLocalFile(fullPath, dirName);
    }
  }
  zip.addFile("signature.json", Buffer.from(JSON.stringify(signatureData, null, 2), "utf8"));
  const outputFilename = `${id}-${version}.btp`;
  const outputPath = path2.join(pluginPath, outputFilename);
  if (fs2.existsSync(outputPath)) {
    try {
      fs2.unlinkSync(outputPath);
    } catch (e) {
    }
  }
  try {
    zip.writeZip(outputPath);
  } catch (err) {
    console.error(`\u{1F6A8} [Packager:ERROR] \u5199\u5165\u63D2\u4EF6\u5305 ${outputPath} \u5931\u8D25: ${err.message}`);
    throw err;
  }
  console.log(`
\u2713 \u63D2\u4EF6\u6253\u5305\u548C\u7B7E\u540D\u6210\u529F\uFF01`);
  console.log(`\u5B89\u88C5\u5305\u5DF2\u4FDD\u5B58\u81F3: ${outputPath}`);
  console.log(`\u5DF2\u9A8C\u8BC1\u7684\u6587\u4EF6\u603B\u6570: ${filesToPack.length}`);
  const skillFiles = filesToPack.filter(
    (f) => f.startsWith("skills" + path2.sep) || f.startsWith("skills/") || f.startsWith(".skills" + path2.sep) || f.startsWith(".skills/")
  );
  if (skillFiles.length > 0) {
    const skillDirs = [...new Set(skillFiles.map((f) => f.split(/[/\\]/)[1]))].filter(Boolean);
    console.log(`\u2713 \u5DF2\u6253\u5305 Skills \u6587\u6863 (${skillFiles.length} \u4E2A\u6587\u4EF6, \u5171 ${skillDirs.length} \u4E2A Skill): ${skillDirs.join(", ")}`);
  }
  console.log(`\u5F00\u53D1\u8005\u516C\u94A5\u6307\u7EB9: ${crypto.createHash("sha256").update(publicKeyPem).digest("hex").substring(0, 16)}...`);
  return outputPath;
}
function getAuthConfigPath() {
  return path2.join(os.homedir(), ".berrytrace", "auth.json");
}
function loginDeveloper() {
  const server = http.createServer((req, res) => {
    if (req.method === "OPTIONS") {
      res.writeHead(200, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      });
      res.end();
      return;
    }
    if (req.url === "/callback" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        try {
          const authData = JSON.parse(body);
          if (!authData.token) {
            throw new Error("\u9274\u6743\u6570\u636E\u4E2D\u7F3A\u5C11 token \u5B57\u6BB5");
          }
          const configPath = getAuthConfigPath();
          fs2.mkdirSync(path2.dirname(configPath), { recursive: true });
          fs2.writeFileSync(configPath, JSON.stringify(authData, null, 2), "utf8");
          console.log(`
\u2713 \u767B\u5F55\u6210\u529F\uFF01\u6B22\u8FCE\u56DE\u6765\uFF0C${authData.username || "\u5F00\u53D1\u8005"}\u3002`);
          console.log(`\u51ED\u8BC1\u5DF2\u4FDD\u5B58\u81F3: ${configPath}`);
          res.writeHead(200, {
            "Content-Type": "text/html; charset=utf-8",
            "Access-Control-Allow-Origin": "*"
          });
          res.end(`
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>BerryTrace CLI \u767B\u5F55\u6210\u529F</title>
              <style>
                body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #0f0f11; color: #e4e4e7; }
                .card { padding: 2rem; border-radius: 12px; background: #18181b; border: 1px solid #27272a; text-align: center; max-width: 400px; }
                h1 { color: #10b981; font-size: 1.5rem; margin-bottom: 0.5rem; }
                p { color: #a1a1aa; line-height: 1.5; }
              </style>
            </head>
            <body>
              <div class="card">
                <h1>\u2713 \u767B\u5F55\u6210\u529F</h1>
                <p>BerryTrace CLI \u5DF2\u6210\u529F\u5173\u8054\u60A8\u7684\u8D26\u53F7\uFF0C\u60A8\u53EF\u4EE5\u5173\u95ED\u6B64\u6D4F\u89C8\u5668\u6807\u7B7E\u9875\u5E76\u8FD4\u56DE\u7EC8\u7AEF\u3002</p>
              </div>
            </body>
            </html>
          `);
          req.connection.destroy();
          server.close(() => {
            process.exit(0);
          });
        } catch (err) {
          console.error("\u274C \u5904\u7406\u767B\u5F55\u56DE\u8C03\u5931\u8D25:", err.message);
          res.writeHead(400, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    }
  });
  server.listen(0, "127.0.0.1", () => {
    const port = server.address().port;
    const loginUrl = `https://getdear.cn/login?source=cli&port=${port}`;
    console.log(`\u{1F511} \u6B63\u5728\u542F\u52A8\u7F51\u9875\u767B\u5F55\u6D41\u7A0B...`);
    console.log(`\u5982\u679C\u6D4F\u89C8\u5668\u672A\u81EA\u52A8\u6253\u5F00\uFF0C\u8BF7\u624B\u52A8\u8BBF\u95EE\u4EE5\u4E0B\u94FE\u63A5\uFF1A${loginUrl}`);
    openBrowser(loginUrl);
  });
}
async function publishPlugin(packagePath) {
  const configPath = getAuthConfigPath();
  if (!fs2.existsSync(configPath)) {
    console.error(`\u274C \u9519\u8BEF\uFF1A\u8BF7\u5148\u767B\u5F55\u3002\u8FD0\u884C\u4EE5\u4E0B\u547D\u4EE4\u767B\u5F55\uFF1Aberrytrace-cli login`);
    process.exit(1);
  }
  let authData;
  try {
    authData = JSON.parse(fs2.readFileSync(configPath, "utf8"));
  } catch (err) {
    console.error(`\u274C \u8BFB\u53D6\u9274\u6743\u6587\u4EF6\u5931\u8D25\uFF1A${err.message}`);
    process.exit(1);
  }
  if (!packagePath) {
    const files = fs2.readdirSync(process.cwd());
    const btpFiles = files.filter((f) => f.endsWith(".btp"));
    if (btpFiles.length === 0) {
      console.error(`\u274C \u9519\u8BEF\uFF1A\u5F53\u524D\u76EE\u5F55\u4E0B\u672A\u627E\u5230 .btp \u63D2\u4EF6\u5305\u3002\u8BF7\u6307\u5B9A\u5305\u8DEF\u5F84\uFF0C\u6216\u5148\u8FD0\u884C\uFF1Aberrytrace-cli pack`);
      process.exit(1);
    } else if (btpFiles.length === 1) {
      packagePath = path2.resolve(btpFiles[0]);
    } else {
      const parseVersion = (filename) => {
        const match = filename.match(/-(\d+\.\d+\.\d+(?:[.-][\w.]+)?)\.[^.]+$/);
        return match ? match[1] : "0.0.0";
      };
      const latestFile = btpFiles.sort((a, b) => {
        const va = parseVersion(a).split(/[.-]/).map(Number);
        const vb = parseVersion(b).split(/[.-]/).map(Number);
        for (let i = 0; i < Math.max(va.length, vb.length); i++) {
          const diff = (va[i] || 0) - (vb[i] || 0);
          if (diff !== 0) return diff;
        }
        return 0;
      }).pop();
      packagePath = path2.resolve(latestFile);
      console.log(`\u2139\uFE0F \u53D1\u73B0\u591A\u4E2A .btp \u6587\u4EF6\uFF0C\u81EA\u52A8\u9009\u62E9\u6700\u65B0\u7248\u672C: ${latestFile}`);
    }
  } else {
    packagePath = path2.resolve(packagePath);
  }
  if (!fs2.existsSync(packagePath)) {
    console.error(`\u274C \u9519\u8BEF\uFF1A\u627E\u4E0D\u5230\u5B89\u88C5\u5305\u6587\u4EF6\uFF1A${packagePath}`);
    process.exit(1);
  }
  console.log(`\u{1F4E4} \u6B63\u5728\u4E0A\u4F20\u5B89\u88C5\u5305 ${path2.basename(packagePath)}...`);
  try {
    const fileBuffer = fs2.readFileSync(packagePath);
    const blob = new Blob([fileBuffer], { type: "application/octet-stream" });
    const formData = new FormData();
    formData.append("file", blob, path2.basename(packagePath));
    const response = await fetch("https://getdear.cn/api/plugins/upload", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${authData.token}`
      },
      body: formData
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`\u670D\u52A1\u5668\u54CD\u5E94\u9519\u8BEF ${response.status}: ${errText}`);
    }
    const result = await response.json();
    console.log(`
\u2713 \u63D2\u4EF6\u53D1\u5E03\u6210\u529F\uFF01`);
    console.log(`\u670D\u52A1\u5668\u8FD4\u56DE\u6570\u636E:`, result);
  } catch (err) {
    console.error(`\u274C \u53D1\u5E03\u63D2\u4EF6\u5931\u8D25: ${err.message}`);
    process.exit(1);
  }
}
async function installPluginLocal(pluginPath = process.cwd()) {
  const absPath = path2.resolve(pluginPath);
  const manifestPath = path2.join(absPath, "plugin.json");
  if (!fs2.existsSync(manifestPath)) {
    console.error(`\u274C \u9519\u8BEF: \u672A\u5728 ${manifestPath} \u627E\u5230 plugin.json\u3002\u8BF7\u786E\u4FDD\u60A8\u6307\u5B9A\u4E86\u6B63\u786E\u7684\u63D2\u4EF6\u8DEF\u5F84\u3002`);
    return false;
  }
  let manifest;
  try {
    manifest = JSON.parse(fs2.readFileSync(manifestPath, "utf8"));
  } catch (err) {
    console.error(`\u274C \u89E3\u6790 plugin.json \u5931\u8D25: ${err.message}`);
    return false;
  }
  const { id, version } = manifest;
  if (!id || !version) {
    console.error(`\u274C \u9519\u8BEF: plugin.json \u5FC5\u987B\u5305\u542B 'id' \u548C 'version' \u5B57\u6BB5\u3002`);
    return false;
  }
  const buildSuccess = await runLocalBuild(absPath);
  if (!buildSuccess) {
    return false;
  }
  let btpPath;
  try {
    btpPath = packPlugin(absPath);
  } catch (err) {
    console.error(`\u274C \u6253\u5305\u63D2\u4EF6\u5931\u8D25: ${err.message}`);
    return false;
  }
  const targetDir = path2.join(os.homedir(), ".berrytrace", "plugins", id);
  try {
    if (!fs2.existsSync(path2.dirname(targetDir))) {
      fs2.mkdirSync(path2.dirname(targetDir), { recursive: true });
    }
    const zip = new import_adm_zip.default(btpPath);
    zip.extractAllTo(targetDir, true);
    console.log(`
\u{1F680} [Install] \u5DF2\u6210\u529F\u89E3\u538B\u5B89\u88C5\u63D2\u4EF6 "${id}" (v${version}) \u81F3\u672C\u5730\u5BBF\u4E3B\u63D2\u4EF6\u76EE\u5F55:`);
    console.log(`   \u2514\u2500 ${targetDir}`);
  } catch (err) {
    console.error(`\u274C \u5199\u5165/\u66F4\u65B0\u672C\u5730\u63D2\u4EF6\u76EE\u5F55\u5931\u8D25: ${err.message}`);
    return false;
  }
  const reloaded = await notifyLocalServer(id, targetDir);
  if (reloaded) {
    console.log(`\u2728 [Workflow Complete] \u6253\u5305 \u2794 \u672C\u5730\u66F4\u65B0 \u2794 \u5BBF\u4E3B\u5237\u65B0 \u5168\u81EA\u52A8\u5B8C\u6210\uFF01
`);
  } else {
    console.log(`\u{1F4A1} \u672C\u5730\u63D2\u4EF6\u66F4\u65B0\u5B8C\u6210\u3002BerryTrace \u5BBF\u4E3B\u542F\u52A8\u540E\u5C06\u81EA\u52A8\u52A0\u8F7D\u6700\u65B0\u63D2\u4EF6\u4EE3\u7801\u3002
`);
  }
  return true;
}
async function startDevWatch(pluginPath = process.cwd()) {
  const absPath = path2.resolve(pluginPath);
  const manifestPath = path2.join(absPath, "plugin.json");
  if (!fs2.existsSync(manifestPath)) {
    console.error(`\u274C \u9519\u8BEF: \u672A\u5728 ${manifestPath} \u627E\u5230 plugin.json\u3002\u8BF7\u786E\u4FDD\u5728\u6B63\u786E\u7684\u63D2\u4EF6\u76EE\u5F55\u4E0B\u8FD0\u884C\u3002`);
    process.exit(1);
  }
  console.log(`
\u{1F440} [Dev Mode] \u542F\u52A8\u70ED\u76D1\u89C6\u5F00\u53D1\u5DE5\u4F5C\u6D41 (${absPath})...`);
  console.log(`\u23F3 \u6B63\u5728\u6267\u884C\u9996\u6B21\u6253\u5305\u4E0E\u672C\u5730\u66F4\u65B0...`);
  await installPluginLocal(absPath);
  console.log(`
\u{1F440} \u76D1\u542C\u6587\u4EF6\u53D8\u52A8\u4E2D... (\u6309 Ctrl+C \u9000\u51FA)`);
  let debounceTimer = null;
  let isBuilding = false;
  const shouldIgnore = (filename) => {
    if (!filename) return false;
    const normalized = filename.replace(/\\/g, "/");
    return normalized.startsWith(".git") || normalized.startsWith("node_modules") || normalized.startsWith("dist") || normalized.endsWith(".btp") || normalized.includes("private_key.pem") || normalized.includes("public_key.pem") || normalized.includes(".DS_Store");
  };
  try {
    fs2.watch(absPath, { recursive: true }, (eventType, filename) => {
      if (shouldIgnore(filename)) return;
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        if (isBuilding) return;
        isBuilding = true;
        const timeStr = (/* @__PURE__ */ new Date()).toLocaleTimeString();
        console.log(`
\u{1F504} [${timeStr}] \u68C0\u6D4B\u5230\u6587\u4EF6\u53D8\u66F4${filename ? ` (${filename})` : ""}\uFF0C\u6B63\u5728\u6253\u5305\u3001\u66F4\u65B0\u5E76\u5237\u65B0\u5BBF\u4E3B...`);
        try {
          await installPluginLocal(absPath);
        } catch (e) {
          console.error(`\u26A0\uFE0F \u70ED\u76D1\u89C6\u66F4\u65B0\u53D1\u751F\u5F02\u5E38:`, e.message);
        } finally {
          isBuilding = false;
        }
      }, 300);
    });
  } catch (err) {
    console.error(`\u274C \u65E0\u6CD5\u5BF9 ${absPath} \u5F00\u542F\u9012\u5F52\u76D1\u542C:`, err.message);
    process.exit(1);
  }
}
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  await checkAndUpgrade(false);
  switch (command) {
    case "-v":
    case "--version":
    case "version": {
      console.log(`v${cliVersion}`);
      break;
    }
    case "upgrade": {
      await checkAndUpgrade(true);
      break;
    }
    case "create": {
      const name = args[1];
      if (!name || name.startsWith("--")) {
        console.error("\u274C \u8BF7\u6307\u5B9A\u63D2\u4EF6\u540D\u79F0\u3002\u4F8B\u5982\uFF1Aberrytrace-cli create my-plugin [--id <id>]");
        process.exit(1);
      }
      const idIndex = args.indexOf("--id");
      const id = idIndex !== -1 ? args[idIndex + 1] : void 0;
      await createPlugin(name, { id });
      break;
    }
    case "build": {
      const reloadFlag = args.includes("--reload") || args.includes("-r");
      const filteredArgs = args.slice(1).filter((a) => a !== "--reload" && a !== "-r");
      const pluginPath = filteredArgs[0] ? path2.resolve(filteredArgs[0]) : process.cwd();
      const res = await performSdkBuild(pluginPath);
      if (!res.success) {
        process.exit(1);
      }
      if (reloadFlag || args.length === 1 || args.length === 2 && !args[1].startsWith("-")) {
        await notifyLocalServer(res.pluginId, pluginPath);
      }
      break;
    }
    case "reload": {
      const pluginPath = args[1] ? path2.resolve(args[1]) : process.cwd();
      let pluginId = args[1];
      const pluginJsonPath = path2.join(pluginPath, "plugin.json");
      if (fs2.existsSync(pluginJsonPath)) {
        try {
          const pluginJson = JSON.parse(fs2.readFileSync(pluginJsonPath, "utf8"));
          if (pluginJson.id) pluginId = pluginJson.id;
        } catch {
        }
      }
      if (!pluginId) {
        console.error("\u274C \u65E0\u6CD5\u83B7\u53D6\u63D2\u4EF6 ID\uFF0C\u8BF7\u5728\u63D2\u4EF6\u76EE\u5F55\u8FD0\u884C\u6216\u6307\u5B9A\u63D2\u4EF6 ID/\u8DEF\u5F84");
        process.exit(1);
      }
      await notifyLocalServer(pluginId, pluginPath);
      break;
    }
    case "logs": {
      const targetArg = args[1];
      let pluginId = void 0;
      if (targetArg && !targetArg.startsWith("--")) {
        const pluginPath = path2.resolve(targetArg);
        const pluginJsonPath = path2.join(pluginPath, "plugin.json");
        if (fs2.existsSync(pluginJsonPath)) {
          try {
            const pluginJson = JSON.parse(fs2.readFileSync(pluginJsonPath, "utf8"));
            if (pluginJson.id) pluginId = pluginJson.id;
          } catch {
            pluginId = targetArg;
          }
        } else {
          pluginId = targetArg;
        }
      }
      const limitArgIndex = args.indexOf("--limit");
      const limit = limitArgIndex !== -1 ? parseInt(args[limitArgIndex + 1], 10) : 50;
      await fetchLogsFromLocalServerOrFile(pluginId, limit);
      break;
    }
    case "generate-keys": {
      generateKeys();
      break;
    }
    case "pack": {
      const installFlag = args.includes("--install") || args.includes("-i");
      const filteredArgs = args.slice(1).filter((a) => a !== "--install" && a !== "-i");
      const pluginPath = filteredArgs[0] ? path2.resolve(filteredArgs[0]) : process.cwd();
      if (installFlag) {
        const success = await installPluginLocal(pluginPath);
        if (!success) process.exit(1);
      } else {
        const buildSuccess = await runLocalBuild(pluginPath);
        if (buildSuccess) {
          packPlugin(pluginPath);
        } else {
          process.exit(1);
        }
      }
      break;
    }
    case "install": {
      const pluginPath = args[1] ? path2.resolve(args[1]) : process.cwd();
      const success = await installPluginLocal(pluginPath);
      if (!success) process.exit(1);
      break;
    }
    case "dev": {
      const pluginPath = args[1] && !args[1].startsWith("-") ? path2.resolve(args[1]) : process.cwd();
      await startDevWatch(pluginPath);
      break;
    }
    case "login": {
      loginDeveloper();
      break;
    }
    case "pack-publish":
    case "publish": {
      const targetPath = args[1] ? path2.resolve(args[1]) : process.cwd();
      let btpPath = targetPath;
      if (fs2.existsSync(targetPath) && fs2.statSync(targetPath).isDirectory()) {
        const buildSuccess = await runLocalBuild(targetPath);
        if (!buildSuccess) {
          process.exit(1);
        }
        btpPath = packPlugin(targetPath);
        console.log("");
      }
      await publishPlugin(btpPath);
      break;
    }
    default: {
      console.log(`\u8393\u8393\u5370\u8BB0\u63D2\u4EF6 SDK \u547D\u4EE4\u884C\u5DE5\u5177 (BerryTrace Plugin SDK CLI) v${cliVersion}`);
      console.log("========================================================");
      console.log("\u4F7F\u7528\u65B9\u6CD5:");
      console.log("  berrytrace-cli -v, --version         - \u663E\u793A\u7248\u672C\u53F7");
      console.log("  berrytrace-cli upgrade               - \u68C0\u67E5\u5E76\u81EA\u6211\u5347\u7EA7\u5230\u6700\u65B0\u7248\u672C");
      console.log("  berrytrace-cli create <name>         - \u521D\u59CB\u5316\u4E00\u4E2A\u65B0\u7684\u63D2\u4EF6\u9879\u76EE\u76EE\u5F55");
      console.log("  berrytrace-cli build [path] [--reload] - \u4F7F\u7528 SDK \u81EA\u52A8\u6784\u5EFA\u63D2\u4EF6\u6E90\u7801\u5E76\u901A\u77E5\u5BBF\u4E3B\u70ED\u91CD\u8F7D");
      console.log("  berrytrace-cli dev [path]            - \u542F\u52A8\u70ED\u76D1\u89C6\u5F00\u53D1\u5DE5\u4F5C\u6D41 (\u81EA\u52A8\u6253\u5305\u3001\u5B89\u88C5\u5E76\u5237\u65B0\u5BBF\u4E3B)");
      console.log("  berrytrace-cli install [path]        - \u4E00\u952E\u7F16\u8BD1\u6253\u5305 (.btp) \u5E76\u66F4\u65B0\u5B89\u88C5\u5230\u672C\u5730\u5BBF\u4E3B\u73AF\u5883\u5237\u65B0");
      console.log("  berrytrace-cli pack [path] [--install] - \u7F16\u8BD1\u5E76\u6253\u5305\u4E3A .btp \u683C\u5F0F\u5B89\u88C5\u5305\uFF08\u652F\u6301 --install \u81EA\u52A8\u5B89\u88C5\uFF09");
      console.log("  berrytrace-cli reload [path|id]      - \u901A\u77E5\u5BBF\u4E3B\u672C\u5730 LocalServer \u70ED\u91CD\u8F7D\u6216\u52A0\u8F7D\u89E3\u5305\u63D2\u4EF6");
      console.log("  berrytrace-cli logs [path|id] [--limit 50] - \u83B7\u53D6\u5BBF\u4E3B\u8FD0\u884C\u7684\u65E5\u5FD7\uFF08\u81EA\u52A8\u964D\u7EA7\u8BFB\u53D6\u672C\u5730 app.log\uFF09");
      console.log("  berrytrace-cli generate-keys         - \u751F\u6210\u7528\u4E8E\u63D2\u4EF6\u7B7E\u540D\u7684\u5F00\u53D1\u5BC6\u94A5\u5BF9 (\u79C1\u94A5/\u516C\u94A5)");
      console.log("  berrytrace-cli login                 - \u5728\u6D4F\u89C8\u5668\u4E2D\u767B\u5F55\u5E76\u83B7\u53D6 CLI \u6388\u6743\u51ED\u8BC1");
      console.log("  berrytrace-cli publish [path]        - \u7F16\u8BD1\u3001\u6253\u5305\u5E76\u53D1\u5E03\u63D2\u4EF6\uFF08\u652F\u6301\u76EE\u5F55\u8DEF\u5F84\uFF0C\u6216\u76F4\u63A5\u6307\u5B9A .btp \u6587\u4EF6\uFF09");
      process.exit(0);
    }
  }
}
main().catch((err) => {
  console.error("\u8FD0\u884C\u65F6\u53D1\u751F\u81F4\u547D\u9519\u8BEF:", err);
  process.exit(1);
});
