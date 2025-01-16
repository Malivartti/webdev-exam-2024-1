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