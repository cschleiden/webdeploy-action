module.exports =
/******/ (function(modules, runtime) { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	__webpack_require__.ab = __dirname + "/";
/******/
/******/ 	// the startup function
/******/ 	function startup() {
/******/ 		// Load entry module and return exports
/******/ 		return __webpack_require__(325);
/******/ 	};
/******/
/******/ 	// run startup
/******/ 	return startup();
/******/ })
/************************************************************************/
/******/ ({

/***/ 1:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const childProcess = __webpack_require__(129);
const path = __webpack_require__(622);
const util_1 = __webpack_require__(669);
const ioUtil = __webpack_require__(672);
const exec = util_1.promisify(childProcess.exec);
/**
 * Copies a file or folder.
 * Based off of shelljs - https://github.com/shelljs/shelljs/blob/9237f66c52e5daa40458f94f9565e18e8132f5a6/src/cp.js
 *
 * @param     source    source path
 * @param     dest      destination path
 * @param     options   optional. See CopyOptions.
 */
function cp(source, dest, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const { force, recursive } = readCopyOptions(options);
        const destStat = (yield ioUtil.exists(dest)) ? yield ioUtil.stat(dest) : null;
        // Dest is an existing file, but not forcing
        if (destStat && destStat.isFile() && !force) {
            return;
        }
        // If dest is an existing directory, should copy inside.
        const newDest = destStat && destStat.isDirectory()
            ? path.join(dest, path.basename(source))
            : dest;
        if (!(yield ioUtil.exists(source))) {
            throw new Error(`no such file or directory: ${source}`);
        }
        const sourceStat = yield ioUtil.stat(source);
        if (sourceStat.isDirectory()) {
            if (!recursive) {
                throw new Error(`Failed to copy. ${source} is a directory, but tried to copy without recursive flag.`);
            }
            else {
                yield cpDirRecursive(source, newDest, 0, force);
            }
        }
        else {
            if (path.relative(source, newDest) === '') {
                // a file cannot be copied to itself
                throw new Error(`'${newDest}' and '${source}' are the same file`);
            }
            yield copyFile(source, newDest, force);
        }
    });
}
exports.cp = cp;
/**
 * Moves a path.
 *
 * @param     source    source path
 * @param     dest      destination path
 * @param     options   optional. See MoveOptions.
 */
function mv(source, dest, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        if (yield ioUtil.exists(dest)) {
            let destExists = true;
            if (yield ioUtil.isDirectory(dest)) {
                // If dest is directory copy src into dest
                dest = path.join(dest, path.basename(source));
                destExists = yield ioUtil.exists(dest);
            }
            if (destExists) {
                if (options.force == null || options.force) {
                    yield rmRF(dest);
                }
                else {
                    throw new Error('Destination already exists');
                }
            }
        }
        yield mkdirP(path.dirname(dest));
        yield ioUtil.rename(source, dest);
    });
}
exports.mv = mv;
/**
 * Remove a path recursively with force
 *
 * @param inputPath path to remove
 */
function rmRF(inputPath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (ioUtil.IS_WINDOWS) {
            // Node doesn't provide a delete operation, only an unlink function. This means that if the file is being used by another
            // program (e.g. antivirus), it won't be deleted. To address this, we shell out the work to rd/del.
            try {
                if (yield ioUtil.isDirectory(inputPath, true)) {
                    yield exec(`rd /s /q "${inputPath}"`);
                }
                else {
                    yield exec(`del /f /a "${inputPath}"`);
                }
            }
            catch (err) {
                // if you try to delete a file that doesn't exist, desired result is achieved
                // other errors are valid
                if (err.code !== 'ENOENT')
                    throw err;
            }
            // Shelling out fails to remove a symlink folder with missing source, this unlink catches that
            try {
                yield ioUtil.unlink(inputPath);
            }
            catch (err) {
                // if you try to delete a file that doesn't exist, desired result is achieved
                // other errors are valid
                if (err.code !== 'ENOENT')
                    throw err;
            }
        }
        else {
            let isDir = false;
            try {
                isDir = yield ioUtil.isDirectory(inputPath);
            }
            catch (err) {
                // if you try to delete a file that doesn't exist, desired result is achieved
                // other errors are valid
                if (err.code !== 'ENOENT')
                    throw err;
                return;
            }
            if (isDir) {
                yield exec(`rm -rf "${inputPath}"`);
            }
            else {
                yield ioUtil.unlink(inputPath);
            }
        }
    });
}
exports.rmRF = rmRF;
/**
 * Make a directory.  Creates the full path with folders in between
 * Will throw if it fails
 *
 * @param   fsPath        path to create
 * @returns Promise<void>
 */
function mkdirP(fsPath) {
    return __awaiter(this, void 0, void 0, function* () {
        yield ioUtil.mkdirP(fsPath);
    });
}
exports.mkdirP = mkdirP;
/**
 * Returns path of a tool had the tool actually been invoked.  Resolves via paths.
 * If you check and the tool does not exist, it will throw.
 *
 * @param     tool              name of the tool
 * @param     check             whether to check if tool exists
 * @returns   Promise<string>   path to tool
 */
function which(tool, check) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!tool) {
            throw new Error("parameter 'tool' is required");
        }
        // recursive when check=true
        if (check) {
            const result = yield which(tool, false);
            if (!result) {
                if (ioUtil.IS_WINDOWS) {
                    throw new Error(`Unable to locate executable file: ${tool}. Please verify either the file path exists or the file can be found within a directory specified by the PATH environment variable. Also verify the file has a valid extension for an executable file.`);
                }
                else {
                    throw new Error(`Unable to locate executable file: ${tool}. Please verify either the file path exists or the file can be found within a directory specified by the PATH environment variable. Also check the file mode to verify the file is executable.`);
                }
            }
        }
        try {
            // build the list of extensions to try
            const extensions = [];
            if (ioUtil.IS_WINDOWS && process.env.PATHEXT) {
                for (const extension of process.env.PATHEXT.split(path.delimiter)) {
                    if (extension) {
                        extensions.push(extension);
                    }
                }
            }
            // if it's rooted, return it if exists. otherwise return empty.
            if (ioUtil.isRooted(tool)) {
                const filePath = yield ioUtil.tryGetExecutablePath(tool, extensions);
                if (filePath) {
                    return filePath;
                }
                return '';
            }
            // if any path separators, return empty
            if (tool.includes('/') || (ioUtil.IS_WINDOWS && tool.includes('\\'))) {
                return '';
            }
            // build the list of directories
            //
            // Note, technically "where" checks the current directory on Windows. From a toolkit perspective,
            // it feels like we should not do this. Checking the current directory seems like more of a use
            // case of a shell, and the which() function exposed by the toolkit should strive for consistency
            // across platforms.
            const directories = [];
            if (process.env.PATH) {
                for (const p of process.env.PATH.split(path.delimiter)) {
                    if (p) {
                        directories.push(p);
                    }
                }
            }
            // return the first match
            for (const directory of directories) {
                const filePath = yield ioUtil.tryGetExecutablePath(directory + path.sep + tool, extensions);
                if (filePath) {
                    return filePath;
                }
            }
            return '';
        }
        catch (err) {
            throw new Error(`which failed with message ${err.message}`);
        }
    });
}
exports.which = which;
function readCopyOptions(options) {
    const force = options.force == null ? true : options.force;
    const recursive = Boolean(options.recursive);
    return { force, recursive };
}
function cpDirRecursive(sourceDir, destDir, currentDepth, force) {
    return __awaiter(this, void 0, void 0, function* () {
        // Ensure there is not a run away recursive copy
        if (currentDepth >= 255)
            return;
        currentDepth++;
        yield mkdirP(destDir);
        const files = yield ioUtil.readdir(sourceDir);
        for (const fileName of files) {
            const srcFile = `${sourceDir}/${fileName}`;
            const destFile = `${destDir}/${fileName}`;
            const srcFileStat = yield ioUtil.lstat(srcFile);
            if (srcFileStat.isDirectory()) {
                // Recurse
                yield cpDirRecursive(srcFile, destFile, currentDepth, force);
            }
            else {
                yield copyFile(srcFile, destFile, force);
            }
        }
        // Change the mode for the newly created directory
        yield ioUtil.chmod(destDir, (yield ioUtil.stat(sourceDir)).mode);
    });
}
// Buffered file copy
function copyFile(srcFile, destFile, force) {
    return __awaiter(this, void 0, void 0, function* () {
        if ((yield ioUtil.lstat(srcFile)).isSymbolicLink()) {
            // unlink/re-link it
            try {
                yield ioUtil.lstat(destFile);
                yield ioUtil.unlink(destFile);
            }
            catch (e) {
                // Try to override file permission
                if (e.code === 'EPERM') {
                    yield ioUtil.chmod(destFile, '0666');
                    yield ioUtil.unlink(destFile);
                }
                // other errors = it doesn't exist, no work to do
            }
            // Copy over symlink
            const symlinkFull = yield ioUtil.readlink(srcFile);
            yield ioUtil.symlink(symlinkFull, destFile, ioUtil.IS_WINDOWS ? 'junction' : null);
        }
        else if (!(yield ioUtil.exists(destFile)) || force) {
            yield ioUtil.copyFile(srcFile, destFile);
        }
    });
}
//# sourceMappingURL=io.js.map

/***/ }),

/***/ 9:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const os = __webpack_require__(87);
const events = __webpack_require__(614);
const child = __webpack_require__(129);
/* eslint-disable @typescript-eslint/unbound-method */
const IS_WINDOWS = process.platform === 'win32';
/*
 * Class for running command line tools. Handles quoting and arg parsing in a platform agnostic way.
 */
