import fs from 'fs';

const filePath = process.argv[2] || './missing-kcs.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const randomDelay = () => Math.floor(Math.random() * 3000) + 2000; // 2 to 5 seconds

async function processMissing() {
    let updatedCount = 0;
    
    for (const item of data) {
        if (!item.caseNumber || !item.date) {
            console.log(`[${item.index}] Fetching: ${item.url}`);
            try {
                const response = await fetch(item.url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                        'Accept-Language': 'uk-UA,uk;q=0.9,en-US;q=0.8,en;q=0.7',
                    }
                });
                
                if (response.status !== 200) {
                    console.error(`  -> Failed with status ${response.status}`);
                    await sleep(5000);
                    continue;
                }
                
                const html = await response.text();
                
                // --- Extract Case Number ---
                if (!item.caseNumber) {
                    const caseInputMatch = html.match(/name="CaseNumber" value="([^"]+)"/i);
                    if (caseInputMatch) {
                        item.caseNumber = caseInputMatch[1];
                        console.log(`  -> Extracted caseNumber: ${item.caseNumber}`);
                    } else {
                        // Fallback text match
                        const textMatch = html.match(/справа\s*№\s*([0-9А-Яа-яІіЇїЄє/.\-]+)/i);
                        if (textMatch) {
                            item.caseNumber = textMatch[1].replace(/<\/?[^>]+(>|$)/g, "").trim();
                            console.log(`  -> Extracted caseNumber (regex): ${item.caseNumber}`);
                        }
                    }
                }
                
                // --- Extract Date ---
                if (!item.date) {
                    const textareaMatch = html.match(/<textarea id="txtdepository">([\s\S]*?)<\/textarea>/i);
                    if (textareaMatch) {
                        let docHtml = textareaMatch[1];
                        docHtml = docHtml.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
                        const text = docHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                        
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
                            item.date = `${day}.${month}.${year}`;
                            console.log(`  -> Extracted date (text): ${item.date}`);
                        } else {
                            const dateNumMatch = text.match(/([0-3][0-9]\.[0-1][0-9]\.[1-2][0-9]{3})/);
                            if (dateNumMatch) {
                                item.date = dateNumMatch[1];
                                console.log(`  -> Extracted date (nums): ${item.date}`);
                            } else {
                                // Try to extract from the specific table row if text matching fails
                                const tableDateMatch = html.match(/Дата набрання законної сили:&nbsp;<b>(\d{2}\.\d{2}\.\d{4})<\/b>/i);
                                if (tableDateMatch) {
                                    item.date = tableDateMatch[1];
                                    console.log(`  -> Extracted date (fallback table): ${item.date}`);
                                } else {
                                    console.log(`  -> Failed to extract date`);
                                }
                            }
                        }
                    } else {
                         // Direct text parsing if the textarea is absent
                         const tableDateMatch = html.match(/Дата набрання законної сили:&nbsp;<b>(\d{2}\.\d{2}\.\d{4})<\/b>/i);
                         if (tableDateMatch) {
                             item.date = tableDateMatch[1];
                             console.log(`  -> Extracted date (fallback table/no textarea): ${item.date}`);
                         }
                    }
                }
                
                // Save immediately to not lose progress
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
                updatedCount++;
                
                // Delay between requests
                const delayMs = randomDelay();
                console.log(`  -> Waiting ${Math.round(delayMs / 1000)}s...`);
                await sleep(delayMs);
                
            } catch (err) {
                console.error(`  -> Fetch error:`, err.message);
                await sleep(5000);
            }
        }
    }
    
    console.log(`\nProcessed and updated ${updatedCount} entries!`);
}

processMissing();
