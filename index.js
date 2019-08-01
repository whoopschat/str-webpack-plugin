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

function replace(content, options) {
    if (!options) {
        return content;
    }
    if (options instanceof Array) {
        options.forEach(option => {
            content = replace(content, option);
        });
    } else if (options.form) {
        if (options.form instanceof Array) {
            options.form.forEach((form, index) => {
                content = replace(content, { form, to: options.to[index] });
            });
        } else {
            let regex = new RegExp(options.form, 'g');
            content = content.replace(regex, options.to || '');
        }
    }
    return content;
}

function handle(options = {}) {
    if (options instanceof Array) {
        options.forEach(option => {
            handle(option);
        });
    } else if (options.src) {
        let files = scan(options.src, options.test);
        files.forEach(file => {
            if (options.debug) {
                console.log('str-webpack-plugin >>> ', file);
            }
            let content = fs.readFileSync(file, 'utf8');
            content = replace(content, options.replace);
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
            if (options.debug) {
                console.log('');
            }
            handle(this.options);
            if (options.debug) {
                console.log('');
            }
        })
    } else {
        compiler.plugin('done', function () {
            if (options.debug) {
                console.log('');
            }
            handle(this.options);
            if (options.debug) {
                console.log('');
            }
        });
    }
}

module.exports = exports = pligin