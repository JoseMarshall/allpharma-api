exports.replaceAll = (string, search, replaceValue) => {
    return string.replace(new RegExp('[' + search + ']', 'g'), replaceValue)
}

exports.removeEspecialChars = (string) => {

    return string.replace(new RegExp('[!@#$%^&*(),.?":{}|<> ]', 'g'), '')
}