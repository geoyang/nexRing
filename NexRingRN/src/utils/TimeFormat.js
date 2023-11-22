

export function formatDateTime(inputTime,isComplete=true) {
    var date = new Date(inputTime);
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? "0" + m : m;
    var d = date.getDate();
    d = d < 10 ? "0" + d : d;
    var h = date.getHours();
    h = h < 10 ? "0" + h : h;
    var minute = date.getMinutes();
    var second = date.getSeconds();
    minute = minute < 10 ? "0" + minute : minute;
    second = second < 10 ? "0" + second : second;
    var result="";
    if(isComplete){
        result=y + "-" + m + "-" + d + "|" + h + ":" + minute + ":" + second;
    }else{
        result=y + "-" + m + "-" + d ;
    }
    return result
}

export function compareTime(ts, targetTs) {
    const date = new Date(ts);
    const targetDate = new Date(targetTs);
    console.log(`年：${date.getFullYear()}==${targetDate.getFullYear()}月：${date.getMonth()}==${targetDate.getMonth()}日：${date.getDate()}==${targetDate.getDate()}`)
    if (date.getFullYear() === targetDate.getFullYear() &&
        date.getMonth() === targetDate.getMonth() &&
        date.getDate() === targetDate.getDate()) {
            return true;
    }
    return false;
}