class ToolRunner extends events.EventEmitter {
    constructor(toolPath, args, options) {
        super();
        if (!toolPath) {
            throw new Error("Parameter 'toolPath' cannot be null or empty.");
        }
        this.toolPath = toolPath;
        this.args = args || [];
        this.options = options || {};
    }
    _debug(message) {
        if (this.options.listeners && this.options.listeners.debug) {
            this.options.listeners.debug(message);
        }
    }
    _getCommandString(options, noPrefix) {
        const toolPath = this._getSpawnFileName();
        const args = this._getSpawnArgs(options);
        let cmd = noPrefix ? '' : '[command]'; // omit prefix when piped to a second tool
        if (IS_WINDOWS) {
            // Windows + cmd file
            if (this._isCmdFile()) {
                cmd += toolPath;
                for (const a of args) {
                    cmd += ` ${a}`;
                }
            }
            // Windows + verbatim
            else if (options.windowsVerbatimArguments) {
                cmd += `"${toolPath}"`;
                for (const a of args) {
                    cmd += ` ${a}`;
                }
            }
            // Windows (regular)
            else {
                cmd += this._windowsQuoteCmdArg(toolPath);
                for (const a of args) {
                    cmd += ` ${this._windowsQuoteCmdArg(a)}`;
                }
            }
        }
        else {
            // OSX/Linux - this can likely be improved with some form of quoting.
            // creating processes on Unix is fundamentally different than Windows.
            // on Unix, execvp() takes an arg array.
            cmd += toolPath;
            for (const a of args) {
                cmd += ` ${a}`;
            }
        }
        return cmd;
    }
    _processLineBuffer(data, strBuffer, onLine) {
        try {
            let s = strBuffer + data.toString();
            let n = s.indexOf(os.EOL);
            while (n > -1) {
                const line = s.substring(0, n);
                onLine(line);
                // the rest of the string ...
                s = s.substring(n + os.EOL.length);
                n = s.indexOf(os.EOL);
            }
            strBuffer = s;
        }
        catch (err) {
            // streaming lines to console is best effort.  Don't fail a build.
            this._debug(`error processing line. Failed with error ${err}`);
        }
    }
    _getSpawnFileName() {
        if (IS_WINDOWS) {
            if (this._isCmdFile()) {
                return process.env['COMSPEC'] || 'cmd.exe';
            }
        }
        return this.toolPath;
    }
    _getSpawnArgs(options) {
        if (IS_WINDOWS) {
            if (this._isCmdFile()) {
                let argline = `/D /S /C "${this._windowsQuoteCmdArg(this.toolPath)}`;
                for (const a of this.args) {
                    argline += ' ';
                    argline += options.windowsVerbatimArguments
                        ? a
                        : this._windowsQuoteCmdArg(a);
                }
                argline += '"';
                return [argline];
            }
        }
        return this.args;
    }
    _endsWith(str, end) {
        return str.endsWith(end);
    }
    _isCmdFile() {
        const upperToolPath = this.toolPath.toUpperCase();
        return (this._endsWith(upperToolPath, '.CMD') ||
            this._endsWith(upperToolPath, '.BAT'));
    }
    _windowsQuoteCmdArg(arg) {
        // for .exe, apply the normal quoting rules that libuv applies
        if (!this._isCmdFile()) {
            return this._uvQuoteCmdArg(arg);
        }
        // otherwise apply quoting rules specific to the cmd.exe command line parser.
        // the libuv rules are generic and are not designed specifically for cmd.exe
        // command line parser.
        //
        // for a detailed description of the cmd.exe command line parser, refer to
        // http://stackoverflow.com/questions/4094699/how-does-the-windows-command-interpreter-cmd-exe-parse-scripts/7970912#7970912
        // need quotes for empty arg
        if (!arg) {
            return '""';
        }
        // determine whether the arg needs to be quoted
        const cmdSpecialChars = [
            ' ',
            '\t',
            '&',
            '(',
            ')',
            '[',
            ']',
            '{',
            '}',
            '^',
            '=',
            ';',
            '!',
            "'",
            '+',
            ',',
            '`',
            '~',
            '|',
            '<',
            '>',
            '"'
        ];
        let needsQuotes = false;
        for (const char of arg) {
            if (cmdSpecialChars.some(x => x === char)) {
                needsQuotes = true;
                break;
            }
        }
        // short-circuit if quotes not needed
        if (!needsQuotes) {
            return arg;
        }
        // the following quoting rules are very similar to the rules that by libuv applies.
        //
        // 1) wrap the string in quotes
        //
        // 2) double-up quotes - i.e. " => ""
        //
        //    this is different from the libuv quoting rules. libuv replaces " with \", which unfortunately
        //    doesn't work well with a cmd.exe command line.
        //
        //    note, replacing " with "" also works well if the arg is passed to a downstream .NET console app.
        //    for example, the command line:
        //          foo.exe "myarg:""my val"""
        //    is parsed by a .NET console app into an arg array:
        //          [ "myarg:\"my val\"" ]
        //    which is the same end result when applying libuv quoting rules. although the actual
        //    command line from libuv quoting rules would look like:
        //          foo.exe "myarg:\"my val\""
        //
        // 3) double-up slashes that precede a quote,
        //    e.g.  hello \world    => "hello \world"
        //          hello\"world    => "hello\\""world"
        //          hello\\"world   => "hello\\\\""world"
        //          hello world\    => "hello world\\"
        //
        //    technically this is not required for a cmd.exe command line, or the batch argument parser.
        //    the reasons for including this as a .cmd quoting rule are:
        //
        //    a) this is optimized for the scenario where the argument is passed from the .cmd file to an
        //       external program. many programs (e.g. .NET console apps) rely on the slash-doubling rule.
        //
        //    b) it's what we've been doing previously (by deferring to node default behavior) and we
        //       haven't heard any complaints about that aspect.
        //
        // note, a weakness of the quoting rules chosen here, is that % is not escaped. in fact, % cannot be
        // escaped when used on the command line directly - even though within a .cmd file % can be escaped
        // by using %%.
        //
        // the saving grace is, on the command line, %var% is left as-is if var is not defined. this contrasts
        // the line parsing rules within a .cmd file, where if var is not defined it is replaced with nothing.
        //
        // one option that was explored was replacing % with ^% - i.e. %var% => ^%var^%. this hack would
        // often work, since it is unlikely that var^ would exist, and the ^ character is removed when the
        // variable is used. the problem, however, is that ^ is not removed when %* is used to pass the args
        // to an external program.
        //
        // an unexplored potential solution for the % escaping problem, is to create a wrapper .cmd file.
        // % can be escaped within a .cmd file.
        let reverse = '"';
        let quoteHit = true;
        for (let i = arg.length; i > 0; i--) {
            // walk the string in reverse
            reverse += arg[i - 1];
            if (quoteHit && arg[i - 1] === '\\') {
                reverse += '\\'; // double the slash
            }
            else if (arg[i - 1] === '"') {
                quoteHit = true;
                reverse += '"'; // double the quote
            }
            else {
                quoteHit = false;
            }
        }
        reverse += '"';
        return reverse
            .split('')
            .reverse()
            .join('');
    }
    _uvQuoteCmdArg(arg) {
        // Tool runner wraps child_process.spawn() and needs to apply the same quoting as
        // Node in certain cases where the undocumented spawn option windowsVerbatimArguments
        // is used.
        //
        // Since this function is a port of quote_cmd_arg from Node 4.x (technically, lib UV,
        // see https://github.com/nodejs/node/blob/v4.x/deps/uv/src/win/process.c for details),
        // pasting copyright notice from Node within this function:
        //
        //      Copyright Joyent, Inc. and other Node contributors. All rights reserved.
        //
        //      Permission is hereby granted, free of charge, to any person obtaining a copy
        //      of this software and associated documentation files (the "Software"), to
        //      deal in the Software without restriction, including without limitation the
        //      rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
        //      sell copies of the Software, and to permit persons to whom the Software is
        //      furnished to do so, subject to the following conditions:
        //
        //      The above copyright notice and this permission notice shall be included in
        //      all copies or substantial portions of the Software.
        //
        //      THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        //      IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
        //      FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
        //      AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
        //      LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
        //      FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
        //      IN THE SOFTWARE.
        if (!arg) {
            // Need double quotation for empty argument
            return '""';
        }
        if (!arg.includes(' ') && !arg.includes('\t') && !arg.includes('"')) {
            // No quotation needed
            return arg;
        }
        if (!arg.includes('"') && !arg.includes('\\')) {
            // No embedded double quotes or backslashes, so I can just wrap
            // quote marks around the whole thing.
            return `"${arg}"`;
        }
        // Expected input/output:
        //   input : hello"world
        //   output: "hello\"world"
        //   input : hello""world
        //   output: "hello\"\"world"
        //   input : hello\world
        //   output: hello\world
        //   input : hello\\world
        //   output: hello\\world
        //   input : hello\"world
        //   output: "hello\\\"world"
        //   input : hello\\"world
        //   output: "hello\\\\\"world"
        //   input : hello world\
        //   output: "hello world\\" - note the comment in libuv actually reads "hello world\"
        //                             but it appears the comment is wrong, it should be "hello world\\"
        let reverse = '"';
        let quoteHit = true;
        for (let i = arg.length; i > 0; i--) {
            // walk the string in reverse
            reverse += arg[i - 1];
            if (quoteHit && arg[i - 1] === '\\') {
                reverse += '\\';
            }
            else if (arg[i - 1] === '"') {
                quoteHit = true;
                reverse += '\\';
            }
            else {
                quoteHit = false;
            }
        }
        reverse += '"';
        return reverse
            .split('')
            .reverse()
            .join('');
    }
    _cloneExecOptions(options) {
        options = options || {};
        const result = {
            cwd: options.cwd || process.cwd(),
            env: options.env || process.env,
            silent: options.silent || false,
            windowsVerbatimArguments: options.windowsVerbatimArguments || false,
            failOnStdErr: options.failOnStdErr || false,
            ignoreReturnCode: options.ignoreReturnCode || false,
            delay: options.delay || 10000
        };
        result.outStream = options.outStream || process.stdout;
        result.errStream = options.errStream || process.stderr;
        return result;
    }
    _getSpawnOptions(options, toolPath) {
        options = options || {};
        const result = {};
        result.cwd = options.cwd;
        result.env = options.env;
        result['windowsVerbatimArguments'] =
            options.windowsVerbatimArguments || this._isCmdFile();
        if (options.windowsVerbatimArguments) {
            result.argv0 = `"${toolPath}"`;
        }
        return result;
    }
    /**
     * Exec a tool.
     * Output will be streamed to the live console.
     * Returns promise with return code
     *
     * @param     tool     path to tool to exec
     * @param     options  optional exec options.  See ExecOptions
     * @returns   number
     */
    exec() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this._debug(`exec tool: ${this.toolPath}`);
                this._debug('arguments:');
                for (const arg of this.args) {
                    this._debug(`   ${arg}`);
                }
                const optionsNonNull = this._cloneExecOptions(this.options);
                if (!optionsNonNull.silent && optionsNonNull.outStream) {
                    optionsNonNull.outStream.write(this._getCommandString(optionsNonNull) + os.EOL);
                }
                const state = new ExecState(optionsNonNull, this.toolPath);
                state.on('debug', (message) => {
                    this._debug(message);
                });
                const fileName = this._getSpawnFileName();
                const cp = child.spawn(fileName, this._getSpawnArgs(optionsNonNull), this._getSpawnOptions(this.options, fileName));
                const stdbuffer = '';
                if (cp.stdout) {
                    cp.stdout.on('data', (data) => {
                        if (this.options.listeners && this.options.listeners.stdout) {
                            this.options.listeners.stdout(data);
                        }
                        if (!optionsNonNull.silent && optionsNonNull.outStream) {
                            optionsNonNull.outStream.write(data);
                        }
                        this._processLineBuffer(data, stdbuffer, (line) => {
                            if (this.options.listeners && this.options.listeners.stdline) {
                                this.options.listeners.stdline(line);
                            }
                        });
                    });
                }
                const errbuffer = '';
                if (cp.stderr) {
                    cp.stderr.on('data', (data) => {
                        state.processStderr = true;
                        if (this.options.listeners && this.options.listeners.stderr) {
                            this.options.listeners.stderr(data);
                        }
                        if (!optionsNonNull.silent &&
                            optionsNonNull.errStream &&
                            optionsNonNull.outStream) {
                            const s = optionsNonNull.failOnStdErr
                                ? optionsNonNull.errStream
                                : optionsNonNull.outStream;
                            s.write(data);
                        }
                        this._processLineBuffer(data, errbuffer, (line) => {
                            if (this.options.listeners && this.options.listeners.errline) {
                                this.options.listeners.errline(line);
                            }
                        });
                    });
                }
                cp.on('error', (err) => {
                    state.processError = err.message;
                    state.processExited = true;
                    state.processClosed = true;
                    state.CheckComplete();
                });
                cp.on('exit', (code) => {
                    state.processExitCode = code;
                    state.processExited = true;
                    this._debug(`Exit code ${code} received from tool '${this.toolPath}'`);
                    state.CheckComplete();
                });
                cp.on('close', (code) => {
                    state.processExitCode = code;
                    state.processExited = true;
                    state.processClosed = true;
                    this._debug(`STDIO streams have closed for tool '${this.toolPath}'`);
                    state.CheckComplete();
                });
                state.on('done', (error, exitCode) => {
                    if (stdbuffer.length > 0) {
                        this.emit('stdline', stdbuffer);
                    }
                    if (errbuffer.length > 0) {
                        this.emit('errline', errbuffer);
                    }
                    cp.removeAllListeners();
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(exitCode);
                    }
                });
            });
        });
    }
}
exports.ToolRunner = ToolRunner;
/**
 * Convert an arg string to an array of args. Handles escaping
 *
 * @param    argString   string of arguments
 * @returns  string[]    array of arguments
 */
