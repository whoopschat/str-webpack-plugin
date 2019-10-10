const fs = require("fs");
const path = require("path");

function scan(src, regex) {
    let result = [];
    const _scan = (next) => {
        if (!next) {
            return;
        }
        const files = fs.readdirSync(next);
        if (!files.length) {
            return;
        }
        files.forEach(file => {
            let absFile = path.join(next, `./${file}`);
            let fileStat = fs.statSync(absFile);
            if (fileStat.isDirectory()) {
                return _scan(absFile);
            }
            if (fileStat.isFile() && (!regex || new RegExp(regex, 'g').test(file.toLowerCase()))) {
                result.push(absFile);
            }
        });
    }
    if (src instanceof Array) {
        src.forEach(dir => {
            _scan(dir);
        });
    } else {
        _scan(src);
    }
    return result;
}

function replace(content, opts) {
    if (!opts) {
        return content;
    }
    if (opts instanceof Array) {
        opts.forEach(option => {
            content = replace(content, option);
        });
    } else if (opts.form) {
        if (opts.form instanceof Array) {
            opts.form.forEach((form, index) => {
                content = replace(content, { form, to: opts.to[index] });
            });
        } else {
            let regex = new RegExp(opts.form, 'g');
            content = content.replace(regex, opts.to || '');
        }
    }
    return content;
}

function handle(opts = {}) {
    if (opts instanceof Array) {
        opts.forEach(option => {
            handle(option);
        });
    } else if (opts.src) {
        let files = scan(opts.src, opts.test);
        files.forEach(file => {
            if (opts.debug) {
                console.log('str-webpack-plugin >>> ', file);
            }
            let content = fs.readFileSync(file, 'utf8');
            content = replace(content, opts.replace);
            fs.writeFileSync(`${file}`, content);
        });
    }
}

function pligin(options) {
    this.options = options;
}

pligin.prototype.apply = function (compiler) {
    if (compiler.hooks) {
        compiler.hooks.afterEmit.tap("done", () => {
            if (this.options.debug) {
                console.log('');
            }
            handle(this.options);
            if (this.options.debug) {
                console.log('');
            }
        })
    } else {
        compiler.plugin('done', function () {
            if (this.options.debug) {
                console.log('');
            }
            handle(this.options);
            if (this.options.debug) {
                console.log('');
            }
        });
    }
}

module.exports = exports = pligin