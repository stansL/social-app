const isEmpty = (s) => {
    return s.trim() === "" ? true : false;
}

const isValidEmail = (email) => {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
}


exports.validateSignupData = (data) => {
    let errors = {};
    if (isEmpty(data.email)) {
        errors.email = 'Email must not be empty!';
    } else if (!isValidEmail(data.email)) {
        errors.email = 'Email must be valid!';
    }

    if (isEmpty(data.password) || isEmpty(data.confirmPassword)) {
        errors.password = 'Password and confirmation must not be empty!';
    } else if (data.password !== data.confirmPassword) {
        errors.password = 'Password and confirmation not equal!';
    }

    if (isEmpty(data.handle)) {
        errors.handle = 'Must not be empty!';
    }

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

exports.validateLoginData = (data) => {
    let errors = {};
    if (isEmpty(data.email)) {
        errors.email = "Must not be empty";
    }
    if (isEmpty(data.password)) {
        errors.password = "Must not be empty";
    }
    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}