function argStringToArray(argString) {
    const args = [];
    let inQuotes = false;
    let escaped = false;
    let arg = '';
    function append(c) {
        // we only escape double quotes.
        if (escaped && c !== '"') {
            arg += '\\';
        }
        arg += c;
        escaped = false;
    }
    for (let i = 0; i < argString.length; i++) {
        const c = argString.charAt(i);
        if (c === '"') {
            if (!escaped) {
                inQuotes = !inQuotes;
            }
            else {
                append(c);
            }
            continue;
        }
        if (c === '\\' && escaped) {
            append(c);
            continue;
        }
        if (c === '\\' && inQuotes) {
            escaped = true;
            continue;
        }
        if (c === ' ' && !inQuotes) {
            if (arg.length > 0) {
                args.push(arg);
                arg = '';
            }
            continue;
        }
        append(c);
    }
    if (arg.length > 0) {
        args.push(arg.trim());
    }
    return args;
}
exports.argStringToArray = argStringToArray;
class ExecState extends events.EventEmitter {
    constructor(options, toolPath) {
        super();
        this.processClosed = false; // tracks whether the process has exited and stdio is closed
        this.processError = '';
        this.processExitCode = 0;
        this.processExited = false; // tracks whether the process has exited
        this.processStderr = false; // tracks whether stderr was written to
        this.delay = 10000; // 10 seconds
        this.done = false;
        this.timeout = null;
        if (!toolPath) {
            throw new Error('toolPath must not be empty');
        }
        this.options = options;
        this.toolPath = toolPath;
        if (options.delay) {
            this.delay = options.delay;
        }
    }
    CheckComplete() {
        if (this.done) {
            return;
        }
        if (this.processClosed) {
            this._setResult();
        }
        else if (this.processExited) {
            this.timeout = setTimeout(ExecState.HandleTimeout, this.delay, this);
        }
    }
    _debug(message) {
        this.emit('debug', message);
    }
    _setResult() {
        // determine whether there is an error
        let error;
        if (this.processExited) {
            if (this.processError) {
                error = new Error(`There was an error when attempting to execute the process '${this.toolPath}'. This may indicate the process failed to start. Error: ${this.processError}`);
            }
            else if (this.processExitCode !== 0 && !this.options.ignoreReturnCode) {
                error = new Error(`The process '${this.toolPath}' failed with exit code ${this.processExitCode}`);
            }
            else if (this.processStderr && this.options.failOnStdErr) {
                error = new Error(`The process '${this.toolPath}' failed because one or more lines were written to the STDERR stream`);
            }
        }
        // clear the timeout
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        this.done = true;
        this.emit('done', error, this.processExitCode);
    }
    static HandleTimeout(state) {
        if (state.done) {
            return;
        }
        if (!state.processClosed && state.processExited) {
            const message = `The STDIO streams did not close within ${state.delay /
                1000} seconds of the exit event from process '${state.toolPath}'. This may indicate a child process inherited the STDIO streams and has not yet exited.`;
            state._debug(message);
        }
        state._setResult();
    }
}
//# sourceMappingURL=toolrunner.js.map

/***/ }),

/***/ 47:
/***/ (function(module, __unusedexports, __webpack_require__) {

const fs = __webpack_require__(747);
const globrex = __webpack_require__(377);
const { promisify } = __webpack_require__(669);
const globalyzer = __webpack_require__(799);
const { join, resolve, relative } = __webpack_require__(622);
const isHidden = /(^|[\\\/])\.[^\\\/\.]/g;
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
let CACHE = {};

async function walk(output, prefix, lexer, opts, dirname='', level=0) {
  const rgx = lexer.segments[level];
  const dir = join(opts.cwd, prefix, dirname);
  const files = await readdir(dir);
  const { dot, filesOnly } = opts;

  let i=0, len=files.length, file;
  let fullpath, relpath, stats, isMatch;

  for (; i < len; i++) {
    fullpath = join(dir, file=files[i]);
    relpath = dirname ? join(dirname, file) : file;
    if (!dot && isHidden.test(relpath)) continue;
    isMatch = lexer.regex.test(relpath);

    if ((stats=CACHE[relpath]) === void 0) {
      CACHE[relpath] = stats = fs.lstatSync(fullpath);
    }

    if (!stats.isDirectory()) {
      isMatch && output.push(relative(opts.cwd, fullpath));
      continue;
    }

    if (rgx && !rgx.test(file)) continue;
    !filesOnly && isMatch && output.push(join(prefix, relpath));

    await walk(output, prefix, lexer, opts, relpath, rgx && rgx.toString() !== lexer.globstar && ++level);
  }
}

/**
 * Find files using bash-like globbing.
 * All paths are normalized compared to node-glob.
 * @param {String} str Glob string
 * @param {String} [options.cwd='.'] Current working directory
 * @param {Boolean} [options.dot=false] Include dotfile matches
 * @param {Boolean} [options.absolute=false] Return absolute paths
 * @param {Boolean} [options.filesOnly=false] Do not include folders if true
 * @param {Boolean} [options.flush=false] Reset cache object
 * @returns {Array} array containing matching files
 */
module.exports = async function (str, opts={}) {
  if (!str) return [];

  let glob = globalyzer(str);

  opts.cwd = opts.cwd || '.';

  if (!glob.isGlob) {
    try {
      let resolved = resolve(opts.cwd, str);
      let dirent = await stat(resolved);
      if (opts.filesOnly && !dirent.isFile()) return [];

      return opts.absolute ? [resolved] : [str];
    } catch (err) {
      if (err.code != 'ENOENT') throw err;

      return [];
    }
  }

  if (opts.flush) CACHE = {};

  let matches = [];
  const { path } = globrex(glob.glob, { filepath:true, globstar:true, extended:true });

  path.globstar = path.globstar.toString();
  await walk(matches, glob.base, path, opts, '.', 0);

  return opts.absolute ? matches.map(x => resolve(opts.cwd, x)) : matches;
};


/***/ }),

/***/ 83:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(__webpack_require__(470));
const fs_1 = __webpack_require__(747);
const tiny_glob_1 = __importDefault(__webpack_require__(47));
/**
 * Validates the input package and finds out input type
 *
 * @param webDeployPkg Web Deploy Package input
 *
 * @return true/false based on input package type.
 */
function isInputPkgIsFolder(webDeployPkg) {
    return __awaiter(this, void 0, void 0, function* () {
        let stat;
        try {
            stat = yield fs_1.promises.stat(webDeployPkg);
        }
        catch (e) {
            throw new Error(`Could not find input pkg`);
        }
        return !stat.isFile();
    });
}
exports.isInputPkgIsFolder = isInputPkgIsFolder;
function findfiles(filepath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield tiny_glob_1.default(filepath);
        }
        catch (e) {
            core.error(e);
            return [];
        }
    });
}
exports.findfiles = findfiles;


/***/ }),

/***/ 87:
/***/ (function(module) {

module.exports = require("os");

/***/ }),

/***/ 129:
/***/ (function(module) {

module.exports = require("child_process");

/***/ }),

/***/ 325:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(__webpack_require__(470));
const utility_1 = __webpack_require__(83);
const deployusingmsdeploy_1 = __webpack_require__(846);
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Read inputs
            const webSiteName = core.getInput("webSiteName", {
                required: true
            });
            const webDeployPackageInput = core.getInput("package", {
                required: true
            });
            const removeAdditionalFilesFlag = core.getInput("removeAdditionalFilesFlag") == 'true';
            const takeAppOfflineFlag = core.getInput("takeAppOfflineFlag") == 'true';
            var availableWebPackages = yield utility_1.findfiles(webDeployPackageInput);
            if (availableWebPackages.length == 0) {
                throw new Error("Web deploy package not found");
            }
            if (availableWebPackages.length > 1) {
                throw new Error("More than one web deploy package found");
            }
            const webDeployPkg = availableWebPackages[0];
            const isFolderBasedDeployment = yield utility_1.isInputPkgIsFolder(webDeployPkg);
            yield deployusingmsdeploy_1.DeployUsingMSDeploy(webDeployPkg, webSiteName, null, removeAdditionalFilesFlag,
            false, // excludeFilesFromAppDataFlag,
            takeAppOfflineFlag,
            undefined, // virtualApplication,
            undefined, // setParametersFile,
            "-verbose", // additionalArguments,
            isFolderBasedDeployment, true);
        }
        catch (e) {
            core.setFailed(e.message);
        }
    });
}
run();


/***/ }),

/***/ 357:
/***/ (function(module) {

module.exports = require("assert");

/***/ }),

