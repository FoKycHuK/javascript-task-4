'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

var PRIORITIES = {
    select: -1,
    limit: -10,
    format: -100,
}

function getFunctionPriority(func) {
    return PRIORITIES[func.name] ? PRIORITIES[func.name] : 0;
}

function getCopyWithFields(object, fields) {
    var copy = {};
    fields.forEach(function (field) {
        if (object[field]) {
            copy[field] = object[field];
        }
    });
    return copy;
}

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection) {
    [].slice.call(arguments, 1)
        .sort(function (a, b) { 
            return getFunctionPriority(b) - getFunctionPriority(a)
        })
        .forEach(function(func) {
            collection = func(collection);
    });

    return collection;
};

/**
 * Выбор полей
 * @params {...String}
 */
exports.select = function () {
    var fields = [].slice.call(arguments);
    return function select(collection) {
        return collection.map(function (person) {
            return getCopyWithFields(person, fields)
        });
    };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 */
exports.filterIn = function (property, values) {
    return function filter(collection) {
        return collection.filter( function (person) {
            return values.indexOf(person[property]) !== -1;
        });
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 */
exports.sortBy = function (property, order) {
    return function sortby(collection) {
        return collection.sort(function(a, b) {
            return order === 'asc' ? a[property] - b[property] : b[property] - a[property];
        })
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 */
exports.format = function (property, formatter) {
    return function format(collection) {
        return collection.map(function (person) {
            var personCopy = getCopyWithFields(person, Object.keys(person));
            personCopy[property] = formatter(person[property]);

            return personCopy;
        })
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 */
exports.limit = function (count) {
    return function limit(collection) {
        return collection.slice(0, count);
    };
};

if (exports.isStar) {
    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     */
    exports.or = function () {
        var filterFuncs = [].slice.call(arguments);
        return function or(collection) {
            return collection.filter(function(value) {
                return filterFuncs.some(function(filter) {
                    return filter(collection).indexOf(value) !== -1;
                });
            });
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     */
    exports.and = function () {
        var filterFuncs = [].slice.call(arguments);
        return function and(collection) {
            return filterFuncs.reduce(function (acc, filter) {
                return filter(acc);
            }, collection);
        }
    };
}
