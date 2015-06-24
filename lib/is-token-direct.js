// Wether path token is static or is dynamic (is regexp)

'use strict';

module.exports = RegExp.prototype.test.bind(/^[a-z0-9\-]+$/);