/***/ 377:
/***/ (function(module) {

const isWin = process.platform === 'win32';
const SEP = isWin ? `\\\\+` : `\\/`;
const SEP_ESC = isWin ? `\\\\` : `/`;
const GLOBSTAR = `((?:[^/]*(?:/|$))*)`;
const WILDCARD = `([^/]*)`;
const GLOBSTAR_SEGMENT = `((?:[^${SEP_ESC}]*(?:${SEP_ESC}|$))*)`;
const WILDCARD_SEGMENT = `([^${SEP_ESC}]*)`;

/**
 * Convert any glob pattern to a JavaScript Regexp object
 * @param {String} glob Glob pattern to convert
 * @param {Object} opts Configuration object
 * @param {Boolean} [opts.extended=false] Support advanced ext globbing
 * @param {Boolean} [opts.globstar=false] Support globstar
 * @param {Boolean} [opts.strict=true] be laissez faire about mutiple slashes
 * @param {Boolean} [opts.filepath=''] Parse as filepath for extra path related features
 * @param {String} [opts.flags=''] RegExp globs
 * @returns {Object} converted object with string, segments and RegExp object
 */
function globrex(glob, {extended = false, globstar = false, strict = false, filepath = false, flags = ''} = {}) {
    let regex = '';
    let segment = '';
    let path = { regex: '', segments: [] };

    // If we are doing extended matching, this boolean is true when we are inside
    // a group (eg {*.html,*.js}), and false otherwise.
    let inGroup = false;
    let inRange = false;

    // extglob stack. Keep track of scope
    const ext = [];

    // Helper function to build string and segments
    function add(str, {split, last, only}={}) {
        if (only !== 'path') regex += str;
        if (filepath && only !== 'regex') {
            path.regex += (str === '\\/' ? SEP : str);
            if (split) {
                if (last) segment += str;
                if (segment !== '') {
                    if (!flags.includes('g')) segment = `^${segment}$`; // change it 'includes'
                    path.segments.push(new RegExp(segment, flags));
                }
                segment = '';
            } else {
                segment += str;
            }
        }
    }

    let c, n;
    for (let i = 0; i < glob.length; i++) {
        c = glob[i];
        n = glob[i + 1];

        if (['\\', '$', '^', '.', '='].includes(c)) {
            add(`\\${c}`);
            continue;
        }

        if (c === '/') {
            add(`\\${c}`, {split: true});
            if (n === '/' && !strict) regex += '?';
            continue;
        }

        if (c === '(') {
            if (ext.length) {
                add(c);
                continue;
            }
            add(`\\${c}`);
            continue;
        }

        if (c === ')') {
            if (ext.length) {
                add(c);
                let type = ext.pop();
                if (type === '@') {
                    add('{1}');
                } else if (type === '!') {
                    add('([^\/]*)');
                } else {
                    add(type);
                }
                continue;
            }
            add(`\\${c}`);
            continue;
        }
        
        if (c === '|') {
            if (ext.length) {
                add(c);
                continue;
            }
            add(`\\${c}`);
            continue;
        }

        if (c === '+') {
            if (n === '(' && extended) {
                ext.push(c);
                continue;
            }
            add(`\\${c}`);
            continue;
        }

        if (c === '@' && extended) {
            if (n === '(') {
                ext.push(c);
                continue;
            }
        }

        if (c === '!') {
            if (extended) {
                if (inRange) {
                    add('^');
                    continue
                }
                if (n === '(') {
                    ext.push(c);
                    add('(?!');
                    i++;
                    continue;
                }
                add(`\\${c}`);
                continue;
            }
            add(`\\${c}`);
            continue;
        }

        if (c === '?') {
            if (extended) {
                if (n === '(') {
                    ext.push(c);
                } else {
                    add('.');
                }
                continue;
            }
            add(`\\${c}`);
            continue;
        }

        if (c === '[') {
            if (inRange && n === ':') {
                i++; // skip [
                let value = '';
                while(glob[++i] !== ':') value += glob[i];
                if (value === 'alnum') add('(\\w|\\d)');
                else if (value === 'space') add('\\s');
                else if (value === 'digit') add('\\d');
                i++; // skip last ]
                continue;
            }
            if (extended) {
                inRange = true;
                add(c);
                continue;
            }
            add(`\\${c}`);
            continue;
        }

        if (c === ']') {
            if (extended) {
                inRange = false;
                add(c);
                continue;
            }
            add(`\\${c}`);
            continue;
        }

        if (c === '{') {
            if (extended) {
                inGroup = true;
                add('(');
                continue;
            }
            add(`\\${c}`);
            continue;
        }

        if (c === '}') {
            if (extended) {
                inGroup = false;
                add(')');
                continue;
            }
            add(`\\${c}`);
            continue;
        }

        if (c === ',') {
            if (inGroup) {
                add('|');
                continue;
            }
            add(`\\${c}`);
            continue;
        }

        if (c === '*') {
            if (n === '(' && extended) {
                ext.push(c);
                continue;
            }
            // Move over all consecutive "*"'s.
            // Also store the previous and next characters
            let prevChar = glob[i - 1];
            let starCount = 1;
            while (glob[i + 1] === '*') {
                starCount++;
                i++;
            }
            let nextChar = glob[i + 1];
            if (!globstar) {
                // globstar is disabled, so treat any number of "*" as one
                add('.*');
            } else {
                // globstar is enabled, so determine if this is a globstar segment
                let isGlobstar =
                    starCount > 1 && // multiple "*"'s
                    (prevChar === '/' || prevChar === undefined) && // from the start of the segment
                    (nextChar === '/' || nextChar === undefined); // to the end of the segment
                if (isGlobstar) {
                    // it's a globstar, so match zero or more path segments
                    add(GLOBSTAR, {only:'regex'});
                    add(GLOBSTAR_SEGMENT, {only:'path', last:true, split:true});
                    i++; // move over the "/"
                } else {
                    // it's not a globstar, so only match one path segment
                    add(WILDCARD, {only:'regex'});
                    add(WILDCARD_SEGMENT, {only:'path'});
                }
            }
            continue;
        }

        add(c);
    }


    // When regexp 'g' flag is specified don't
    // constrain the regular expression with ^ & $
    if (!flags.includes('g')) {
        regex = `^${regex}$`;
        segment = `^${segment}$`;
        if (filepath) path.regex = `^${path.regex}$`;
    }

    const result = {regex: new RegExp(regex, flags)};

    // Push the last segment
    if (filepath) {
        path.segments.push(new RegExp(segment, flags));
        path.regex = new RegExp(path.regex, flags);
        path.globstar = new RegExp(!flags.includes('g') ? `^${GLOBSTAR_SEGMENT}$` : GLOBSTAR_SEGMENT, flags);
        result.path = path;
    }

    return result;
}

module.exports = globrex;


/***/ }),

