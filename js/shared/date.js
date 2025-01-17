function formatDateNumber(number) {
    if (number < 10) {
        return '0' + number;
    }
    return number;
}
  
export const formatDDMMYYYY = (date) => {
    return `${
        formatDateNumber(date.getDate())
    }.${
        formatDateNumber(date.getMonth() + 1)
    }.${
        date.getFullYear()
    }`;
};

export const formatHHMM = (date) => {
    return `${
        formatDateNumber(date.getHours())
    }:${
        formatDateNumber(date.getMinutes())
    }`;
};
  
export const formatDDMMYYYYHHMM = (date) => {
    return `${formatDDMMYYYY(date)} ${formatHHMM(date)}`;
};

export function isDateBefore(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return date < today;
}


export function isWeekends(date) {
    return date.getDay() === 0 || date.getDay() === 6;
}
