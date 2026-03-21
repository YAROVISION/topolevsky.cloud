import fs from 'fs';

const html = fs.readFileSync('temp_test.html', 'utf8');

// Extract Case Number
const caseInputMatch = html.match(/name="CaseNumber" value="([^"]+)"/i);
const caseNumber1 = caseInputMatch ? caseInputMatch[1] : null;

// Extract from text "Справа № 1-177/11" if input fails
const textMatch = html.match(/справа\s*№\s*([0-9А-Яа-яІіЇїЄє/.\-]+)/i);
const caseNumber2 = textMatch ? textMatch[1] : null;

// Extract textarea content
const textareaMatch = html.match(/<textarea id="txtdepository">([\s\S]*?)<\/textarea>/i);
let dateFound = null;

if (textareaMatch) {
    let docHtml = textareaMatch[1];
    // Unescape basic html entities just in case
    docHtml = docHtml.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
    // Strip tags
    const text = docHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Look for standard date string like 26 лютого 2019 року
    const dateTextMatch = text.match(/(\d{1,2})\s+(січня|лютого|березня|квітня|травня|червня|липня|серпня|вересня|жовтня|листопада|грудня)\s+(\d{4})\s*р/i);
    
    if (dateTextMatch) {
        const monthMap = {
            'січня': '01', 'лютого': '02', 'березня': '03', 'квітня': '04',
            'травня': '05', 'червня': '06', 'липня': '07', 'серпня': '08',
            'вересня': '09', 'жовтня': '10', 'листопада': '11', 'грудня': '12'
        };
        const day = dateTextMatch[1].padStart(2, '0');
        const month = monthMap[dateTextMatch[2].toLowerCase()];
        const year = dateTextMatch[3];
        dateFound = `${day}.${month}.${year}`;
    } else {
        // Fallback to straight DD.MM.YYYY anywhere in text
        const dateNumMatch = text.match(/(\d{2}\.\d{2}\.\d{4})/);
        if (dateNumMatch) {
            dateFound = dateNumMatch[1];
        }
    }
}

console.log("Case Number (Input):", caseNumber1);
console.log("Case Number (Text):", caseNumber2);
console.log("Date Found:", dateFound);