/***/ 401:
/***/ (function(module, __unusedexports, __webpack_require__) {

/************************************************************************************************************
 * registry.js - contains a wrapper for the REG command under Windows, which provides access to the registry
 *
 * @author Paul Bottin a/k/a FrEsC
 *
 */

/* imports */
var util          = __webpack_require__(669)
,   path          = __webpack_require__(622)
,   spawn         = __webpack_require__(129).spawn

/* set to console.log for debugging */
,   log           = function () {}

/* registry hive ids */
,   HKLM          = 'HKLM'
,   HKCU          = 'HKCU'
,   HKCR          = 'HKCR'
,   HKU           = 'HKU'
,   HKCC          = 'HKCC'
,   HIVES         = [ HKLM, HKCU, HKCR, HKU, HKCC ]

/* registry value type ids */
,   REG_SZ        = 'REG_SZ'
,   REG_MULTI_SZ  = 'REG_MULTI_SZ'
,   REG_EXPAND_SZ = 'REG_EXPAND_SZ'
,   REG_DWORD     = 'REG_DWORD'
,   REG_QWORD     = 'REG_QWORD'
,   REG_BINARY    = 'REG_BINARY'
,   REG_NONE      = 'REG_NONE'
,   REG_TYPES     = [ REG_SZ, REG_MULTI_SZ, REG_EXPAND_SZ, REG_DWORD, REG_QWORD, REG_BINARY, REG_NONE ]

/* default registry value name */
,   DEFAULT_VALUE = ''

/* general key pattern */
,   KEY_PATTERN   = /(\\[a-zA-Z0-9_\s]+)*/

/* key path pattern (as returned by REG-cli) */
,   PATH_PATTERN  = /^(HKEY_LOCAL_MACHINE|HKEY_CURRENT_USER|HKEY_CLASSES_ROOT|HKEY_USERS|HKEY_CURRENT_CONFIG)(.*)$/

/* registry item pattern */
,   ITEM_PATTERN  = /^(.*)\s(REG_SZ|REG_MULTI_SZ|REG_EXPAND_SZ|REG_DWORD|REG_QWORD|REG_BINARY|REG_NONE)\s+([^\s].*)$/

/**
 * Creates an Error object that contains the exit code of the REG.EXE process.
 * This contructor is private. Objects of this type are created internally and returned in the <code>err</code> parameters in case the REG.EXE process doesn't exit cleanly.
 *
 * @private
 * @class
 *
 * @param {string} message - the error message
 * @param {number} code - the process exit code
 *
 */
function ProcessUncleanExitError(message, code) {
  if (!(this instanceof ProcessUncleanExitError))
    return new ProcessUncleanExitError(message, code);

  Error.captureStackTrace(this, ProcessUncleanExitError);

  /**
   * The error name.
   * @readonly
   * @member {string} ProcessUncleanExitError#name
   */
  this.__defineGetter__('name', function () { return ProcessUncleanExitError.name; });

  /**
   * The error message.
   * @readonly
   * @member {string} ProcessUncleanExitError#message
   */
  this.__defineGetter__('message', function () { return message; });

  /**
   * The process exit code.
   * @readonly
   * @member {number} ProcessUncleanExitError#code
   */
  this.__defineGetter__('code', function () { return code; });

}

util.inherits(ProcessUncleanExitError, Error);

/*
 * Captures stdout/stderr for a child process
 */
function captureOutput(child) {
  // Use a mutable data structure so we can append as we get new data and have
  // the calling context see the new data
  var output = {'stdout': '', 'stderr': ''};

  child.stdout.on('data', function(data) { output["stdout"] += data.toString(); });
  child.stderr.on('data', function(data) { output["stderr"] += data.toString(); });

  return output;
}


/*
 * Returns an error message containing the stdout/stderr of the child process
 */
function mkErrorMsg(registryCommand, code, output) {
    var stdout = output['stdout'].trim();
    var stderr = output['stderr'].trim();

    var msg = util.format("%s command exited with code %d:\n%s\n%s", registryCommand, code, stdout, stderr);
    return new ProcessUncleanExitError(msg, code);
}


/*
 * Converts x86/x64 to 32/64
 */
function convertArchString(archString) {
  if (archString == 'x64') {
    return '64';
  } else if (archString == 'x86') {
    return '32';
  } else {
    throw new Error('illegal architecture: ' + archString + ' (use x86 or x64)');
  }
}


/*
 * Adds correct architecture to reg args
 */
function pushArch(args, arch) {
  if (arch) {
    args.push('/reg:' + convertArchString(arch));
  }
}

/*
 * Get the path to system's reg.exe. Useful when another reg.exe is added to the PATH
 * Implemented only for Windows
 */
function getRegExePath() {
    if (process.platform === 'win32') {
        return path.join(process.env.windir, 'system32', 'reg.exe');
    } else {
        return "REG";
    }
}


/**
 * Creates a single registry value record.
 * This contructor is private. Objects of this type are created internally and returned by methods of {@link Registry} objects.
 *
 * @private
 * @class
 *
 * @param {string} host - the hostname
 * @param {string} hive - the hive id
 * @param {string} key - the registry key
 * @param {string} name - the value name
 * @param {string} type - the value type
 * @param {string} value - the value
 * @param {string} arch - the hive architecture ('x86' or 'x64')
 *
 */
function RegistryItem (host, hive, key, name, type, value, arch) {

  if (!(this instanceof RegistryItem))
    return new RegistryItem(host, hive, key, name, type, value, arch);

  /* private members */
  var _host = host    // hostname
  ,   _hive = hive    // registry hive
  ,   _key = key      // registry key
  ,   _name = name    // property name
  ,   _type = type    // property type
  ,   _value = value  // property value
  ,   _arch = arch    // hive architecture

  /* getters/setters */

  /**
   * The hostname.
   * @readonly
   * @member {string} RegistryItem#host
   */
  this.__defineGetter__('host', function () { return _host; });

  /**
   * The hive id.
   * @readonly
   * @member {string} RegistryItem#hive
   */
  this.__defineGetter__('hive', function () { return _hive; });

  /**
   * The registry key.
   * @readonly
   * @member {string} RegistryItem#key
   */
  this.__defineGetter__('key', function () { return _key; });

  /**
   * The value name.
   * @readonly
   * @member {string} RegistryItem#name
   */
  this.__defineGetter__('name', function () { return _name; });

  /**
   * The value type.
   * @readonly
   * @member {string} RegistryItem#type
   */
  this.__defineGetter__('type', function () { return _type; });

  /**
   * The value.
   * @readonly
   * @member {string} RegistryItem#value
   */
  this.__defineGetter__('value', function () { return _value; });

  /**
   * The hive architecture.
   * @readonly
   * @member {string} RegistryItem#arch
   */
  this.__defineGetter__('arch', function () { return _arch; });

}

util.inherits(RegistryItem, Object);

/**
 * Creates a registry object, which provides access to a single registry key.
 * Note: This class is returned by a call to ```require('winreg')```.
 *
 * @public
 * @class
 *
 * @param {object} options - the options
 * @param {string=} options.host - the hostname
 * @param {string=} options.hive - the hive id
 * @param {string=} options.key - the registry key
 * @param {string=} options.arch - the optional registry hive architecture ('x86' or 'x64'; only valid on Windows 64 Bit Operating Systems)
 *
 * @example
 * var Registry = require('winreg')
 * ,   autoStartCurrentUser = new Registry({
 *       hive: Registry.HKCU,
 *       key:  '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'
 *     });
 *
 */
function Registry (options) {

  if (!(this instanceof Registry))
    return new Registry(options);

  /* private members */
  var _options = options || {}
  ,   _host = '' + (_options.host || '')    // hostname
  ,   _hive = '' + (_options.hive || HKLM)  // registry hive
  ,   _key  = '' + (_options.key  || '')    // registry key
  ,   _arch = _options.arch || null         // hive architecture

  /* getters/setters */

  /**
   * The hostname.
   * @readonly
   * @member {string} Registry#host
   */
  this.__defineGetter__('host', function () { return _host; });

  /**
   * The hive id.
   * @readonly
   * @member {string} Registry#hive
   */
  this.__defineGetter__('hive', function () { return _hive; });

  /**
   * The registry key name.
   * @readonly
   * @member {string} Registry#key
   */
  this.__defineGetter__('key', function () { return _key; });

  /**
   * The full path to the registry key.
   * @readonly
   * @member {string} Registry#path
   */
  this.__defineGetter__('path', function () { return (_host.length == 0 ? '' : '\\\\' + _host + '\\') + _hive + _key; });

  /**
   * The registry hive architecture ('x86' or 'x64').
   * @readonly
   * @member {string} Registry#arch
   */
  this.__defineGetter__('arch', function () { return _arch; });

  /**
   * Creates a new {@link Registry} instance that points to the parent registry key.
   * @readonly
   * @member {Registry} Registry#parent
   */
  this.__defineGetter__('parent', function () {
    var i = _key.lastIndexOf('\\')
    return new Registry({
      host: this.host,
      hive: this.hive,
      key:  (i == -1)?'':_key.substring(0, i),
      arch: this.arch
    });
  });

  // validate options...
  if (HIVES.indexOf(_hive) == -1)
    throw new Error('illegal hive specified.');

  if (!KEY_PATTERN.test(_key))
    throw new Error('illegal key specified.');

  if (_arch && _arch != 'x64' && _arch != 'x86')
    throw new Error('illegal architecture specified (use x86 or x64)');

}

/**
 * Registry hive key HKEY_LOCAL_MACHINE.
 * Note: For writing to this hive your program has to run with admin privileges.
 * @type {string}
 */
Registry.HKLM = HKLM;

/**
 * Registry hive key HKEY_CURRENT_USER.
 * @type {string}
 */
Registry.HKCU = HKCU;

/**
 * Registry hive key HKEY_CLASSES_ROOT.
 * Note: For writing to this hive your program has to run with admin privileges.
 * @type {string}
 */
Registry.HKCR = HKCR;

/**
 * Registry hive key HKEY_USERS.
 * Note: For writing to this hive your program has to run with admin privileges.
 * @type {string}
 */
Registry.HKU = HKU;

/**
 * Registry hive key HKEY_CURRENT_CONFIG.
 * Note: For writing to this hive your program has to run with admin privileges.
 * @type {string}
 */
Registry.HKCC = HKCC;

/**
 * Collection of available registry hive keys.
 * @type {array}
 */
Registry.HIVES = HIVES;

/**
 * Registry value type STRING.
 * @type {string}
 */
Registry.REG_SZ = REG_SZ;

/**
 * Registry value type MULTILINE_STRING.
 * @type {string}
 */
Registry.REG_MULTI_SZ = REG_MULTI_SZ;

/**
 * Registry value type EXPANDABLE_STRING.
 * @type {string}
 */
Registry.REG_EXPAND_SZ = REG_EXPAND_SZ;

/**
 * Registry value type DOUBLE_WORD.
 * @type {string}
 */
Registry.REG_DWORD = REG_DWORD;

/**
 * Registry value type QUAD_WORD.
 * @type {string}
 */
Registry.REG_QWORD = REG_QWORD;

/**
 * Registry value type BINARY.
 * @type {string}
 */
Registry.REG_BINARY = REG_BINARY;

/**
 * Registry value type UNKNOWN.
 * @type {string}
 */
Registry.REG_NONE = REG_NONE;

/**
 * Collection of available registry value types.
 * @type {array}
 */
Registry.REG_TYPES = REG_TYPES;

/**
 * The name of the default value. May be used instead of the empty string literal for better readability.
 * @type {string}
 */
Registry.DEFAULT_VALUE = DEFAULT_VALUE;

/**
 * Retrieve all values from this registry key.
 * @param {valuesCallback} cb - callback function
 * @param {ProcessUncleanExitError=} cb.err - error object or null if successful
 * @param {array=} cb.items - an array of {@link RegistryItem} objects
 * @returns {Registry} this registry key object
 */
Registry.prototype.values = function values (cb) {

  if (typeof cb !== 'function')
    throw new TypeError('must specify a callback');

  var args = [ 'QUERY', this.path ];

  pushArch(args, this.arch);

  var proc = spawn(getRegExePath(), args, {
        cwd: undefined,
        env: process.env,
        stdio: [ 'ignore', 'pipe', 'pipe' ]
      })
  ,   buffer = ''
  ,   self = this
  ,   error = null // null means no error previously reported.

  var output = captureOutput(proc);

  proc.on('close', function (code) {
    if (error) {
      return;
    } else if (code !== 0) {
      log('process exited with code ' + code);
      cb(mkErrorMsg('QUERY', code, output), null);
    } else {
      var items = []
      ,   result = []
      ,   lines = buffer.split('\n')
      ,   lineNumber = 0

      for (var i = 0, l = lines.length; i < l; i++) {
        var line = lines[i].trim();
        if (line.length > 0) {
          log(line);
          if (lineNumber != 0) {
            items.push(line);
          }
          ++lineNumber;
        }
      }

      for (var i = 0, l = items.length; i < l; i++) {

        var match = ITEM_PATTERN.exec(items[i])
        ,   name
        ,   type
        ,   value

        if (match) {
          name = match[1].trim();
          type = match[2].trim();
          value = match[3];
          result.push(new RegistryItem(self.host, self.hive, self.key, name, type, value, self.arch));
        }
      }

      cb(null, result);

    }
  });

  proc.stdout.on('data', function (data) {
    buffer += data.toString();
  });

  proc.on('error', function(err) {
    error = err;
    cb(err);
  });

  return this;
};

/**
 * Retrieve all subkeys from this registry key.
 * @param {function (err, items)} cb - callback function
 * @param {ProcessUncleanExitError=} cb.err - error object or null if successful
 * @param {array=} cb.items - an array of {@link Registry} objects
 * @returns {Registry} this registry key object
 */
Registry.prototype.keys = function keys (cb) {

  if (typeof cb !== 'function')
    throw new TypeError('must specify a callback');

  var args = [ 'QUERY', this.path ];

  pushArch(args, this.arch);

  var proc = spawn(getRegExePath(), args, {
        cwd: undefined,
        env: process.env,
        stdio: [ 'ignore', 'pipe', 'pipe' ]
      })
  ,   buffer = ''
  ,   self = this
  ,   error = null // null means no error previously reported.

  var output = captureOutput(proc);

  proc.on('close', function (code) {
    if (error) {
      return;
    } else if (code !== 0) {
      log('process exited with code ' + code);
      cb(mkErrorMsg('QUERY', code, output), null);
    }
  });

  proc.stdout.on('data', function (data) {
    buffer += data.toString();
  });

  proc.stdout.on('end', function () {

    var items = []
    ,   result = []
    ,   lines = buffer.split('\n')

    for (var i = 0, l = lines.length; i < l; i++) {
      var line = lines[i].trim();
      if (line.length > 0) {
        log(line);
        items.push(line);
      }
    }

    for (var i = 0, l = items.length; i < l; i++) {

      var match = PATH_PATTERN.exec(items[i])
      ,   hive
      ,   key

      if (match) {
        hive = match[1];
        key  = match[2];
        if (key && (key !== self.key)) {
          result.push(new Registry({
            host: self.host,
            hive: self.hive,
            key:  key,
            arch: self.arch
          }));
        }
      }
    }

    cb(null, result);

  });

  proc.on('error', function(err) {
    error = err;
    cb(err);
  });

  return this;
};

/**
 * Gets a named value from this registry key.
 * @param {string} name - the value name, use {@link Registry.DEFAULT_VALUE} or an empty string for the default value
 * @param {function (err, item)} cb - callback function
 * @param {ProcessUncleanExitError=} cb.err - error object or null if successful
 * @param {RegistryItem=} cb.item - the retrieved registry item
 * @returns {Registry} this registry key object
 */
Registry.prototype.get = function get (name, cb) {

  if (typeof cb !== 'function')
    throw new TypeError('must specify a callback');

  var args = ['QUERY', this.path];
  if (name == '')
    args.push('/ve');
  else
    args = args.concat(['/v', name]);

  pushArch(args, this.arch);

  var proc = spawn(getRegExePath(), args, {
        cwd: undefined,
        env: process.env,
        stdio: [ 'ignore', 'pipe', 'pipe' ]
      })
  ,   buffer = ''
  ,   self = this
  ,   error = null // null means no error previously reported.

  var output = captureOutput(proc);

  proc.on('close', function (code) {
    if (error) {
      return;
    } else if (code !== 0) {
      log('process exited with code ' + code);
      cb(mkErrorMsg('QUERY', code, output), null);
    } else {
      var items = []
      ,   result = null
      ,   lines = buffer.split('\n')
      ,   lineNumber = 0

      for (var i = 0, l = lines.length; i < l; i++) {
        var line = lines[i].trim();
        if (line.length > 0) {
          log(line);
          if (lineNumber != 0) {
             items.push(line);
          }
          ++lineNumber;
        }
      }

      //Get last item - so it works in XP where REG QUERY returns with a header
      var item = items[items.length-1] || ''
      ,   match = ITEM_PATTERN.exec(item)
      ,   name
      ,   type
      ,   value

      if (match) {
        name = match[1].trim();
        type = match[2].trim();
        value = match[3];
        result = new RegistryItem(self.host, self.hive, self.key, name, type, value, self.arch);
      }

      cb(null, result);
    }
  });

  proc.stdout.on('data', function (data) {
    buffer += data.toString();
  });

  proc.on('error', function(err) {
    error = err;
    cb(err);
  });

  return this;
};

/**
 * Sets a named value in this registry key, overwriting an already existing value.
 * @param {string} name - the value name, use {@link Registry.DEFAULT_VALUE} or an empty string for the default value
 * @param {string} type - the value type
 * @param {string} value - the value
 * @param {function (err)} cb - callback function
 * @param {ProcessUncleanExitError=} cb.err - error object or null if successful
 * @returns {Registry} this registry key object
 */
Registry.prototype.set = function set (name, type, value, cb) {

  if (typeof cb !== 'function')
    throw new TypeError('must specify a callback');

  if (REG_TYPES.indexOf(type) == -1)
    throw Error('illegal type specified.');

  var args = ['ADD', this.path];
  if (name == '')
    args.push('/ve');
  else
    args = args.concat(['/v', name]);

  args = args.concat(['/t', type, '/d', value, '/f']);

  pushArch(args, this.arch);

  var proc = spawn(getRegExePath(), args, {
        cwd: undefined,
        env: process.env,
        stdio: [ 'ignore', 'pipe', 'pipe' ]
      })
  ,   error = null // null means no error previously reported.

  var output = captureOutput(proc);

  proc.on('close', function (code) {
    if(error) {
      return;
    } else if (code !== 0) {
      log('process exited with code ' + code);
      cb(mkErrorMsg('ADD', code, output, null));
    } else {
      cb(null);
    }
  });

  proc.stdout.on('data', function (data) {
    // simply discard output
    log(''+data);
  });

  proc.on('error', function(err) {
    error = err;
    cb(err);
  });

  return this;
};

/**
 * Remove a named value from this registry key. If name is empty, sets the default value of this key.
 * Note: This key must be already existing.
 * @param {string} name - the value name, use {@link Registry.DEFAULT_VALUE} or an empty string for the default value
 * @param {function (err)} cb - callback function
 * @param {ProcessUncleanExitError=} cb.err - error object or null if successful
 * @returns {Registry} this registry key object
 */
Registry.prototype.remove = function remove (name, cb) {

  if (typeof cb !== 'function')
    throw new TypeError('must specify a callback');

  var args = name ? ['DELETE', this.path, '/f', '/v', name] : ['DELETE', this.path, '/f', '/ve'];

  pushArch(args, this.arch);

  var proc = spawn(getRegExePath(), args, {
        cwd: undefined,
        env: process.env,
        stdio: [ 'ignore', 'pipe', 'pipe' ]
      })
  ,   error = null // null means no error previously reported.

  var output = captureOutput(proc);

  proc.on('close', function (code) {
    if(error) {
      return;
    } else if (code !== 0) {
      log('process exited with code ' + code);
      cb(mkErrorMsg('DELETE', code, output), null);
    } else {
      cb(null);
    }
  });

  proc.stdout.on('data', function (data) {
    // simply discard output
    log(''+data);
  });

  proc.on('error', function(err) {
    error = err;
    cb(err);
  });

  return this;
};

/**
 * Remove all subkeys and values (including the default value) from this registry key.
 * @param {function (err)} cb - callback function
 * @param {ProcessUncleanExitError=} cb.err - error object or null if successful
 * @returns {Registry} this registry key object
 */
Registry.prototype.clear = function clear (cb) {

  if (typeof cb !== 'function')
    throw new TypeError('must specify a callback');

  var args = ['DELETE', this.path, '/f', '/va'];

  pushArch(args, this.arch);

  var proc = spawn(getRegExePath(), args, {
        cwd: undefined,
        env: process.env,
        stdio: [ 'ignore', 'pipe', 'pipe' ]
      })
  ,   error = null // null means no error previously reported.

  var output = captureOutput(proc);

  proc.on('close', function (code) {
    if(error) {
      return;
    } else if (code !== 0) {
      log('process exited with code ' + code);
      cb(mkErrorMsg("DELETE", code, output), null);
    } else {
      cb(null);
    }
  });

  proc.stdout.on('data', function (data) {
    // simply discard output
    log(''+data);
  });

  proc.on('error', function(err) {
    error = err;
    cb(err);
  });

  return this;
};

/**
 * Alias for the clear method to keep it backward compatible.
 * @method
 * @deprecated Use {@link Registry#clear} or {@link Registry#destroy} in favour of this method.
 * @param {function (err)} cb - callback function
 * @param {ProcessUncleanExitError=} cb.err - error object or null if successful
 * @returns {Registry} this registry key object
 */
Registry.prototype.erase = Registry.prototype.clear;

/**
 * Delete this key and all subkeys from the registry.
 * @param {function (err)} cb - callback function
 * @param {ProcessUncleanExitError=} cb.err - error object or null if successful
 * @returns {Registry} this registry key object
 */
Registry.prototype.destroy = function destroy (cb) {

  if (typeof cb !== 'function')
    throw new TypeError('must specify a callback');

  var args = ['DELETE', this.path, '/f'];

  pushArch(args, this.arch);

  var proc = spawn(getRegExePath(), args, {
        cwd: undefined,
        env: process.env,
        stdio: [ 'ignore', 'pipe', 'pipe' ]
      })
  ,   error = null // null means no error previously reported.

  var output = captureOutput(proc);

  proc.on('close', function (code) {
    if (error) {
      return;
    } else if (code !== 0) {
      log('process exited with code ' + code);
      cb(mkErrorMsg('DELETE', code, output), null);
    } else {
      cb(null);
    }
  });

  proc.stdout.on('data', function (data) {
    // simply discard output
    log(''+data);
  });

  proc.on('error', function(err) {
    error = err;
    cb(err);
  });

  return this;
};

/**
 * Create this registry key. Note that this is a no-op if the key already exists.
 * @param {function (err)} cb - callback function
 * @param {ProcessUncleanExitError=} cb.err - error object or null if successful
 * @returns {Registry} this registry key object
 */
Registry.prototype.create = function create (cb) {

  if (typeof cb !== 'function')
    throw new TypeError('must specify a callback');

  var args = ['ADD', this.path, '/f'];

  pushArch(args, this.arch);

  var proc = spawn(getRegExePath(), args, {
        cwd: undefined,
        env: process.env,
        stdio: [ 'ignore', 'pipe', 'pipe' ]
      })
  ,   error = null // null means no error previously reported.

  var output = captureOutput(proc);

  proc.on('close', function (code) {
    if (error) {
      return;
    } else if (code !== 0) {
      log('process exited with code ' + code);
      cb(mkErrorMsg('ADD', code, output), null);
    } else {
      cb(null);
    }
  });

  proc.stdout.on('data', function (data) {
    // simply discard output
    log(''+data);
  });

  proc.on('error', function(err) {
    error = err;
    cb(err);
  });

  return this;
};

/**
 * Checks if this key already exists.
 * @param {function (err, exists)} cb - callback function
 * @param {ProcessUncleanExitError=} cb.err - error object or null if successful
 * @param {boolean=} cb.exists - true if a registry key with this name already exists
 * @returns {Registry} this registry key object
 */
Registry.prototype.keyExists = function keyExists (cb) {

  this.values(function (err, items) {
    if (err) {
      // process should return with code 1 if key not found
      if (err.code == 1) {
        return cb(null, false);
      }
      // other error
      return cb(err);
    }
    cb(null, true);
  });

  return this;
};

/**
 * Checks if a value with the given name already exists within this key.
 * @param {string} name - the value name, use {@link Registry.DEFAULT_VALUE} or an empty string for the default value
 * @param {function (err, exists)} cb - callback function
 * @param {ProcessUncleanExitError=} cb.err - error object or null if successful
 * @param {boolean=} cb.exists - true if a value with the given name was found in this key
 * @returns {Registry} this registry key object
 */
Registry.prototype.valueExists = function valueExists (name, cb) {

  this.get(name, function (err, item) {
    if (err) {
      // process should return with code 1 if value not found
      if (err.code == 1) {
        return cb(null, false);
      }
      // other error
      return cb(err);
    }
    cb(null, true);
  });

  return this;
};

module.exports = Registry;


/***/ }),

