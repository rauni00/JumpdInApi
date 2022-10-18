const Validator = require('validator');
const isEmpty = require('is-empty');

function validatePostInput(data) {
    let errors = {};
    data.title = !isEmpty(data.title) ? data.title : '';
    data.caption = !isEmpty(data.caption) ? data.caption : '';

    if (!Validator.isLength(data.title, { min: 2, max: 30 })) {
        errors.title = 'title must be between 2 and 30 characters';
    }
    if (Validator.isEmpty(data.title)) {
        errors.title = 'title field is required';
    }
    if (!Validator.isLength(data.caption, { min: 2, max: 30 })) {
        errors.caption = 'caption must be between 2 and 30 characters';
    }
    if (Validator.isEmpty(data.caption)) {
        errors.caption = 'caption field is required';
    }

    return {
        errors,
        isValid: isEmpty(errors),
    };
}
module.exports = validatePostInput;