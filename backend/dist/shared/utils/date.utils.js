/**
 * DATE UTILITY FUNCTIONS
 * 
 * Centralized date manipulation functions for consistency across the application.
 */ /**
 * Get the start of day (00:00:00.000)
 */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get addDays () {
        return addDays;
    },
    get addMonths () {
        return addMonths;
    },
    get differenceInDays () {
        return differenceInDays;
    },
    get differenceInMonths () {
        return differenceInMonths;
    },
    get endOfDay () {
        return endOfDay;
    },
    get formatDate () {
        return formatDate;
    },
    get formatDateReadable () {
        return formatDateReadable;
    },
    get isAfter () {
        return isAfter;
    },
    get isBefore () {
        return isBefore;
    },
    get isSameDay () {
        return isSameDay;
    },
    get monthsBetween () {
        return monthsBetween;
    },
    get startOfDay () {
        return startOfDay;
    },
    get startOfMonth () {
        return startOfMonth;
    },
    get startOfNextMonth () {
        return startOfNextMonth;
    },
    get subDays () {
        return subDays;
    },
    get subMonths () {
        return subMonths;
    }
});
function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}
function endOfDay(date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}
function addMonths(date, months) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
}
function subMonths(date, months) {
    return addMonths(date, -months);
}
function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}
function subDays(date, days) {
    return addDays(date, -days);
}
function isBefore(date1, date2) {
    return date1.getTime() < date2.getTime();
}
function isAfter(date1, date2) {
    return date1.getTime() > date2.getTime();
}
function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate();
}
function differenceInDays(date1, date2) {
    const diff = date1.getTime() - date2.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}
function differenceInMonths(date1, date2) {
    const yearDiff = date1.getFullYear() - date2.getFullYear();
    const monthDiff = date1.getMonth() - date2.getMonth();
    return yearDiff * 12 + monthDiff;
}
function startOfMonth(date) {
    const d = new Date(date);
    d.setDate(1);
    return startOfDay(d);
}
function startOfNextMonth(date) {
    return startOfMonth(addMonths(date, 1));
}
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
function formatDateReadable(date) {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
function monthsBetween(startDate, endDate) {
    let months = 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    while(start <= end){
        months++;
        start.setMonth(start.getMonth() + 1);
    }
    return months;
}

//# sourceMappingURL=date.utils.js.map