/***/ 431:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const os = __webpack_require__(87);
/**
 * Commands
 *
 * Command Format:
 *   ##[name key=value;key=value]message
 *
 * Examples:
 *   ##[warning]This is the user warning message
 *   ##[set-secret name=mypassword]definitelyNotAPassword!
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        // safely append the val - avoid blowing up when attempting to
                        // call .replace() if message is not a string for some reason
                        cmdStr += `${key}=${escape(`${val || ''}`)},`;
                    }
                }
            }
        }
        cmdStr += CMD_STRING;
        // safely append the message - avoid blowing up when attempting to
        // call .replace() if message is not a string for some reason
        const message = `${this.message || ''}`;
        cmdStr += escapeData(message);
        return cmdStr;
    }
}
function escapeData(s) {
    return s.replace(/\r/g, '%0D').replace(/\n/g, '%0A');
}
function escape(s) {
    return s
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/]/g, '%5D')
        .replace(/;/g, '%3B');
}
//# sourceMappingURL=command.js.map

/***/ }),

/***/ 470:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = __webpack_require__(431);
const os = __webpack_require__(87);
const path = __webpack_require__(622);
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable
 */
function exportVariable(name, val) {
    process.env[name] = val;
    command_1.issueCommand('set-env', { name }, val);
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    command_1.issueCommand('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    command_1.issueCommand('add-path', {}, inputPath);
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.  The value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store
 */
function setOutput(name, value) {
    command_1.issueCommand('set-output', { name }, value);
}
exports.setOutput = setOutput;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command_1.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message
 */
function error(message) {
    command_1.issue('error', message);
}
exports.error = error;
/**
 * Adds an warning issue
 * @param message warning issue message
 */
function warning(message) {
    command_1.issue('warning', message);
}
exports.warning = warning;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command_1.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command_1.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store
 */
function saveState(name, value) {
    command_1.issueCommand('save-state', { name }, value);
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;
//# sourceMappingURL=core.js.map

/***/ }),

/***/ 614:
/***/ (function(module) {

module.exports = require("events");

/***/ }),

/***/ 622:
/***/ (function(module) {

module.exports = require("path");

/***/ }),

/***/ 630:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __webpack_require__(747);
const path = __webpack_require__(622);
const core = __importStar(__webpack_require__(470));
const io = __importStar(__webpack_require__(1));
const io_util_1 = __webpack_require__(672);
const winreg_1 = __importDefault(__webpack_require__(401));
const path_1 = __webpack_require__(622);
const ERROR_FILE_NAME = "error.txt";
/**
 * Constructs argument for MSDeploy command
 *
 * @param   webAppPackage                   Web deploy package
 * @param   webAppName                      web App Name
 * @param   publishingProfile               Azure RM Connection Details
 * @param   removeAdditionalFilesFlag       Flag to set DoNotDeleteRule rule
 * @param   excludeFilesFromAppDataFlag     Flag to prevent App Data from publishing
 * @param   takeAppOfflineFlag              Flag to enable AppOffline rule
 * @param   virtualApplication              Virtual Application Name
 * @param   setParametersFile               Set Parameter File path
 * @param   additionalArguments             Arguments provided by user
 * @param   isParamFilePresentInPacakge     Flag to check Paramter.xml file
 * @param   isFolderBasedDeployment         Flag to check if given web package path is a folder
 *
 * @returns string
 */
function getMSDeployCmdArgs(webAppPackage, webAppName, publishingProfile, // TODO
removeAdditionalFilesFlag, excludeFilesFromAppDataFlag, takeAppOfflineFlag, virtualApplication, setParametersFile, additionalArguments, isParamFilePresentInPacakge, isFolderBasedDeployment, useWebDeploy) {
    var msDeployCmdArgs = " -verb:sync";
    var webApplicationDeploymentPath = virtualApplication
        ? webAppName + "/" + virtualApplication
        : webAppName;
    if (isFolderBasedDeployment) {
        msDeployCmdArgs += " -source:IisApp=\"'" + webAppPackage + "'\"";
        msDeployCmdArgs +=
            " -dest:iisApp=\"'" + webApplicationDeploymentPath + "'\"";
    }
    else {
        if (webAppPackage && webAppPackage.toLowerCase().endsWith(".war")) {
            core.debug("WAR: webAppPackage = " + webAppPackage);
            let warFile = path.basename(webAppPackage.slice(0, webAppPackage.length - ".war".length));
            let warExt = webAppPackage.slice(webAppPackage.length - ".war".length);
            core.debug("WAR: warFile = " + warFile);
            warFile = virtualApplication
                ? warFile + "/" + virtualApplication + warExt
                : warFile + warExt;
            core.debug("WAR: warFile = " + warFile);
            msDeployCmdArgs += " -source:contentPath=\"'" + webAppPackage + "'\"";
            // tomcat, jetty location on server => /site/webapps/
            core.debug("WAR: dest = /site/webapps/" + warFile);
            msDeployCmdArgs +=
                " -dest:contentPath=\"'/site/webapps/" + warFile + "'\"";
        }
        else {
            msDeployCmdArgs += " -source:package=\"'" + webAppPackage + "'\"";
            if (isParamFilePresentInPacakge) {
                msDeployCmdArgs += " -dest:auto";
            }
            else {
                msDeployCmdArgs +=
                    " -dest:contentPath=\"'" + webApplicationDeploymentPath + "'\"";
            }
        }
    }
    if (publishingProfile != null) {
        msDeployCmdArgs +=
            ",ComputerName=\"'https://" +
                publishingProfile.publishUrl +
                "/msdeploy.axd?site=" +
                webAppName +
                "'\",";
        msDeployCmdArgs +=
            "UserName=\"'" +
                publishingProfile.userName +
                "'\",Password=\"'" +
                publishingProfile.userPWD +
                "'\",AuthType=\"'Basic'\"";
    }
    if (isParamFilePresentInPacakge) {
        msDeployCmdArgs +=
            " -setParam:name=\"'IIS Web Application Name'\",value=\"'" +
                webApplicationDeploymentPath +
                "'\"";
    }
    if (takeAppOfflineFlag) {
        msDeployCmdArgs += " -enableRule:AppOffline";
    }
    if (useWebDeploy) {
        if (setParametersFile) {
            msDeployCmdArgs += " -setParamFile=" + setParametersFile + " ";
        }
        if (excludeFilesFromAppDataFlag) {
            msDeployCmdArgs += " -skip:Directory=App_Data";
        }
    }
    additionalArguments = additionalArguments ? additionalArguments : " ";
    msDeployCmdArgs += " " + additionalArguments;
    if (!(removeAdditionalFilesFlag && useWebDeploy)) {
        msDeployCmdArgs += " -enableRule:DoNotDeleteRule";
    }
    core.debug(`Constructed msDeploy comamnd line arguments: ${msDeployCmdArgs}`);
    return msDeployCmdArgs;
}
exports.getMSDeployCmdArgs = getMSDeployCmdArgs;
/**
 * Gets the full path of MSDeploy.exe
 *
 * @returns    string
 */
function getMSDeployFullPath() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var msDeployInstallPathRegKey = "\\SOFTWARE\\Microsoft\\IIS Extensions\\MSDeploy";
            var msDeployLatestPathRegKey = yield getMSDeployLatestRegKey(msDeployInstallPathRegKey);
            var msDeployFullPath = yield getMSDeployInstallPath(msDeployLatestPathRegKey);
            msDeployFullPath = msDeployFullPath + "msdeploy.exe";
            return msDeployFullPath;
        }
        catch (error) {
            core.debug(error);
            return path.join(__dirname, "MSDeploy3.6", "msdeploy.exe");
        }
    });
}
exports.getMSDeployFullPath = getMSDeployFullPath;
function getMSDeployLatestRegKey(registryKey) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            var regKey = new winreg_1.default({
                hive: winreg_1.default.HKLM,
                key: registryKey
            });
            regKey.keys(function (err, subRegKeys) {
                if (err) {
                    reject("Cannot find MSDeploy location in registry");
                    return;
                }
                var latestKeyVersion = 0;
                var latestSubKey;
                for (var index in subRegKeys) {
                    var subRegKey = subRegKeys[index].key;
                    var subKeyVersion = subRegKey.substr(subRegKey.lastIndexOf("\\") + 1, subRegKey.length - 1);
                    if (!isNaN(subKeyVersion)) {
                        var subKeyVersionNumber = parseFloat(subKeyVersion);
                        if (subKeyVersionNumber > latestKeyVersion) {
                            latestKeyVersion = subKeyVersionNumber;
                            latestSubKey = subRegKey;
                        }
                    }
                }
                if (latestKeyVersion < 3) {
                    reject(`Unsupported installed MSDeploy version found: ${latestKeyVersion}`);
                    return;
                }
                resolve(latestSubKey);
            });
        });
    });
}
function getMSDeployInstallPath(registryKey) {
    return new Promise((resolve, reject) => {
        var regKey = new winreg_1.default({
            hive: winreg_1.default.HKLM,
            key: registryKey
        });
        regKey.get("InstallPath", function (err, item) {
            if (err) {
                reject(`Cannot find MSDeploy location in registry: ${err}`);
                return;
            }
            resolve(item.value);
        });
    });
}
/**
 * 1. Checks if msdeploy during execution redirected any error to
 * error stream ( saved in error.txt) , display error to console
 * 2. Checks if there is file in use error , suggest to try app offline.
 */
