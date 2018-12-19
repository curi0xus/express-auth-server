"use strict";
function NotFoundError(code, error) {
    //new Error(message) probably sets the message
    Error.call(this, typeof error === "undefined" ? undefined : error.message);
    //creates a .stack propery on this.constructor
    Error.captureStackTrace(this, this.constructor);
    this.name = "NotFoundError";
    this.message = typeof error === "undefined" ? undefined : error.message;
    this.code = typeof code === "undefined" ? "404" : code;
    this.status = 404;
    this.inner = error;
}
//inherits the Error prototype i.e. all properties and methods on the object
NotFoundError.prototype = Object.create(Error.prototype);
NotFoundError.prototype.constructor = NotFoundError;

module.exports = NotFoundError;

/*Class Alternative*/ 
// class NotFoundError extends Error {
//   constructor (code, error) {
//     //new Error(message)
//     super(typeof error === 'undefined' ? undefined : error.message);
//     super.captureStackTrace(NotFoundError);
//     this.name = "NotFoundError";
//     this.message = typeof error === "undefined" ? undefined : error.message;
//     this.code = typeof code === "undefined" ? "404" : code;
//     this.status = 404;
//     this.inner = error;
//   } 
// }

// module.exports = new NotFoundError();