const NumberRegex = /^(\d)*$/;
const EnglishNumberRegex = /^([\w\d])*$/;
const EnglishNumberSignsRegex = /^([\w\d\-_@. \\/])*$/;
const PersianEnglishNumberSignsRegex = /^([\u0600-\u06FF\w\d\-_@. \\/])*$/;
const EmailRegex =
    /^(([^<>()[\]\\.,;:\s@']+(\.[^<>()[\]\\.,;:\s@']+)*)|('.+'))@((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}])|(([a-zA-Z\-\d]+\.)+[a-zA-Z]{2,}))$/;
const PhoneRegex = /\+\d+/;

export {
    EnglishNumberRegex,
    EnglishNumberSignsRegex,
    PersianEnglishNumberSignsRegex,
    EmailRegex,
    PhoneRegex,
    NumberRegex
};