function redirectMSDeployErrorToConsole() {
    var msDeployErrorFilePath = path_1.join(process.env["GITHUB_WORKSPACE"] || "", ERROR_FILE_NAME);
    if (io_util_1.exists(msDeployErrorFilePath)) {
        let errorFileContent = fs_1.readFileSync(msDeployErrorFilePath).toString();
        if (errorFileContent !== "") {
            if (errorFileContent.indexOf("ERROR_INSUFFICIENT_ACCESS_TO_SITE_FOLDER") !==
                -1) {
                core.warning("Try deploying again with app offline option set");
            }
            else if (errorFileContent.indexOf("An error was encountered when processing operation 'Delete Directory' on") !== -1) {
                core.warning("Web deployment already in progress");
            }
            else if (errorFileContent.indexOf("FILE_IN_USE") !== -1) {
                core.warning("Try to deploy web app with rename option set");
            }
            else if (errorFileContent.indexOf("transport connection") != -1) {
                errorFileContent =
                    errorFileContent + "Update machine to enable secure connection";
            }
            core.error(errorFileContent);
        }
        io.rmRF(msDeployErrorFilePath);
    }
}
exports.redirectMSDeployErrorToConsole = redirectMSDeployErrorToConsole;
function getWebDeployErrorCode(errorMessage) {
    if (errorMessage !== "") {
        if (errorMessage.indexOf("ERROR_INSUFFICIENT_ACCESS_TO_SITE_FOLDER") !== -1) {
            return "ERROR_INSUFFICIENT_ACCESS_TO_SITE_FOLDER";
        }
        else if (errorMessage.indexOf("An error was encountered when processing operation 'Delete Directory' on 'D:\\home\\site\\wwwroot\\app_data\\jobs") !== -1) {
            return "WebJobsInProgressIssue";
        }
        else if (errorMessage.indexOf("FILE_IN_USE") !== -1) {
            return "FILE_IN_USE";
        }
        else if (errorMessage.indexOf("transport connection") != -1) {
            return "transport connection";
        }
        else if (errorMessage.indexOf("ERROR_CONNECTION_TERMINATED") != -1) {
            return "ERROR_CONNECTION_TERMINATED";
        }
        else if (errorMessage.indexOf("ERROR_CERTIFICATE_VALIDATION_FAILED") != -1) {
            return "ERROR_CERTIFICATE_VALIDATION_FAILED";
        }
    }
    return "";
}
exports.getWebDeployErrorCode = getWebDeployErrorCode;


/***/ }),

/***/ 669:
/***/ (function(module) {

module.exports = require("util");

/***/ }),

/***/ 672:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __webpack_require__(357);
const fs = __webpack_require__(747);
const path = __webpack_require__(622);
_a = fs.promises, exports.chmod = _a.chmod, exports.copyFile = _a.copyFile, exports.lstat = _a.lstat, exports.mkdir = _a.mkdir, exports.readdir = _a.readdir, exports.readlink = _a.readlink, exports.rename = _a.rename, exports.rmdir = _a.rmdir, exports.stat = _a.stat, exports.symlink = _a.symlink, exports.unlink = _a.unlink;
exports.IS_WINDOWS = process.platform === 'win32';
function exists(fsPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield exports.stat(fsPath);
        }
        catch (err) {
            if (err.code === 'ENOENT') {
                return false;
            }
            throw err;
        }
        return true;
    });
}
exports.exists = exists;
function isDirectory(fsPath, useStat = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const stats = useStat ? yield exports.stat(fsPath) : yield exports.lstat(fsPath);
        return stats.isDirectory();
    });
}
exports.isDirectory = isDirectory;
/**
 * On OSX/Linux, true if path starts with '/'. On Windows, true for paths like:
 * \, \hello, \\hello\share, C:, and C:\hello (and corresponding alternate separator cases).
 */
function isRooted(p) {
    p = normalizeSeparators(p);
    if (!p) {
        throw new Error('isRooted() parameter "p" cannot be empty');
    }
    if (exports.IS_WINDOWS) {
        return (p.startsWith('\\') || /^[A-Z]:/i.test(p) // e.g. \ or \hello or \\hello
        ); // e.g. C: or C:\hello
    }
    return p.startsWith('/');
}
exports.isRooted = isRooted;
/**
 * Recursively create a directory at `fsPath`.
 *
 * This implementation is optimistic, meaning it attempts to create the full
 * path first, and backs up the path stack from there.
 *
 * @param fsPath The path to create
 * @param maxDepth The maximum recursion depth
 * @param depth The current recursion depth
 */
function mkdirP(fsPath, maxDepth = 1000, depth = 1) {
    return __awaiter(this, void 0, void 0, function* () {
        assert_1.ok(fsPath, 'a path argument must be provided');
        fsPath = path.resolve(fsPath);
        if (depth >= maxDepth)
            return exports.mkdir(fsPath);
        try {
            yield exports.mkdir(fsPath);
            return;
        }
        catch (err) {
            switch (err.code) {
                case 'ENOENT': {
                    yield mkdirP(path.dirname(fsPath), maxDepth, depth + 1);
                    yield exports.mkdir(fsPath);
                    return;
                }
                default: {
                    let stats;
                    try {
                        stats = yield exports.stat(fsPath);
                    }
                    catch (err2) {
                        throw err;
                    }
                    if (!stats.isDirectory())
                        throw err;
                }
            }
        }
    });
}
exports.mkdirP = mkdirP;
/**
 * Best effort attempt to determine whether a file exists and is executable.
 * @param filePath    file path to check
 * @param extensions  additional file extensions to try
 * @return if file exists and is executable, returns the file path. otherwise empty string.
 */
