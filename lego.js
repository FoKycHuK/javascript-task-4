'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

var PRIORITIES = {
    select: -1,
    limit: -10,
    format: -100
};

function getFunctionPriority(func) {
    return PRIORITIES[func.name] ? PRIORITIES[func.name] : 0;
}

function getCopyWithFields(object, fields) {
    return fields.filter(function(field) {
        return object[field] !== undefined;
    })
    .reduce(function (acc, field) {
        acc[field] = object[field];

        return acc;
    }, {});

    return copy;
}

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection) {
    return [].slice.call(arguments, 1)
        .sort(function (a, b) {
            return getFunctionPriority(b) > getFunctionPriority(a) ? 1 : -1;
        })
        .reduce(function (acc, func) {
            return func(acc);
        }, collection);
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function () {
    var fields = [].slice.call(arguments);

    return function select(collection) {
        return collection.map(function (person) {
            return getCopyWithFields(person, fields);
        });
    };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Function}
 */
exports.filterIn = function (property, values) {
    return function filter(collection) {
        return collection.filter(function (person) {
            return values.indexOf(person[property]) !== -1;
        });
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Function}
 */
exports.sortBy = function (property, order) {
    return function sortby(collection) {
        var collectionCopy = collection.map(function (value) {
            return getCopyWithFields(value, Object.keys(value));
        });

        return collectionCopy.sort(function (a, b) {
            return (a[property] > b[property] ? 1 : -1) * (order === 'asc' ? 1 : -1);
        });
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Function}
 */
exports.format = function (property, formatter) {
    return function format(collection) {
        return collection.map(function (person) {
            var personCopy = getCopyWithFields(person, Object.keys(person));
            personCopy[property] = formatter(person[property]);

            return personCopy;
        });
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Function}
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
     * @returns {Function}
     */
    exports.or = function () {
        var filterFuncs = [].slice.call(arguments);

        return function or(collection) {
            return collection.filter(function (value) {
                return filterFuncs.some(function (filter) {
                    return filter(collection).indexOf(value) !== -1;
                });
            });
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.and = function () {
        var filterFuncs = [].slice.call(arguments);

        return function and(collection) {
            return filterFuncs.reduce(function (acc, filter) {
                return filter(acc);
            }, collection);
        };
    };
}
