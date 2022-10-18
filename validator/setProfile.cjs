const Validator = require('validator');
const isEmpty = require('is-empty');

function validateProfileInput(data) {
    let errors = {};
    data.firstName = !isEmpty(data.firstName) ? data.firstName : '';
    data.lastName = !isEmpty(data.lastName) ? data.lastName : '';
    data.Mobile = !isEmpty(data.Mobile) ? data.Mobile : '';

    if (!Validator.isLength(data.firstName, { min: 2, max: 30 })) {
        errors.firstName = 'firstName must be between 2 and 30 characters';
    }
    if (!Validator.isLength(data.Mobile, { min: 10, max: 10 })) {
        errors.Mobile = 'Phone Number must be 10 Digit';
    }
    if (Validator.isEmpty(data.Mobile)) {
        errors.Mobile = 'Mobile number is required';
    }
    if (Validator.isEmpty(data.firstName)) {
        errors.firstName = 'firstName field is required';
    }
    if (!Validator.isLength(data.lastName, { min: 2, max: 30 })) {
        errors.lastName = 'lastName must be between 2 and 30 characters';
    }
    if (Validator.isEmpty(data.lastName)) {
        errors.lastName = 'lastName field is required';
    }

    return {
        errors,
        isValid: isEmpty(errors),
    };
}
module.exports = validateProfileInput;