function tryGetExecutablePath(filePath, extensions) {
    return __awaiter(this, void 0, void 0, function* () {
        let stats = undefined;
        try {
            // test file exists
            stats = yield exports.stat(filePath);
        }
        catch (err) {
            if (err.code !== 'ENOENT') {
                // eslint-disable-next-line no-console
                console.log(`Unexpected error attempting to determine if executable file exists '${filePath}': ${err}`);
            }
        }
        if (stats && stats.isFile()) {
            if (exports.IS_WINDOWS) {
                // on Windows, test for valid extension
                const upperExt = path.extname(filePath).toUpperCase();
                if (extensions.some(validExt => validExt.toUpperCase() === upperExt)) {
                    return filePath;
                }
            }
            else {
                if (isUnixExecutable(stats)) {
                    return filePath;
                }
            }
        }
        // try each extension
        const originalFilePath = filePath;
        for (const extension of extensions) {
            filePath = originalFilePath + extension;
            stats = undefined;
            try {
                stats = yield exports.stat(filePath);
            }
            catch (err) {
                if (err.code !== 'ENOENT') {
                    // eslint-disable-next-line no-console
                    console.log(`Unexpected error attempting to determine if executable file exists '${filePath}': ${err}`);
                }
            }
            if (stats && stats.isFile()) {
                if (exports.IS_WINDOWS) {
                    // preserve the case of the actual file (since an extension was appended)
                    try {
                        const directory = path.dirname(filePath);
                        const upperName = path.basename(filePath).toUpperCase();
                        for (const actualName of yield exports.readdir(directory)) {
                            if (upperName === actualName.toUpperCase()) {
                                filePath = path.join(directory, actualName);
                                break;
                            }
                        }
                    }
                    catch (err) {
                        // eslint-disable-next-line no-console
                        console.log(`Unexpected error attempting to determine the actual case of the file '${filePath}': ${err}`);
                    }
                    return filePath;
                }
                else {
                    if (isUnixExecutable(stats)) {
                        return filePath;
                    }
                }
            }
        }
        return '';
    });
}
exports.tryGetExecutablePath = tryGetExecutablePath;
function normalizeSeparators(p) {
    p = p || '';
    if (exports.IS_WINDOWS) {
        // convert slashes on Windows
        p = p.replace(/\//g, '\\');
        // remove redundant slashes
        return p.replace(/\\\\+/g, '\\');
    }
    // remove redundant slashes
    return p.replace(/\/\/+/g, '/');
}
// on Mac/Linux, test the execute bit
//     R   W  X  R  W X R W X
//   256 128 64 32 16 8 4 2 1
function isUnixExecutable(stats) {
    return ((stats.mode & 1) > 0 ||
        ((stats.mode & 8) > 0 && stats.gid === process.getgid()) ||
        ((stats.mode & 64) > 0 && stats.uid === process.getuid()));
}
//# sourceMappingURL=io-util.js.map

/***/ }),

/***/ 747:
/***/ (function(module) {

module.exports = require("fs");

/***/ }),

/***/ 799:
/***/ (function(module, __unusedexports, __webpack_require__) {

const path = __webpack_require__(622);
const CHARS = { '{': '}', '(': ')', '[': ']'};
const STRICT = /\\(.)|(^!|\*|[\].+)]\?|\[[^\\\]]+\]|\{[^\\}]+\}|\(\?[:!=][^\\)]+\)|\([^|]+\|[^\\)]+\)|(\\).|([@?!+*]\(.*\)))/;
const RELAXED = /\\(.)|(^!|[*?{}()[\]]|\(\?)/;

/**
 * Detect if a string cointains glob
 * @param {String} str Input string
 * @param {Object} [options] Configuration object
 * @param {Boolean} [options.strict=true] Use relaxed regex if true
 * @returns {Boolean} true if string contains glob
 */
function isglob(str, { strict = true } = {}) {
  if (str === '') return false;
  let match, rgx = strict ? STRICT : RELAXED;

  while ((match = rgx.exec(str))) {
    if (match[2]) return true;
    let idx = match.index + match[0].length;

    // if an open bracket/brace/paren is escaped,
    // set the index to the next closing character
    let open = match[1];
    let close = open ? CHARS[open] : null;
    if (open && close) {
      let n = str.indexOf(close, idx);
      if (n !== -1)  idx = n + 1;
    }

    str = str.slice(idx);
  }
  return false;
}


/**
 * Find the static part of a glob-path,
 * split path and return path part
 * @param {String} str Path/glob string
 * @returns {String} static path section of glob
 */
function parent(str, { strict = false } = {}) {
  str = path.normalize(str).replace(/\/|\\/, '/');

  // special case for strings ending in enclosure containing path separator
  if (/[\{\[].*[\/]*.*[\}\]]$/.test(str)) str += '/';

  // preserves full path in case of trailing path separator
  str += 'a';

  do {str = path.dirname(str)}
  while (isglob(str, {strict}) || /(^|[^\\])([\{\[]|\([^\)]+$)/.test(str));

  // remove escape chars and return result
  return str.replace(/\\([\*\?\|\[\]\(\)\{\}])/g, '$1');
};


/**
 * Parse a glob path, and split it by static/glob part
 * @param {String} pattern String path
 * @param {Object} [opts] Options
 * @param {Object} [opts.strict=false] Use strict parsing
 * @returns {Object} object with parsed path
 */
function globalyzer(pattern, opts = {}) {
  let base = parent(pattern, opts);
  let isGlob = isglob(pattern, opts);
  let glob;

  if (base != '.') {
    glob = pattern.substr(base.length);
    if (glob.startsWith('/')) glob = glob.substr(1);
  } else {
    glob = pattern;
  }

  if (!isGlob) {
    base = path.dirname(pattern);
    glob = base !== '.' ? pattern.substr(base.length) : pattern;
  }

  if (glob.startsWith('./')) glob = glob.substr(2);
  if (glob.startsWith('/')) glob = glob.substr(1);

  return { base, glob, isGlob };
}


module.exports = globalyzer;


/***/ }),

/***/ 846:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __webpack_require__(747);
const path = __webpack_require__(622);
const core = __importStar(__webpack_require__(470));
const exec = __importStar(__webpack_require__(986));
const io = __importStar(__webpack_require__(1));
const msdeployutility_1 = __webpack_require__(630);
const DEFAULT_RETRY_COUNT = 3;
/**
 * Executes Web Deploy command
 *
 * @param   webDeployPkg                   Web deploy package
 * @param   webAppName                      web App Name
 * @param   publishingProfile               Azure RM Connection Details
 * @param   removeAdditionalFilesFlag       Flag to set DoNotDeleteRule rule
 * @param   excludeFilesFromAppDataFlag     Flag to prevent App Data from publishing
 * @param   takeAppOfflineFlag              Flag to enable AppOffline rule
 * @param   virtualApplication              Virtual Application Name
 * @param   setParametersFile               Set Parameter File path
 * @param   additionalArguments             Arguments provided by user
 *
 */
function DeployUsingMSDeploy(webDeployPkg, webAppName, publishingProfile, removeAdditionalFilesFlag, excludeFilesFromAppDataFlag, takeAppOfflineFlag, virtualApplication, setParametersFile, additionalArguments, isFolderBasedDeployment, useWebDeploy) {
    return __awaiter(this, void 0, void 0, function* () {
        var msDeployPath = yield msdeployutility_1.getMSDeployFullPath();
        var msDeployDirectory = msDeployPath.slice(0, msDeployPath.lastIndexOf("\\") + 1);
        var pathVar = process.env.PATH;
        process.env.PATH = msDeployDirectory + ";" + process.env.PATH;
        core.debug(`Found msdeploy path: '${msDeployPath}'`);
        var msDeployCmdArgs = msdeployutility_1.getMSDeployCmdArgs(webDeployPkg, webAppName, publishingProfile, removeAdditionalFilesFlag, excludeFilesFromAppDataFlag, takeAppOfflineFlag, virtualApplication || "", "", //setParametersFileName,
        additionalArguments || "", false, //isParamFilePresentInPackage,
        !!isFolderBasedDeployment, !!useWebDeploy);
        let retryCount = DEFAULT_RETRY_COUNT;
        try {
            while (true) {
                try {
                    retryCount -= 1;
                    yield executeMSDeploy(msDeployCmdArgs);
                    break;
                }
                catch (error) {
                    if (retryCount == 0) {
                        throw error;
                    }
                    core.info(error);
                    core.info("Retrying deployment");
                }
            }
            if (publishingProfile != null) {
                core.info("Package deployment succeeded");
            }
        }
        catch (error) {
            core.error("Package deployment failed");
            core.debug(JSON.stringify(error));
            msdeployutility_1.redirectMSDeployErrorToConsole();
            throw Error(error.message);
        }
        finally {
            process.env.PATH = pathVar;
            if (setParametersFile != null) {
                io.rmRF(setParametersFile);
            }
        }
    });
}
exports.DeployUsingMSDeploy = DeployUsingMSDeploy;
function argStringToArray(argString) {
    var args = [];
    var inQuotes = false;
    var escaped = false;
    var arg = "";
    var append = function (c) {
        // we only escape double quotes.
        if (escaped && c !== '"') {
            arg += "\\";
        }
        arg += c;
        escaped = false;
    };
    for (var i = 0; i < argString.length; i++) {
        var c = argString.charAt(i);
        if (c === '"') {
            if (!escaped) {
                inQuotes = !inQuotes;
            }
            else {
                append(c);
            }
            continue;
        }
        if (c === "\\" && inQuotes) {
            if (escaped) {
                append(c);
            }
            else {
                escaped = true;
            }
            continue;
        }
        if (c === " " && !inQuotes) {
            if (arg.length > 0) {
                args.push(arg);
                arg = "";
            }
            continue;
        }
        append(c);
    }
    if (arg.length > 0) {
        args.push(arg.trim());
    }
    return args;
}
function executeMSDeploy(msDeployCmdArgs) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let msDeployError = null;
            var msDeployErrorFilePath = path.join(process.env["GITHUB_WORKSPACE"] || "", "error.txt");
            var fd = fs.openSync(msDeployErrorFilePath, "w");
            var errObj = fs.createWriteStream("", { fd: fd });
            errObj.on("finish", () => {
                if (msDeployError) {
                    reject(msDeployError);
                }
            });
            try {
                core.debug("the argument string is:");
                core.debug(msDeployCmdArgs);
                core.debug("converting the argument string into an array of arguments");
                msDeployCmdArgs = argStringToArray(msDeployCmdArgs);
                core.debug("the array of arguments is:");
                for (var i = 0; i < msDeployCmdArgs.length; i++) {
                    core.debug("arg#" + i + ": " + msDeployCmdArgs[i]);
                }
                yield exec.exec("msdeploy", msDeployCmdArgs, {
                    failOnStdErr: true,
                    errStream: errObj,
                    windowsVerbatimArguments: true
                });
                resolve("Azure App service successfully deployed");
            }
            catch (error) {
                msDeployError = error;
            }
            finally {
                errObj.end();
            }
        }));
    });
}


/***/ }),

/***/ 986:
/***/ (function(__unusedmodule, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const tr = __webpack_require__(9);
/**
 * Exec a command.
 * Output will be streamed to the live console.
 * Returns promise with return code
 *
 * @param     commandLine        command to execute (can include additional args). Must be correctly escaped.
 * @param     args               optional arguments for tool. Escaping is handled by the lib.
 * @param     options            optional exec options.  See ExecOptions
 * @returns   Promise<number>    exit code
 */
function exec(commandLine, args, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const commandArgs = tr.argStringToArray(commandLine);
        if (commandArgs.length === 0) {
            throw new Error(`Parameter 'commandLine' cannot be null or empty.`);
        }
        // Path to tool to execute should be first arg
        const toolPath = commandArgs[0];
        args = commandArgs.slice(1).concat(args || []);
        const runner = new tr.ToolRunner(toolPath, args, options);
        return runner.exec();
    });
}
exports.exec = exec;
//# sourceMappingURL=exec.js.map

/***/ })

/******/ });