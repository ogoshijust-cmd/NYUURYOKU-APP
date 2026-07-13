window.onerror = function(msg, url, line) {
 alert('Error: ' + msg + '\\nLine: ' + line);
 }
;





        const $ = id => document.getElementById(id);
        const el = (tag, className, opts={
}
) => {
            const e = document.createElement(tag);
 if(className) e.className = className;
            if(opts.text) e.textContent = opts.text;
 if(opts.html) e.innerHTML = opts.html;
            if(opts.dataset) Object.assign(e.dataset, opts.dataset);
            if(opts.onclick) e.onclick = opts.onclick;
            if(opts.colSpan) e.colSpan = opts.colSpan;
            if(opts.value) e.value = opts.value;
            return e;
        }
;
        const defMaster = {
            _isStandard: true,            kai: ["1","2","3","4","5","6","7","8","9","10","R"],            edaban: ["1","2","3","4"],            bikou: ["+45"],            inspector: [],            lot_suu: ["1","2","3","4","5","6","7","8","9","10"],            lot_setsu: ["1","2","3","4","5","6","7","8","9","10"],            houkou: ["N","E","S","W","NE","ES","SW","WN","1N","1E","1S","1W","2N","2E","2S","2W"],            bui: {
                "その他": [],                "ブレース": ["VGU","VGL","VCU","VCL","VSU","VSL","GUG","GLG"],                "梁": ["BU","BL","FU","FL","GU","GL","GW","RU","RL"],                "柱": ["CU","CL","SU","SL","S1","S2","S3","S4","S5","S6","SK","BP","TP","D1"]            }
,            lot_kigou: {
                "すみ肉": ["P","Q"],                "その他": [],                "UT、外観": ["E","F","A","N"],                "食違いずれ": ["KB","KG","KX","ZS","ZR","ZX"]            }
,            buzai: {
                "その他": [],                "梁": ["1GX1Y1"],                "柱": ["1CX1Y1"]            }
,            kensasu: ["1","2","3","4","5"]        }
;
        const groupDefs = {
            buzai: ['柱', '梁', 'その他'],            lot_kigou: ['UT、外観', '食違いずれ', 'すみ肉', 'その他'],             bui: ['柱', '梁', 'ブレース', 'その他']        }
;
        const catDefs = [            {
 id: 'buzai', n: '部材番号' }
, {
 id: 'lot_setsu', n: 'ロット【節】' }
, {
 id: 'lot_kigou', n: 'ロット【記号】' }
,            {
 id: 'lot_suu', n: 'ロット【数】' }
, {
 id: 'kai', n: '階' }
, {
 id: 'houkou', n: '方向' }
, {
 id: 'bui', n: '部位' }
,             {
 id: 'edaban', n: '枝番' }
, {
 id: 'bikou', n: '備考' }
, {
 id: 'inspector', n: '検査員' }
, {
 id: 'kensasu', n: '検査数' }
        ];
        const lotFieldTypes = ['kai', 'houkou', 'bui', 'edaban', 'bikou', 'kensasu'];
        const lotFieldLabels = ['階', '方向', '部位', '枝番', '備考', '検査数'];
                function migrateMasterData(master) {
            if (!master) return;
            if (!master.inspector) master.inspector = [];
            if (master.lot_kigou && master.lot_kigou['(UT、外観)']) {
                master.lot_kigou['UT、外観'] = [...(master.lot_kigou['UT、外観'] || []), ...master.lot_kigou['(UT、外観)']];
                delete master.lot_kigou['(UT、外観)'];
            }
            Object.keys(groupDefs).forEach(cat => {
                if (!master[cat]) {
                    master[cat] = {
}
;
 groupDefs[cat].forEach(sub => master[cat][sub] = []);
}
 else {
                    groupDefs[cat].forEach(sub => {
 if (!master[cat][sub]) master[cat][sub] = [];
 }
);
                }
            }
);
        }
        function getMaster() {
            return projects[currentPId]?.master || projects[Object.keys(projects)[0]].master;
        }
        function isSuminikuKigou(k) {
            if (!k) return false;
            const master = getMaster();
            const suminikuKigous = (master && master.lot_kigou && master.lot_kigou['すみ肉']) ? master.lot_kigou['すみ肉'] : [];
            return [...suminikuKigous, 'すみ肉'].includes(k);
        }
        let projects;
        try {
            const stored = localStorage.getItem('appProjects');
            projects = stored ? JSON.parse(stored) : null;
            if (!projects || typeof projects !== 'object' || Object.keys(projects).length === 0) throw new Error('Invalid data');
            Object.values(projects).forEach(p => {
 if (p.name === 'デフォルト工事' && !p.master._isStandard) {
 p.master = JSON.parse(JSON.stringify(defMaster));
 }
 migrateMasterData(p.master);
 }
);
        }
 catch (e) {
            projects = {
 'default': {
 name: 'デフォルト工事', master: JSON.parse(JSON.stringify(defMaster)) }
 }
;
        }
                let currentPId = localStorage.getItem('currentPId');
        if (!currentPId || !projects[currentPId]) currentPId = Object.keys(projects)[0];
                let activeCat = 'buzai';
 let masterSortables = [];
        let sheets = [];
 let activeSheetId = '';
 let lotCount = 3, rowCount = 100;
 let recordInfo = {
 date: '', inspectors: [] }
;
        let sheetInfo = {
 setsu: '', taishou: '', sonota: '', custom: '' }
;
        let currentMode = 'pencil';
 let historyStack = [];
 let redoStack = [];
 let clipboardData = [];
         const textColors = {
 black: 'text-gray-800', red: 'text-red-600', blue: 'text-blue-600', green: 'text-green-600' }
;
        let currentTextColor = 'black';
        let edSheetInfo = {
 setsu: '', taishou: '', sonota: '', custom: '' }
;
        const sheetInfoMaster = {
            setsu: Array.from({
length: 15}
, (_, i) => `${
i + 1}
節`),            taishou: ['柱', '間柱', '梁', '大梁', '小梁', 'ブレース'],            sonota: ['先行検査', 'メッキ部先行']        }
;
        const saveData = () => {
 try {
 localStorage.setItem('appProjects', JSON.stringify(projects));
 localStorage.setItem('currentPId', currentPId);
 }
 catch(e) {
 console.warn('Quota exceeded on saveData', e);
 alert('【警告】マスタデータ等が容量上限に達したため保存できません。不要なデータを整理してください。');
 }
 }
;
        function isUtKigou(k) {
            if (!k) return false;
            const master = getMaster();
            const utKigous = (master && master.lot_kigou && master.lot_kigou['UT、外観']) ? master.lot_kigou['UT、外観'] : [];
            const oldUtKigous = (master && master.lot_kigou && master.lot_kigou['(UT、外観)']) ? master.lot_kigou['(UT、外観)'] : [];
            return [...utKigous, ...oldUtKigous, 'UT、外観', '(UT、外観)'].includes(k);
        }
        function createEmptySheet(id, name) {
            return {
 id: id, name: name, lc: 3, rc: 100, lots: [], rows: [], thick: [], notes: [], sheetInfo: {
 setsu: '', taishou: '', sonota: '', custom: '' }
 }
;
        }
        /* ================= セル描画の統一処理 ================= */        function renderCellContent(td, data) {
            if (!data || typeof data !== 'object') {
                td.innerHTML = '';
 td.classList.remove('font-bold', 'bg-blue-50', 'cell-double-border');
 setCellColorClass(td, 'black');
 delete td.dataset.defects;
 return;
            }
            td.innerHTML = '';
                        const textSpan = document.createElement('span');
            textSpan.className = 'main-text';
            textSpan.textContent = data.t || '';
            td.appendChild(textSpan);
                        if (data.defects && data.defects.length > 0) {
                td.dataset.defects = JSON.stringify(data.defects);
                td.classList.add('font-bold');
                                const hasUT = data.defects.some(d => d.mode === 'UT');
                const hasVT = data.defects.some(d => d.mode === 'VT');
                const hasMisalign = data.defects.some(d => d.mode === 'Misalign');
                 const hasSuminiku = data.defects.some(d => d.mode === 'Suminiku');
                                 if (hasUT) {
                    const utDiv = document.createElement('div');
                    utDiv.className = 'text-[8px] text-red-600 font-normal leading-[1.1] mt-0.5 whitespace-normal break-words not-draggable';
                    utDiv.textContent = '※UT記録あり';
                    td.appendChild(utDiv);
                }
                if (hasVT) {
                    const vtDiv = document.createElement('div');
                    vtDiv.className = 'text-[8px] text-blue-600 font-normal leading-[1.1] mt-0.5 whitespace-normal break-words not-draggable';
                    vtDiv.textContent = '※外観記録あり';
                    td.appendChild(vtDiv);
                }
                if (hasMisalign) {
                    const maDiv = document.createElement('div');
                    maDiv.className = 'text-[8px] text-green-600 font-normal leading-[1.1] mt-0.5 whitespace-normal break-words not-draggable';
                    maDiv.textContent = '※食違い記録あり';
                    td.appendChild(maDiv);
                }
                if (hasSuminiku) {
                    const suDiv = document.createElement('div');
                    suDiv.className = 'text-[8px] text-orange-600 font-normal leading-[1.1] mt-0.5 whitespace-normal break-words not-draggable';
                    suDiv.textContent = '※すみ肉記録あり';
                    td.appendChild(suDiv);
                }
            }
 else {
                td.classList.remove('font-bold');
                td.dataset.defects = '[]';
            }
                        setCellColorClass(td, data.c || 'black');
            if(data.t) td.classList.add('bg-blue-50');
 else td.classList.remove('bg-blue-50');
            if(data.db) td.classList.add('cell-double-border');
 else td.classList.remove('cell-double-border');
        }
        window.onload = () => {
             initApp();
 checkBackupExists();
             window.addEventListener('beforeunload', () => saveDraft());
            window.addEventListener('resize', updateStickyTop);
                        const scrollArea = $('tableScrollArea');
            scrollArea.addEventListener('scroll', () => {
                if (scrollArea.scrollTop > 10) {
                    if (!scrollArea.classList.contains('is-scrolled')) {
 scrollArea.classList.add('is-scrolled');
 updateStickyTop();
 }
                }
 else {
                    if (scrollArea.classList.contains('is-scrolled')) {
 scrollArea.classList.remove('is-scrolled');
 updateStickyTop();
 }
                }
            }
);
            setTimeout(updateStickyTop, 100);
        }
;
        function updateStickyTop() {
            requestAnimationFrame(() => {
                const h1 = $('headerRow1');
 if(!h1) return;
                const h1Height = h1.offsetHeight;
                document.querySelectorAll('.sticky-top-2').forEach(th => {
 th.style.top = h1Height + 'px';
 }
);
            }
);
        }
        function syncActiveSheetToModel() {
            const sheet = sheets.find(s => s.id === activeSheetId);
 if(!sheet) return;
            sheet.lc = lotCount;
 sheet.rc = rowCount;
 sheet.sheetInfo = {
 ...sheetInfo }
;
                        sheet.lots = [];
            const h1 = $('headerRow1');
 const ths = Array.from(h1.children).slice(1);
            ths.forEach(th => {
                const blocks = Array.from(th.querySelectorAll('.lot-cell')).map(c => ({
                    s: c.dataset.setsu || '', k: c.dataset.kigou || '', u: c.dataset.suu || '', c: c.dataset.color || 'black'                }
));
                sheet.lots.push(blocks);
            }
);
                        sheet.thick = [];
 sheet.lockedBuzai = [];
 sheet.rows = [];
            Array.from($('tableBody').children).forEach((tr, r) => {
                if(tr.classList.contains('row-thick-border')) sheet.thick.push(r);
 if(tr.classList.contains('buzai-locked')) sheet.lockedBuzai.push(r);
                sheet.rows.push(Array.from(tr.children).map(td => {
                    let t = '';
                    const mainSpan = td.querySelector('.main-text');
                    if (mainSpan) {
 t = mainSpan.textContent.trim();
 }
                     else {
                        if (td.classList.contains('row-num-cell')) {
                             const fallbackSpan = td.querySelector('.main-text');
                             if(fallbackSpan) t = fallbackSpan.textContent.trim();
                             else t = td.childNodes[0] ? td.childNodes[0].textContent.replace(td.dataset.rowNum||'', '').trim() : '';
                        }
 else {
 t = td.textContent.trim();
 }
                    }
                                        let defects = [];
                    if (td.dataset.defects && td.dataset.defects !== 'undefined') {
                        try {
 defects = JSON.parse(td.dataset.defects);
 }
 catch(e){
}
                    }
                    return {
 t: t, c: td.dataset.color || 'black', db: td.classList.contains('cell-double-border'), defects: defects }
;
                }
));
            }
);
                        sheet.notes = [];
            document.querySelectorAll('.sticky-note').forEach(note => {
                sheet.notes.push({
 id: note.id, x: parseInt(note.style.left), y: parseInt(note.style.top), w: parseInt(note.style.width), h: parseInt(note.style.height), text: note.querySelector('textarea').value }
);
            }
);
        }
        function loadActiveSheetToDOM() {
            const sheet = sheets.find(s => s.id === activeSheetId);
 if(!sheet) return;
            lotCount = sheet.lc || 3;
 rowCount = sheet.rc || 100;
            sheetInfo = sheet.sheetInfo ? {
 ...sheet.sheetInfo }
 : {
 setsu: '', taishou: '', sonota: '', custom: '' }
;
                        renderHeaders();
            $('tableBody').innerHTML = '';
            const rowFragment = document.createDocumentFragment();
            for(let i=0;
 i<rowCount;
 i++) rowFragment.appendChild(createRowElement());
            $('tableBody').appendChild(rowFragment);
            reindexCells();
            if(sheet.lots) {
                const h1 = $('headerRow1');
 const ths = Array.from(h1.children).slice(1);
                sheet.lots.forEach((lData, i) => {
                    const th = ths[i];
 if(!th) return;
                    const container = th.querySelector('.lot-blocks-container');
 container.innerHTML = '';
                    const blocks = Array.isArray(lData) ? lData : [lData];
                    if(blocks.length === 0) blocks.push({
s:'', k:'', u:'', c:'black'}
);
                    blocks.forEach(l => {
                        const lBlock = createLotBlock();
 const lDiv = lBlock.querySelector('.lot-cell');
                        Object.assign(lDiv.dataset, {
setsu:l.s||'', kigou:l.k||'', suu:l.u||''}
);
                        setCellColorClass(lDiv, l.c || 'black');
 updLot(lDiv);
 container.appendChild(lBlock);
                    }
);
                }
);
            }
                        if(sheet.rows) {
                Array.from($('tableBody').children).forEach((tr, i) => {
                    if(sheet.thick && sheet.thick.includes(i)) tr.classList.add('row-thick-border');
 if(sheet.lockedBuzai && sheet.lockedBuzai.includes(i)) tr.classList.add('buzai-locked');
                    Array.from(tr.children).forEach((td, j) => {
                        const d = sheet.rows[i] ? sheet.rows[i][j] : undefined;
                        if (d !== undefined && d !== null) {
                            if (typeof d === 'object') {
 renderCellContent(td, d);
 }
                             else {
 renderCellContent(td, {
 t: d, c: 'black', db: false, defects: [] }
);
 }
                        }
 else {
 renderCellContent(td, {
 t: '', c: 'black' }
);
 }
                    }
);
                }
);
            }
                        renderNotes(sheet.notes || []);
 clearSelection();
 updateSheetInfoDisplay();
 calcKensasuSum();
 updateEdabanVisibility();
 updateStickyTop();
        }
        function saveDraft() {
 syncActiveSheetToModel();
 try {
 localStorage.setItem('appDraft', JSON.stringify({
 sheets: sheets, activeSheetId: activeSheetId, recordInfo: recordInfo }
));
 }
 catch(e) {
 console.warn('Quota exceeded on saveDraft', e);
 alert('【警告】一時保存データが容量上限（約5MB）に達しました。これ以上のシート追加や操作が保存されない可能性があります。不要な記録データ等を消去してください。');
 }
 }
        function initApp() {
            historyStack = [];
 migrateMasterData(getMaster());
 $('headerProjectName').textContent = projects[currentPId].name;
 renderMasterCats();
 renderMasterItems();
            const draftStr = localStorage.getItem('appDraft');
            if(draftStr) {
                try {
                    const draft = JSON.parse(draftStr);
                    if(draft && draft.sheets && Array.isArray(draft.sheets) && draft.sheets.length > 0) {
 sheets = draft.sheets;
 activeSheetId = draft.activeSheetId || sheets[0].id;
 recordInfo = draft.recordInfo || {
 date: getTodayString(), inspectors: [] }
;
 }
                     else {
 throw new Error('Invalid draft format');
 }
                    updateRecordInfoUI();
                    loadActiveSheetToDOM();
 renderSheetTabs();
 return;
                 }
 catch(e) {
 console.error('Draft load error, initializing new', e);
 }
            }
            sheets = [createEmptySheet('sheet_' + Date.now(), 'シート1')];
 activeSheetId = sheets[0].id;
 recordInfo = {
 date: getTodayString(), inspectors: [] }
;
            updateRecordInfoUI();
            loadActiveSheetToDOM();
 renderSheetTabs();
        }
        function renderSheetTabs() {
            const bar = $('sheetTabBar');
 bar.innerHTML = '';
            sheets.forEach(s => {
                const isActive = s.id === activeSheetId;
                const btn = el('div', `flex items-center gap-1 px-4 py-2 font-bold cursor-pointer transition whitespace-nowrap border-r border-gray-300 ${
isActive ? 'bg-white text-blue-700 border-t-4 border-t-blue-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
`, {
 onclick: () => switchSheet(s.id) }
);
                btn.appendChild(el('span', '', {
 text: s.name }
));
                if (isActive) {
                    btn.appendChild(el('button', 'text-gray-400 hover:text-blue-500 p-1 ml-1', {
 html: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>', onclick: (e) => renameSheet(s.id, e) }
));
                    btn.appendChild(el('button', 'text-gray-400 hover:text-red-500 p-1', {
 html: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>', onclick: (e) => deleteSheet(s.id, e) }
));
                }
                bar.appendChild(btn);
            }
);
            bar.appendChild(el('button', 'px-4 py-2 font-bold text-blue-600 hover:bg-gray-200 whitespace-nowrap flex items-center gap-1 shrink-0', {
 html: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> 追加', onclick: addSheet }
));
        }
        function switchSheet(id) {
 if(activeSheetId === id) return;
 saveHistory();
 activeSheetId = id;
 loadActiveSheetToDOM();
 renderSheetTabs();
 saveDraft();
 }
        function addSheet() {
 saveHistory();
 const id = 'sheet_' + Date.now();
 sheets.push(createEmptySheet(id, 'シート' + (sheets.length + 1)));
 activeSheetId = id;
 loadActiveSheetToDOM();
 renderSheetTabs();
 saveDraft();
 }
                function getTodayString() {
            const d = new Date();
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            return `${
yyyy}
-${
mm}
-${
dd}
`;
        }
        function updateRecordInfoUI() {
            const dInp = document.getElementById('recordDateInput');
            if(dInp) dInp.value = recordInfo.date || '';
            const iBtn = document.getElementById('recordInspectorBtn');
            if(iBtn) iBtn.textContent = (recordInfo.inspectors && recordInfo.inspectors.length > 0) ? recordInfo.inspectors.join('、') : '未選択';
        }
        function saveRecordDate() {
            recordInfo.date = document.getElementById('recordDateInput').value;
            saveDraft();
        }
        function deleteSheet(id, event) {
             event.stopPropagation();
             if(sheets.length <= 1) return alert('最低1つのシートが必要です。');
             syncActiveSheetToModel();
            const sheetToDel = sheets.find(s => s.id === id);
            let hasData = false;
            if(sheetToDel) {
                if(sheetToDel.sheetInfo && (sheetToDel.sheetInfo.setsu || sheetToDel.sheetInfo.taishou || sheetToDel.sheetInfo.sonota || sheetToDel.sheetInfo.custom)) hasData = true;
                if(!hasData && sheetToDel.lots) {
                    for(let blocks of sheetToDel.lots) {
                        for(let b of blocks) {
                            if(b.s || b.k || b.u || (b.c && b.c !== 'black')) {
 hasData = true;
 break;
 }
                        }
                        if(hasData) break;
                    }
                }
                if(!hasData && sheetToDel.rows) {
                    for(let row of sheetToDel.rows) {
                        for(let cell of row) {
                            if(cell && cell.t && cell.t.trim() !== '') {
 hasData = true;
 break;
 }
                            if(cell && cell.c && cell.c !== 'black') {
 hasData = true;
 break;
 }
                            if(cell && cell.defects && cell.defects.length > 0) {
 hasData = true;
 break;
 }
                        }
                        if(hasData) break;
                    }
                }
                if(!hasData && sheetToDel.notes && sheetToDel.notes.length > 0) hasData = true;
            }
                                    if(hasData) {

                if(!confirm("データが入力されているシートを消去します。よろしいですか？\n※消去する直前の状態が自動で一時保存されます。")) return;

                const d = new Date();

                const autoName = "【自動保存】消去前_" + d.getFullYear() + "/" + String(d.getMonth()+1).padStart(2,'0') + "/" + String(d.getDate()).padStart(2,'0') + "_" + String(d.getHours()).padStart(2,'0') + ":" + String(d.getMinutes()).padStart(2,'0') + "-" + String(d.getSeconds()).padStart(2,'0');

                const rec = {
 id: Date.now(), name: autoName, pId: currentPId, sheets: JSON.parse(JSON.stringify(sheets)), recordInfo: JSON.parse(JSON.stringify(recordInfo)) }
;
 
                try {

                    const saved = JSON.parse(localStorage.getItem("appRecords")||"[]");
 
                    saved.unshift(rec);
 
                    localStorage.setItem("appRecords", JSON.stringify(saved));
 
                    if(typeof renderSavedRecords === 'function') renderSavedRecords();

                }
 catch(e) {

                    console.error(e);

                    alert("保存容量がいっぱいで一時保存できないため、消去を中止しました。不要なデータを消去して再度お試しください。");

                    return;
 
                }

            }
 else {

                if(!confirm("このシートを消去しますか？")) return;
 
            }

             saveHistory();
             sheets = sheets.filter(s => s.id !== id);
             if(activeSheetId === id) activeSheetId = sheets[0].id;
             recordInfo = {
 date: getTodayString(), inspectors: [] }
;
            updateRecordInfoUI();
            loadActiveSheetToDOM();
             renderSheetTabs();
             saveDraft();
         }
        function renameSheet(id, event) {
 event.stopPropagation();
 const sheet = sheets.find(s => s.id === id);
 const newName = prompt('シート名を入力してください', sheet.name);
 if(newName && newName.trim() !== '') {
 saveHistory();
 sheet.name = newName.trim();
 renderSheetTabs();
 saveDraft();
 }
 }
        function saveHistory() {
 syncActiveSheetToModel();
 historyStack.push({
 sheets: JSON.parse(JSON.stringify(sheets)), activeSheetId: activeSheetId, recordInfo: JSON.parse(JSON.stringify(recordInfo)) }
);
 if(historyStack.length > 50) historyStack.shift();
 redoStack = [];
 saveDraft();
 }
        function performUndo() {
 if(historyStack.length === 0) return;
 syncActiveSheetToModel();
 redoStack.push({
 sheets: JSON.parse(JSON.stringify(sheets)), activeSheetId: activeSheetId, recordInfo: JSON.parse(JSON.stringify(recordInfo)) }
);
 const state = historyStack.pop();
 sheets = state.sheets;
 activeSheetId = state.activeSheetId;
 recordInfo = state.recordInfo || {
date:'', inspectors:[]}
;
 updateRecordInfoUI();
 loadActiveSheetToDOM();
 renderSheetTabs();
 saveDraft();
 }
 function performRedo() {
 if(redoStack.length === 0) return;
 syncActiveSheetToModel();
 historyStack.push({
 sheets: JSON.parse(JSON.stringify(sheets)), activeSheetId: activeSheetId, recordInfo: JSON.parse(JSON.stringify(recordInfo)) }
);
 const state = redoStack.pop();
 sheets = state.sheets;
 activeSheetId = state.activeSheetId;
 recordInfo = state.recordInfo || {
date:'', inspectors:[]}
;
 updateRecordInfoUI();
 loadActiveSheetToDOM();
 renderSheetTabs();
 saveDraft();
 }
        function openSheetInfoModal() {
 if (currentMode === 'select' || currentMode === 'eraser' || currentMode === 'paste') return;
 edSheetInfo = {
...sheetInfo}
;
 $('sheetInfoCustomInput').value = edSheetInfo.custom;
 renderSheetInfoBtns();
 openModal('sheetInfoModal');
 }
        function renderSheetInfoBtns() {
            ['setsu', 'taishou', 'sonota'].forEach(key => {
                const container = $(`sheetInfo${
key.charAt(0).toUpperCase() + key.slice(1)}
Btns`);
 container.innerHTML = '';
                let options = sheetInfoMaster[key];
 if (key === 'setsu') {
 options = getMaster().lot_setsu.map(v => v + (v.includes('節') ? '' : '節'));
 }
 options.forEach(val => {
                    const isSelected = edSheetInfo[key] === val;
                    container.appendChild(el('button', `px-3 py-2 rounded-lg font-bold border transition text-sm shadow-sm ${
isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}
`, {
 text: val, onclick: () => {
 edSheetInfo[key] = isSelected ? '' : val;
 renderSheetInfoBtns();
 }
 }
));
                }
);
            }
);
        }
        function applySheetInfo(clear = false) {
 saveHistory();
 if (clear) {
 sheetInfo = {
 setsu: '', taishou: '', sonota: '', custom: '' }
;
 }
 else {
 sheetInfo = {
 ...edSheetInfo }
;
 sheetInfo.custom = $('sheetInfoCustomInput').value.trim();
 }
 updateSheetInfoDisplay();
 closeModal();
 }
        function clearSheetInfo() {
 applySheetInfo(true);
 }
        function updateSheetInfoDisplay() {
            const display = $('sheetInfoDisplay');
 if (!display) return;
            const parts = [sheetInfo.setsu, sheetInfo.taishou, sheetInfo.sonota, sheetInfo.custom].filter(v => v);
            if (parts.length > 0) {
 display.textContent = parts.join('\n');
 display.classList.remove('text-gray-400');
 display.classList.add('text-blue-700');
 }
 else {
 display.textContent = '未設定';
 display.classList.add('text-gray-400');
 display.classList.remove('text-blue-700');
 }
        }
        function setMode(mode) {
            currentMode = mode;
            document.querySelectorAll('.mode-btn').forEach(btn => {
 btn.classList.remove('bg-blue-100', 'text-blue-700');
 btn.classList.add('text-gray-500');
 }
);
            $(`btn-mode-${
mode}
`).classList.add('bg-blue-100', 'text-blue-700');
 $(`btn-mode-${
mode}
`).classList.remove('text-gray-500');
            if (mode === 'select') $('mainTable').classList.add('select-mode');
 else {
 $('mainTable').classList.remove('select-mode');
 clearSelection();
 }
        }
        function applyColor(cKey) {
            currentTextColor = cKey;
            ['black', 'red', 'blue', 'green'].forEach(k => {
                const btn = $(`color-${
k}
`);
                if(k === cKey) {
 btn.classList.add('ring-2', 'ring-blue-400', 'border-white');
 btn.classList.remove('border-transparent');
 }
 else {
 btn.classList.remove('ring-2', 'ring-blue-400', 'border-white');
 btn.classList.add('border-transparent');
 }
            }
);
            if (currentMode === 'select' && document.querySelectorAll('.selected-cell').length > 0) {
                saveHistory();
                document.querySelectorAll('.selected-cell').forEach(td => {
                    const t = td.querySelector('.main-text') ? td.querySelector('.main-text').textContent : '';
                    if (t.trim() !== '') {
                        const newData = {
 t: t, c: cKey, db: td.classList.contains('cell-double-border'), defects: td.dataset.defects ? JSON.parse(td.dataset.defects) : [] }
;
                        renderCellContent(td, newData);
                    }
                }
);
            }
        }
        let edInspectors = [];
        function openInspectorModal() {
            if (currentMode === 'select' || currentMode === 'eraser' || currentMode === 'paste') return;
            edInspectors = [...(recordInfo.inspectors || [])];
            openModal('inspectorModal', renderInspectorModal);
        }
        function closeInspectorModal() {
            closeModal();
        }
        function renderInspectorModal() {
            const list = $('inspectorModalList');
 list.innerHTML = '';
            const master = getMaster();
            const inspectors = master.inspector || [];
            inspectors.forEach(ins => {
                const isSelected = edInspectors.includes(ins);
                const btn = el('button', `px-4 py-3 rounded-lg font-bold border transition text-left ${
isSelected ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}
`, {
 text: ins, onclick: () => {
                    if (isSelected) {
 edInspectors = edInspectors.filter(x => x !== ins);
 }
                    else {
 edInspectors.push(ins);
 }
                    renderInspectorModal();
                }
}
);
                list.appendChild(btn);
            }
);
            if (inspectors.length === 0) {
                list.appendChild(el('div', 'text-gray-500 text-sm p-2', {
 text: 'マスタ管理画面から「検査員」を登録してください。' }
));
            }
        }
        function applyInspectors() {
            saveHistory();
            recordInfo.inspectors = [...edInspectors];
            updateRecordInfoUI();
            saveDraft();
            closeModal();
        }
        function setCellColorClass(cell, colorKey) {
            if (!colorKey) colorKey = 'black';
 cell.dataset.color = colorKey;
            const targetEl = cell.classList.contains('lot-cell') ? cell.querySelector('.lot-display') : cell;
            Object.values(textColors).forEach(cls => targetEl.classList.remove(cls));
 targetEl.classList.add(textColors[colorKey]);
        }
        function copySelected() {
            const selected = document.querySelectorAll('.selected-cell');
 if (selected.length === 0) return;
            let minR = Infinity, minC = Infinity;
            selected.forEach(td => {
 const r = parseInt(td.dataset.r), c = parseInt(td.dataset.c);
 if(r < minR) minR = r;
 if(c < minC) minC = c;
 }
);
            clipboardData = [];
            selected.forEach(td => {
                clipboardData.push({
                     dr: parseInt(td.dataset.r) - minR, dc: parseInt(td.dataset.c) - minC,                     text: td.querySelector('.main-text') ? td.querySelector('.main-text').textContent : '',                     color: td.dataset.color || 'black',                    defects: td.dataset.defects ? JSON.parse(td.dataset.defects) : []                }
);
            }
);
            $('btn-mode-paste').classList.remove('hidden');
 clearSelection();
 setMode('paste');
         }
        function cutSelected() {
            const selected = document.querySelectorAll('.selected-cell');
 if (selected.length === 0) return;
            let minR = Infinity, minC = Infinity;
            selected.forEach(td => {
 const r = parseInt(td.dataset.r), c = parseInt(td.dataset.c);
 if(r < minR) minR = r;
 if(c < minC) minC = c;
 }
);
            clipboardData = [];
            selected.forEach(td => {
                clipboardData.push({
                     dr: parseInt(td.dataset.r) - minR, dc: parseInt(td.dataset.c) - minC,                     text: td.querySelector('.main-text') ? td.querySelector('.main-text').textContent : '',                     color: td.dataset.color || 'black',                    defects: td.dataset.defects ? JSON.parse(td.dataset.defects) : []                }
);
            }
);
            saveHistory();
            selected.forEach(td => {
 renderCellContent(td, {
 t: '', c: 'black', db: td.classList.contains('cell-double-border'), defects: [] }
);
 }
);
            $('btn-mode-paste').classList.remove('hidden');
 clearSelection();
 setMode('paste');
 calcKensasuSum();
        }
        function switchView(vid) {
            $('view-input').style.display = vid === 'view-input' ? 'flex' : 'none';
 $('view-master').style.display = vid === 'view-master' ? 'flex' : 'none';
            $('actionButtons').style.display = vid === 'view-input' ? 'flex' : 'none';
 $('paletteBar').style.display = vid === 'view-input' ? 'flex' : 'none';
            $('tab-input').className = vid === 'view-input' ? 'bg-blue-600 text-white px-3 py-1.5 rounded-md font-bold text-sm shadow-sm' : 'text-gray-600 hover:bg-gray-200 px-3 py-1.5 rounded-md font-bold text-sm';
            $('tab-master').className = vid === 'view-master' ? 'bg-blue-600 text-white px-3 py-1.5 rounded-md font-bold text-sm shadow-sm' : 'text-gray-600 hover:bg-gray-200 px-3 py-1.5 rounded-md font-bold text-sm';
        }
        function changeProject(id) {
 currentPId = id;
 saveData();
 migrateMasterData(getMaster());
 $('headerProjectName').textContent = projects[id].name;
 renderMasterCats();
 renderMasterItems();
 closeModal();
 }
        function addProject() {
 const name = $('newProjectInput').value.trim();
 if(!name) return;
 const id = Date.now().toString();
 projects[id] = {
 name, master: JSON.parse(JSON.stringify(defMaster)) }
;
 migrateMasterData(projects[id].master);
 $('newProjectInput').value = '';
 changeProject(id);
 }
        function renderProjectList() {
             const list = $('projectList');
 list.innerHTML = '';
             Object.keys(projects).forEach(id => {
                 const rowDiv = el('div', 'flex gap-2 w-full mb-2');
                 const btn = el('button', `flex-1 p-4 rounded-xl text-left font-bold border transition ${
id === currentPId ? 'bg-blue-100 border-blue-400 text-blue-800' : 'bg-gray-50 hover:bg-gray-100'}
`, {
text: projects[id].name}
);
                 btn.onclick = () => changeProject(id);
 rowDiv.appendChild(btn);
                 const delBtn = el('button', 'bg-red-50 text-red-600 px-4 rounded-xl font-bold border border-red-200 hover:bg-red-100 shadow-sm', {
text: '消去'}
);
                 delBtn.onclick = () => {
 if(Object.keys(projects).length <= 1) return alert('最低1つの工事は必要です。');
 if(confirm(`工事「${
projects[id].name}
」を本当に消去してよろしいですか？`)) {
 delete projects[id];
 if(currentPId === id) changeProject(Object.keys(projects)[0]);
 else renderProjectList();
 saveData();
 }
 }
;
                 rowDiv.appendChild(delBtn);
 list.appendChild(rowDiv);
             }
);
         }
        function renderMasterCats() {
             const list = $('masterCategoryList');
 list.innerHTML = '';
             catDefs.filter(c => c.id !== 'kensasu').forEach(c => {
                 const li = el('li', `p-4 cursor-pointer font-bold border-b ${
c.id === activeCat ? 'bg-blue-50 text-blue-700 border-l-4 border-l-blue-600' : 'text-gray-600 hover:bg-gray-100'}
`, {
text: c.n}
);
                 li.onclick = () => {
 activeCat = c.id;
 renderMasterCats();
 renderMasterItems();
 }
;
 list.appendChild(li);
             }
);
         }
        function renderMasterItems() {
             $('masterTitle').textContent = catDefs.find(c => c.id === activeCat).n;
 const container = $('masterItemList');
 container.innerHTML = '';
 const subCatSelect = $('newMasterSubCat');
                        const excelSec = $('excelImportSection');
            if (excelSec) {
                if (activeCat === 'buzai') {
                    excelSec.classList.remove('hidden');
                    excelSec.classList.add('flex');
                }
 else {
                    excelSec.classList.add('hidden');
                    excelSec.classList.remove('flex');
                }
            }
            migrateMasterData(getMaster());
 masterSortables.forEach(s => s.destroy());
 masterSortables = [];
                        if (groupDefs[activeCat]) {
                subCatSelect.classList.remove('hidden');
                if (subCatSelect.options.length === 0 || subCatSelect.dataset.cat !== activeCat) {
                    subCatSelect.innerHTML = '';
 groupDefs[activeCat].forEach(sub => {
 subCatSelect.appendChild(el('option', '', {
value: sub, text: sub}
));
 }
);
 subCatSelect.dataset.cat = activeCat;
                }
                groupDefs[activeCat].forEach(sub => {
                    const items = getMaster()[activeCat][sub] || [];
 const groupDiv = el('div', 'w-full mb-4');
 groupDiv.appendChild(el('div', 'font-bold text-gray-700 mb-2 border-b-2 border-gray-200 pb-1', {
text: `■ ${
sub}
`}
));
                    const itemBox = el('div', 'flex flex-wrap gap-2 master-sortable-group min-h-[50px] p-2 bg-gray-50 rounded-lg border border-dashed border-gray-300');
 itemBox.dataset.subcat = sub;
                    items.forEach((item, idx) => {
                        const div = el('div', 'flex justify-between items-center bg-white border px-3 py-1.5 rounded-lg gap-2 shadow-sm cursor-move touch-manipulation');
 div.dataset.val = item;
                        div.appendChild(el('span', 'text-gray-400 mr-1', {
html: '&#x2630;
'}
));
 div.appendChild(el('span', 'font-bold text-sm text-gray-800', {
text: item}
));
                         div.appendChild(el('button', 'text-red-500 text-sm font-bold bg-red-50 px-2 py-0.5 rounded hover:bg-red-100 ml-1', {
text: '消去', onclick: () => {
 getMaster()[activeCat][sub].splice(idx,1);
 saveData();
 renderMasterItems();
 }
}
));
 itemBox.appendChild(div);
                    }
);
                    /* empty-msg removed to fix drag and drop */                    groupDiv.appendChild(itemBox);
 container.appendChild(groupDiv);
                    masterSortables.push(new Sortable(itemBox, {
 group: 'sharedMaster', animation: 150, filter: '.empty-msg', ghostClass: 'opacity-50', onEnd: updateMasterFromDOM }
));
                }
);
            }
 else {
                subCatSelect.classList.add('hidden');
 if (!getMaster()[activeCat]) getMaster()[activeCat] = defMaster[activeCat] ? [...defMaster[activeCat]] : [];
                const itemBox = el('div', 'flex flex-wrap gap-3 w-full master-sortable-group min-h-[50px] p-2 bg-gray-50 rounded-lg border border-dashed border-gray-300');
                getMaster()[activeCat].forEach((item, idx) => {
                     const div = el('div', 'flex justify-between items-center bg-white border px-3 py-1.5 rounded-lg gap-3 shadow-sm cursor-move touch-manipulation');
 div.dataset.val = item;
                    div.appendChild(el('span', 'text-gray-400 mr-1', {
html: '&#x2630;
'}
));
 div.appendChild(el('span', 'font-bold text-gray-800', {
text: item}
));
                     div.appendChild(el('button', 'text-red-500 text-sm font-bold bg-red-50 px-2 py-0.5 rounded hover:bg-red-100 ml-1', {
text: '消去', onclick: () => {
 getMaster()[activeCat].splice(idx,1);
 saveData();
 renderMasterItems();
 }
}
));
 itemBox.appendChild(div);
                 }
);
                 if(getMaster()[activeCat].length === 0) itemBox.appendChild(el('div', 'text-gray-400 text-xs py-2 w-full text-center empty-msg pointer-events-none', {
text: '登録されていません'}
));
                container.appendChild(itemBox);
                masterSortables.push(new Sortable(itemBox, {
 animation: 150, filter: '.empty-msg', ghostClass: 'opacity-50', onEnd: updateMasterFromDOM }
));
            }
        }
        function updateMasterFromDOM() {
            if (groupDefs[activeCat]) {
 groupDefs[activeCat].forEach(sub => {
 const box = document.querySelector(`.master-sortable-group[data-subcat="${
sub}
"]`);
 if (box) {
 const newItems = [];
 Array.from(box.children).forEach(child => {
 if (child.dataset.val) newItems.push(child.dataset.val);
 }
);
 getMaster()[activeCat][sub] = newItems;
 }
 }
);
 }
             else {
 const box = document.querySelector('.master-sortable-group');
 if (box) {
 const newItems = [];
 Array.from(box.children).forEach(child => {
 if (child.dataset.val) newItems.push(child.dataset.val);
 }
);
 getMaster()[activeCat] = newItems;
 }
 }
            saveData();
 renderMasterItems();
         }
        function addMasterItem() {
             const val = $('newMasterInput').value.trim();
 if(!val) return;
 migrateMasterData(getMaster());
            if (groupDefs[activeCat]) {
 const sub = $('newMasterSubCat').value;
 if (!getMaster()[activeCat][sub]) getMaster()[activeCat][sub] = [];
 if (!getMaster()[activeCat][sub].includes(val)) {
 getMaster()[activeCat][sub].push(val);
 $('newMasterInput').value = '';
 saveData();
 renderMasterItems();
 }
 }
             else {
 if (!getMaster()[activeCat]) getMaster()[activeCat] = [];
 if(!getMaster()[activeCat].includes(val)) {
 getMaster()[activeCat].push(val);
 $('newMasterInput').value='';
 saveData();
 renderMasterItems();
 }
 }
        }
        function importExcelToMaster(event) {
            const file = event.target.files[0];
            if (!file) return;
                        const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, {
type: 'array'}
);
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const json = XLSX.utils.sheet_to_json(worksheet, {
header: 1, defval: ''}
);
                                        migrateMasterData(getMaster());
                                        let addedCount = 0;
                                        if (activeCat === 'buzai') {
                        const targetCols = {
                            0: '柱',                            1: '梁',                            2: 'その他'                        }
;
                                                json.forEach(row => {
                            for (let colIdx in targetCols) {
                                const sub = targetCols[colIdx];
                                const val = String(row[colIdx] || '').trim();
                                if (val) {
                                    if (!getMaster()[activeCat][sub]) getMaster()[activeCat][sub] = [];
                                    if (!getMaster()[activeCat][sub].includes(val)) {
                                        getMaster()[activeCat][sub].push(val);
                                        addedCount++;
                                    }
                                }
                            }
                        }
);
                    }
                                        if (addedCount > 0) {
                        saveData();
                        renderMasterItems();
                        alert(`${
addedCount}
件のデータを追加しました。`);
                    }
 else {
                        alert('追加する新しいデータが見つかりませんでした。');
                    }
                }
 catch (error) {
                    console.error(error);
                    alert('ファイルの読み込みに失敗しました。正しいエクセルファイルか確認してください。');
                }
                event.target.value = '';
            }
;
            reader.readAsArrayBuffer(file);
        }
        function importExcelToMaster(event) {
            const file = event.target.files[0];
            if (!file) return;
                        const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, {
type: 'array'}
);
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const json = XLSX.utils.sheet_to_json(worksheet, {
header: 1, defval: ''}
);
                                        migrateMasterData(getMaster());
                                        let addedCount = 0;
                                        if (activeCat === 'buzai') {
                        /* A列:柱, B列:梁, C列:その他 */                        const targetCols = {
                            0: '柱',    /* A列 */                            1: '梁',    /* B列 */                            2: 'その他' /* C列 */                        }
;
                                                json.forEach(row => {
                            for (let colIdx in targetCols) {
                                const sub = targetCols[colIdx];
                                const val = String(row[colIdx] || '').trim();
                                if (val) {
                                    if (!getMaster()[activeCat][sub]) getMaster()[activeCat][sub] = [];
                                    if (!getMaster()[activeCat][sub].includes(val)) {
                                        getMaster()[activeCat][sub].push(val);
                                        addedCount++;
                                    }
                                }
                            }
                        }
);
                    }
                                        if (addedCount > 0) {
                        saveData();
                        renderMasterItems();
                        alert(`${
addedCount}
件のデータを追加しました。`);
                    }
 else {
                        alert('追加する新しいデータが見つかりませんでした。');
                    }
                }
 catch (error) {
                    console.error(error);
                    alert('ファイルの読み込みに失敗しました。正しいエクセルファイルか確認してください。');
                }
                event.target.value = '';
 /* Reset input */            }
;
            reader.readAsArrayBuffer(file);
        }
        function exportProjects() {
             try {
                 syncActiveSheetToModel();
                 saveData();
                                 let appRecords = JSON.parse(localStorage.getItem('appRecords')||'[]');
                const currentSheetsJson = JSON.stringify(sheets);
                const isAlreadySaved = appRecords.some(r => JSON.stringify(r.sheets) === currentSheetsJson);
                                if (!isAlreadySaved) {
                    if (confirm("現在表示中の作業状態がリストに「一時保存」されていません。\nバックアップとしてリストに保存してから書き出しますか？\n\n・[OK] ＝ 保存して書き出す\n・[キャンセル] ＝ 保存せずにそのまま書き出す")) {
                        const nameBox = document.getElementById('saveName');
                        const name = (nameBox && nameBox.value.trim()) ? nameBox.value.trim() : (projects[currentPId].name + ' ' + new Date().toLocaleString());
                        const rec = {
 id: Date.now(), name: name, pId: currentPId, sheets: JSON.parse(currentSheetsJson) }
;
                         appRecords.unshift(rec);
                         localStorage.setItem('appRecords', JSON.stringify(appRecords));
                         if (nameBox) nameBox.value = '';
                         renderSavedRecords();
                     }
                }
                const now = new Date();
                const yy = now.getFullYear();
                const mm = String(now.getMonth()+1).padStart(2,'0');
                const dd = String(now.getDate()).padStart(2,'0');
                const hh = String(now.getHours()).padStart(2,'0');
                const min = String(now.getMinutes()).padStart(2,'0');
                const ss = String(now.getSeconds()).padStart(2,'0');
 const filename = `入力データ_${
yy}
/${
mm}
/${
dd}
_${
hh}
:${
min}
-${
ss}
.json`;
                                /* appRecordsが更新されたかもしれないので最新のものを書き出す */                appRecords = JSON.parse(localStorage.getItem('appRecords')||'[]');
                const exportData = {
                    type: 'full_sync_v2',                    projects: projects,                    appRecords: appRecords                }
;
                                const blob = new Blob([JSON.stringify(exportData, null, 2)], {
type: 'application/json'}
);
                 const url = URL.createObjectURL(blob);
                 const a = document.createElement('a');
                 a.href = url;
                 a.download = filename;
                 document.body.appendChild(a);
                 a.click();
                 setTimeout(() => {
 document.body.removeChild(a);
 URL.revokeObjectURL(url);
 }
, 100);
             }
 catch(e) {
                 console.error(e);
                 alert("データの書き出しに失敗しました。");
             }
         }
        function importProjects(e) {
             const file = e.target.files[0];
 if(!file) return;
                         if (!confirm(`【警告】\n現在のデータと保存済み記録が全て上書きされます。\n本当に「${
file.name}
」を読み込んでもよろしいですか？`)) {
                e.target.value = '';
                return;
            }
            const reader = new FileReader();
             reader.onload = (evt) => {
                 try {
                     const data = JSON.parse(evt.target.result);
                     if(Array.isArray(data) && data.length > 0 && data[0].projects) {
                        alert('【エラー】\nこのファイルは古い形式のデータです。\n新しい「全データ同期」用のファイル（入力データ_～.json）を選択してください。');
                        e.target.value = '';
                        return;
                    }
                    if(typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length > 0) {
                         /* バックアップ作成 */                        const backup = {
                            projects: projects,                            appRecords: JSON.parse(localStorage.getItem('appRecords')||'[]')                        }
;
                        try {
 localStorage.setItem('projects_backup', JSON.stringify(backup));
 }
 catch(e) {
 console.warn('Backup skip', e);
 }
                                                /* データ形式の判別 (v1: projects直下, v2: {
projects, appRecords}
) */                        if (data.type === 'full_sync_v2') {
                            projects = data.projects;
                            try {
 localStorage.setItem('appRecords', JSON.stringify(data.appRecords || []));
 }
 catch(e) {
 localStorage.removeItem('projects_backup');
 localStorage.setItem('appRecords', JSON.stringify(data.appRecords || []));
 }
                        }
 else {
                            projects = data;
 /* 互換性のため古いエクスポートも読めるように */                            /* appRecordsは上書きしない */                        }
                        Object.values(projects).forEach(p => {
                             if (p.name === 'デフォルト工事' && p.master && !p.master._isStandard) {
                                 p.master = JSON.parse(JSON.stringify(defMaster));
                             }
                             migrateMasterData(p.master);
                         }
);
                         currentPId = Object.keys(projects)[0];
                         try {
 saveData();
 }
 catch(e) {
 localStorage.removeItem('projects_backup');
 saveData();
 }
 initApp();
 renderSavedRecords();
                        checkBackupExists();
                        closeModal();
                        alert('データを読み込みました。');
                     }
 else {
                        alert('ファイルの中身が正しいデータ形式ではありませんでした。');
                    }
                }
 catch(err) {
                     alert('読み込みエラー: ' + err.message);
 console.error(err);
                 }
                 e.target.value = '';
             }
;
             reader.readAsText(file);
         }
        function undoImportProjects() {
            const backupStr = localStorage.getItem('projects_backup');
            if (!backupStr) return;
            if (confirm("本当に読み込み直前の状態（上書きされる前のデータ）に復元しますか？\n\n※現在表示されているデータは消去されます。")) {
                try {
                    const backupData = JSON.parse(backupStr);
                    /* バックアップデータが新しい形式か古い形式か判別 */                    if (backupData.projects && backupData.appRecords) {
                        projects = backupData.projects;
                        localStorage.setItem('appRecords', JSON.stringify(backupData.appRecords));
                    }
 else {
                        projects = backupData;
 /* 古い形式からの復元 */                    }
                                        currentPId = Object.keys(projects)[0];
                     saveData();
                    initApp();
                    renderSavedRecords();
                    localStorage.removeItem('projects_backup');
                    checkBackupExists();
                    closeModal();
                    alert("直前の状態に復元しました。");
                }
 catch(e) {
                    alert("復元に失敗しました。");
                }
            }
        }
        function checkBackupExists() {
            const btn = document.getElementById('undoImportBtn');
            if (!btn) return;
            if (localStorage.getItem('projects_backup')) {
                btn.style.display = 'block';
            }
 else {
                btn.style.display = 'none';
            }
        }
        function reindexCells() {
            const tbody = $('tableBody');
            Array.from(tbody.children).forEach((tr, rIdx) => {
                const rowNum = rIdx + 1;
                Array.from(tr.children).forEach((td, cIdx) => {
                    td.dataset.r = rIdx;
 td.dataset.c = cIdx;
                    if (cIdx === 0 && td.classList.contains('row-num-cell')) {
 td.dataset.rowNum = (rowNum % 10 === 0) ? rowNum : "";
 }
                }
);
            }
);
        }
        let tapT=null, pressT=null, isLP=false;
        function bindCell(cell, type, tr) {
            cell.onclick = (e) => {

                if(isLP || currentMode === 'select') return;

                
                if (tr && tr.classList.contains('buzai-locked') && parseInt(cell.dataset.c) > 0) {

                    if (['pencil', 'eraser', 'paste', 'stamp'].includes(currentMode)) {
 alert('この部材はロックされているため編集できません。');
 return;
 }

                }
                 if (currentMode === 'pencil') {
                    if(!tapT) tapT = setTimeout(() => {
 tapT=null;
 if(type==='lot') openLot(cell);
 else openInput(cell, type);
 }
, 250);
                    else {
                        clearTimeout(tapT);
 tapT=null;
 saveHistory();
                         if(type==='lot'){
 Object.assign(cell.dataset, {
setsu:'',kigou:'',suu:''}
);
 setCellColorClass(cell, 'black');
 updLot(cell);
 updateEdabanVisibility();
 }
                         else {
 renderCellContent(cell, {
 t: '', c: 'black', db: cell.classList.contains('cell-double-border'), defects: [] }
);
 calcKensasuSum();
 }
                     }
                }
                 else if (currentMode === 'eraser') {
                    saveHistory();
                    if(type==='lot'){
 Object.assign(cell.dataset, {
setsu:'',kigou:'',suu:''}
);
 setCellColorClass(cell, 'black');
 updLot(cell);
 updateEdabanVisibility();
 }
                     else {
 renderCellContent(cell, {
 t: '', c: 'black', db: cell.classList.contains('cell-double-border'), defects: [] }
);
 calcKensasuSum();
 }
                 }
                else if (currentMode === 'paste') {
                    if(!clipboardData || clipboardData.length === 0) return;
                    const baseR = parseInt(cell.dataset.r), baseC = parseInt(cell.dataset.c);
                    let overlap = false;
                    for (const data of clipboardData) {
                        const targetTd = document.querySelector(`#tableBody td[data-r="${
baseR + data.dr}
"][data-c="${
baseC + data.dc}
"]`);
                        if (targetTd && targetTd.querySelector('.main-text') && targetTd.querySelector('.main-text').textContent.trim() !== '') {
 overlap = true;
 break;
 }
                    }
                    if (overlap) {
 alert('貼り付ける範囲に既にデータが入力されているため、貼り付けできません。');
 return;
 }
                    if (confirm('この位置に貼り付けますか？')) {
                        saveHistory();
                        clipboardData.forEach(data => {
                            const targetTd = document.querySelector(`#tableBody td[data-r="${
baseR + data.dr}
"][data-c="${
baseC + data.dc}
"]`);
                            if(targetTd) {
 renderCellContent(targetTd, {
 t: data.text, c: data.color, db: targetTd.classList.contains('cell-double-border'), defects: data.defects }
);
 }
                        }
);
                        calcKensasuSum();
                    }
                }
            }
;
            const start = (e) => {

                if(e.type==='mousedown'&&e.button!==0)return;

                isLP = false;

                if(currentMode === 'pencil') {

                    pressT = setTimeout(()=>{
 if(cell.classList.contains('row-num-cell')) return;
 if(tr) {

                            let handled = false;

                            const cIdx = parseInt(cell.dataset.c);

                            if (cIdx > 0) {

                                const lotIdx = Math.floor((cIdx - 1) / 6);

                                const h1 = headerRow1;

                                if (h1 && h1.children[lotIdx + 1]) {

                                    const blocks = h1.children[lotIdx + 1].querySelectorAll('.lot-cell');

                                    let hasSuminiku = false;

                                    blocks.forEach(b => {
 if(isSuminikuKigou(b.dataset.kigou)) hasSuminiku = true;
 }
);

                                    const isKensasu = ((cIdx - 1) % 6 === 5);

                                    if (hasSuminiku && isKensasu) {

                                        if (tr && tr.classList.contains('buzai-locked')) {
 alert('この部材はロックされているため編集できません。');
 handled = true;

                                        }
 else {

                                            targetTr = tr;
 targetCellForMenu = cell;

                                            isLP = true;
 if(navigator.vibrate) navigator.vibrate(50);

                                            openDefectModal('Suminiku');

                                            handled = true;

                                        }

                                    }

                                }

                            }

                            if (!handled) openActionMenu(tr, cell);
                        }
                        isLP=true;
 if(navigator.vibrate) navigator.vibrate(50);
                     }
, 600);
                 }
            }
;
            const end = () => {
 if(pressT) clearTimeout(pressT);
 }
;
            ['mousedown','touchstart'].forEach(ev => cell.addEventListener(ev, start, {
passive:true}
));
            ['mouseup','mouseleave','touchend','touchcancel'].forEach(ev => cell.addEventListener(ev, end));
        }
        let lotSortable = null;
        function initSortable() {
            if(lotSortable) lotSortable.destroy();
 const h1 = $('headerRow1');
            lotSortable = new Sortable(h1, {
 animation: 150, filter: '.not-draggable', preventOnFilter: false, delay: 300, fallbackTolerance: 5, ghostClass: 'opacity-50', onEnd: function (evt) {
 const oldIndex = evt.oldIndex - 1;
 const newIndex = evt.newIndex - 1;
 if (oldIndex !== newIndex && oldIndex >= 0 && newIndex >= 0) {
 saveHistory();
 reorderLotColumns(oldIndex, newIndex);
 reindexCells();
 }
 }
 }
);
        }
        function reorderLotColumns(oldIndex, newIndex) {
            const offset = 1, cols = 6;
 const h2 = $('headerRow2'), h2Cells = Array.from(h2.children);
            const moveH2 = h2Cells.splice(offset + oldIndex * cols, cols);
 h2Cells.splice(offset + newIndex * cols, 0, ...moveH2);
 h2Cells.forEach(c => h2.appendChild(c));
            const tbody = $('tableBody');
            Array.from(tbody.children).forEach(tr => {
 const tds = Array.from(tr.children), moveTds = tds.splice(offset + oldIndex * cols, cols);
 tds.splice(offset + newIndex * cols, 0, ...moveTds);
 tds.forEach(td => tr.appendChild(td));
 }
);
            calcKensasuSum();
 updateStickyTop();
        }
        let isSelecting = false, isDraggingSelection = false;
 let selStart = null, selEnd = null, dropTargetCell = null;
 const tbodyEl = $('tableBody');
        function getCellFromEvent(e) {
 let cx = e.clientX, cy = e.clientY;
 if(e.touches && e.touches.length > 0) {
 cx = e.touches[0].clientX;
 cy = e.touches[0].clientY;
 }
 else if (e.changedTouches && e.changedTouches.length > 0) {
 cx = e.changedTouches[0].clientX;
 cy = e.changedTouches[0].clientY;
 }
 const el = document.elementFromPoint(cx, cy);
 if(el && el.tagName === 'TD' && el.dataset.r !== undefined) return el;
 return null;
 }
        let isDraggingComponent = false;
 let draggingComponentStartR = -1;
 let draggingComponentEndR = -1;
 let componentDropTargetR = -1;

        
        function executeBuzaiMove(startR, endR, dropR) {

            const tbody = $('tableBody');

            const trs = Array.from(tbody.children);

            const movingNodes = trs.slice(startR, endR + 1);

            let refNode = trs[dropR] || null;

            movingNodes.forEach(node => tbody.insertBefore(node, refNode));

            
            const newTrs = Array.from(tbody.children);

            const newStartR = newTrs.indexOf(movingNodes[0]);

            if (newStartR > 0) newTrs[newStartR - 1].classList.add('row-thick-border');

            const newEndR = newTrs.indexOf(movingNodes[movingNodes.length - 1]);

            if (newEndR >= 0) newTrs[newEndR].classList.add('row-thick-border');

            
            reindexCells();
 syncActiveSheetToModel();
 updateEdabanVisibility();

        }


        function handlePointerDown(e) {

            const cell = e.target.closest('td');
 if(!cell) return;

            if (cell.classList.contains('row-num-cell')) {

                const tr = cell.parentElement;

                if (tr.classList.contains('buzai-locked')) {

                    const r = Array.from($('tableBody').children).indexOf(tr);

                    const bounds = getBuzaiStartEnd(r);

                    isDraggingComponent = true;

                    draggingComponentStartR = bounds.start;

                    draggingComponentEndR = bounds.end;

                    const trs = $('tableBody').children;

                    for(let i=bounds.start;
 i<=bounds.end;
 i++) trs[i].style.opacity = '0.5';

                    return;

                }

            }

            if(currentMode !== 'select') return;

            if(cell.dataset.r === undefined) return;
 if(cell.classList.contains('selected-cell')) {
 isDraggingSelection = true;
 dropTargetCell = cell;
 }
 else {
 clearSelection();
 isSelecting = true;
 selStart = {
 r: parseInt(cell.dataset.r), c: parseInt(cell.dataset.c) }
;
 selEnd = selStart;
 updateSelection();
 }
 }
        function handlePointerMove(e) {
 
            if (isDraggingComponent) {

                if (e.cancelable) e.preventDefault();

                const touch = e.touches ? e.touches[0] : e;

                const targetCell = getCellFromEvent(e);

                document.querySelectorAll('.buzai-drop-line, .buzai-drop-line-bottom').forEach(el => el.classList.remove('buzai-drop-line', 'buzai-drop-line-bottom'));

                if (targetCell) {

                    const touch = e.touches ? e.touches[0] : e;

                    const trs = Array.from($('tableBody').children);

                    const validDrops = [];

                    let idx = 0;

                    while (idx < trs.length) {

                        const b = getBuzaiStartEnd(idx);

                        validDrops.push(b.start);

                        idx = b.end + 1;

                    }

                    const lastB = getBuzaiStartEnd(trs.length - 1);

                    let lastDataR = lastB.start - 1;

                    for (let r = lastB.start;
 r <= lastB.end;
 r++) {

                        let hasD = false;

                        for (let c = 0;
 c < trs[r].children.length;
 c++) {

                            const td = trs[r].children[c];

                            if (td.querySelector('.main-text') && td.querySelector('.main-text').textContent.trim() !== '') {
 hasD = true;
 break;
 }

                        }

                        if (hasD) lastDataR = r;

                    }

                    if (lastDataR >= lastB.start && lastDataR < lastB.end) validDrops.push(lastDataR + 1);

                    else if (lastDataR === lastB.end) validDrops.push(lastB.end + 1);


                    const uniqueDrops = [...new Set(validDrops)].sort((a,b)=>a-b);

                    let bestDrop = -1;

                    let minDist = Infinity;

                    const cY = touch.clientY;

                    for (let dr of uniqueDrops) {

                        let y;

                        if (dr < trs.length) y = trs[dr].getBoundingClientRect().top;

                        else y = trs[trs.length - 1].getBoundingClientRect().bottom;

                        const dist = Math.abs(cY - y);

                        if (dist < minDist) {
 minDist = dist;
 bestDrop = dr;
 }

                    }

                    
                    let dropPosR = bestDrop;

                    if (dropPosR >= draggingComponentStartR && dropPosR <= draggingComponentEndR + 1) {

                        componentDropTargetR = -1;

                    }
 else {

                        componentDropTargetR = dropPosR;

                        if (dropPosR < trs.length) trs[dropPosR].classList.add('buzai-drop-line');

                        else trs[trs.length-1].classList.add('buzai-drop-line-bottom');

                    }

                }

                return;

            }

            if(currentMode !== 'select') return;
 if(!isSelecting && !isDraggingSelection) return;
 if (e.cancelable) e.preventDefault();
 const cell = getCellFromEvent(e);
 if(!cell) return;
 if(isSelecting) {
 selEnd = {
 r: parseInt(cell.dataset.r), c: parseInt(cell.dataset.c) }
;
 updateSelection();
 }
 else if (isDraggingSelection) {
 document.querySelectorAll('.drop-target').forEach(c => c.classList.remove('drop-target'));
 dropTargetCell = cell;
 cell.classList.add('drop-target');
 }
 }
        function handlePointerUp(e) {
 
            if (isDraggingComponent) {

                isDraggingComponent = false;

                const trs = Array.from($('tableBody').children);

                for(let i=draggingComponentStartR;
 i<=draggingComponentEndR;
 i++) {
 if(trs[i]) trs[i].style.opacity = '';
 }

                document.querySelectorAll('.buzai-drop-line, .buzai-drop-line-bottom').forEach(el => el.classList.remove('buzai-drop-line', 'buzai-drop-line-bottom'));

                if (componentDropTargetR !== -1) {

                    saveHistory();

                    executeBuzaiMove(draggingComponentStartR, draggingComponentEndR, componentDropTargetR);

                }

                draggingComponentStartR = -1;
 draggingComponentEndR = -1;
 componentDropTargetR = -1;

                return;

            }

            if(currentMode !== 'select') return;
 if(isSelecting) {
 isSelecting = false;
 }
 else if (isDraggingSelection) {
 isDraggingSelection = false;
 document.querySelectorAll('.drop-target').forEach(c => c.classList.remove('drop-target'));
 if(dropTargetCell) executeMove(dropTargetCell);
 }
 }
        tbodyEl.addEventListener('mousedown', handlePointerDown);
 tbodyEl.addEventListener('touchstart', handlePointerDown, {
passive: false}
);
 document.addEventListener('mousemove', handlePointerMove);
 document.addEventListener('touchmove', handlePointerMove, {
passive: false}
);
 document.addEventListener('mouseup', handlePointerUp);
 document.addEventListener('touchend', handlePointerUp);
        function updateSelection() {
 if(!selStart || !selEnd) return;
 const minR = Math.min(selStart.r, selEnd.r), maxR = Math.max(selStart.r, selEnd.r);
 const minC = Math.min(selStart.c, selEnd.c), maxC = Math.max(selStart.c, selEnd.c);
 document.querySelectorAll('#tableBody td').forEach(td => {
 const r = parseInt(td.dataset.r), c = parseInt(td.dataset.c);
 if(r >= minR && r <= maxR && c >= minC && c <= maxC) td.classList.add('selected-cell');
 else td.classList.remove('selected-cell');
 }
);
 $('selectionActions').classList.toggle('hidden', document.querySelectorAll('.selected-cell').length === 0);
 }
        function clearSelection() {
 document.querySelectorAll('.selected-cell, .drop-target').forEach(td => td.classList.remove('selected-cell', 'drop-target'));
 selStart = null;
 selEnd = null;
 $('selectionActions').classList.add('hidden');
 }
        function deleteSelected() {
 saveHistory();
 document.querySelectorAll('.selected-cell').forEach(td => {
 renderCellContent(td, {
 t: '', c: 'black', db: td.classList.contains('cell-double-border'), defects: [] }
);
 }
);
 clearSelection();
 calcKensasuSum();
 }
        function executeMove(targetCell) {
            const targetR = parseInt(targetCell.dataset.r), targetC = parseInt(targetCell.dataset.c);
 const minR = Math.min(selStart.r, selEnd.r), minC = Math.min(selStart.c, selEnd.c);
 const diffR = targetR - minR, diffC = targetC - minC;
 if(diffR === 0 && diffC === 0) {
 clearSelection();
 return;
 }
            let overlap = false;
 const selectedCells = Array.from(document.querySelectorAll('.selected-cell'));
            for (const td of selectedCells) {
 const dr = parseInt(td.dataset.r) + diffR;
 const dc = parseInt(td.dataset.c) + diffC;
 const newTd = document.querySelector(`#tableBody td[data-r="${
dr}
"][data-c="${
dc}
"]`);
 if (newTd && !newTd.classList.contains('selected-cell') && newTd.querySelector('.main-text') && newTd.querySelector('.main-text').textContent.trim() !== '') {
 overlap = true;
 break;
 }
 }
            if (overlap) {
 alert('移動先に既にデータが入力されているため、移動できません。');
 clearSelection();
 return;
 }
            if (!confirm('この位置に移動しますか？')) {
 clearSelection();
 return;
 }
            saveHistory();
 const dataToMove = [];
            document.querySelectorAll('.selected-cell').forEach(td => {
 dataToMove.push({
 r: parseInt(td.dataset.r), c: parseInt(td.dataset.c), text: td.querySelector('.main-text')?td.querySelector('.main-text').textContent:'', color: td.dataset.color || 'black', defects: td.dataset.defects?JSON.parse(td.dataset.defects):[] }
);
 renderCellContent(td, {
 t: '', c: 'black', db: td.classList.contains('cell-double-border'), defects: [] }
);
 }
);
            dataToMove.forEach(data => {
 const newTd = document.querySelector(`#tableBody td[data-r="${
data.r + diffR}
"][data-c="${
data.c + diffC}
"]`);
 if(newTd) {
 renderCellContent(newTd, {
 t: data.text, c: data.color, db: newTd.classList.contains('cell-double-border'), defects: data.defects }
);
 }
 }
);
 clearSelection();
 calcKensasuSum();
        }
        let stickyNoteIdCounter = 0;
        function addStickyNote(data = null) {
            if(!data) saveHistory();
             const id = data ? data.id : `note_${
Date.now()}
_${
stickyNoteIdCounter++}
`;
 const scrollArea = $('tableScrollArea');
 const wrapper = $('tableWrapper');
            const x = data ? data.x : scrollArea.scrollLeft + 50;
 const y = data ? data.y : scrollArea.scrollTop + 50;
 const text = data ? data.text : '';
 const w = data && data.w ? data.w : 150;
 const h = data && data.h ? data.h : 120;
            const note = el('div', `sticky-note absolute shadow-md border border-yellow-300 rounded flex flex-col bg-yellow-100`, {
 id: id }
);
 note.style.left = x + 'px';
 note.style.top = y + 'px';
 note.style.width = w + 'px';
 note.style.height = h + 'px';
 note.style.minWidth = '100px';
 note.style.minHeight = '100px';
 note.style.zIndex = '50';
            const handle = el('div', 'drag-handle bg-yellow-200 h-6 cursor-move flex justify-between items-center px-2 border-b border-yellow-300');
 handle.innerHTML = `<span class="text-[10px] text-yellow-600 font-bold">付箋</span><button onclick="this.closest('.sticky-note').remove();
 saveHistory();
" class="text-red-600 hover:bg-red-200 px-1 rounded font-bold">&times;
</button>`;
            const ta = el('textarea', 'flex-1 w-full bg-transparent outline-none text-sm text-gray-800 p-2');
 ta.value = text;
 ta.onchange = () => saveHistory();
 ta.addEventListener('mouseup', () => {
 saveHistory();
 }
);
             note.appendChild(handle);
 note.appendChild(ta);
 wrapper.appendChild(note);
            let isDragging = false, startX, startY, initL, initT;
            const startDrag = (e) => {
 if(e.target.tagName === 'BUTTON') return;
 isDragging = true;
 let cX = e.clientX, cY = e.clientY;
 if(e.touches) {
 cX = e.touches[0].clientX;
 cY = e.touches[0].clientY;
 }
 startX = cX;
 startY = cY;
 initL = parseInt(note.style.left || 0);
 initT = parseInt(note.style.top || 0);
 e.preventDefault();
 }
;
            const moveDrag = (e) => {
 if(!isDragging) return;
 let cX = e.clientX, cY = e.clientY;
 if(e.touches) {
 cX = e.touches[0].clientX;
 cY = e.touches[0].clientY;
 }
 note.style.left = (initL + (cX - startX)) + 'px';
 note.style.top = (initT + (cY - startY)) + 'px';
 }
;
            const endDrag = (e) => {
 if(isDragging) {
 isDragging = false;
 saveHistory();
 }
 }
;
            handle.addEventListener('mousedown', startDrag);
 handle.addEventListener('touchstart', startDrag, {
passive: false}
);
 document.addEventListener('mousemove', moveDrag);
 document.addEventListener('touchmove', moveDrag, {
passive: false}
);
 document.addEventListener('mouseup', endDrag);
 document.addEventListener('touchend', endDrag);
        }
        function renderNotes(notesArray) {
 document.querySelectorAll('.sticky-note').forEach(n => n.remove());
 if (notesArray && notesArray.length > 0) {
 notesArray.forEach(noteData => addStickyNote(noteData));
 }
 }
        function createLotBlock() {
            const wrapper = el('div', 'lot-block-wrapper flex items-stretch justify-between gap-1 w-full');
            const lDiv = el('div', 'bg-white border rounded-lg p-2 lot-cell touch-cell flex-1 min-w-[80px]', {
 html: `<div class="text-[10px] text-gray-400 placeholder-text">タップ設定</div><div class="font-bold text-sm md:text-base hidden lot-display truncate leading-tight"></div>` }
);
 Object.assign(lDiv.dataset, {
setsu:'', kigou:'', suu:'', color:'black'}
);
 bindCell(lDiv, 'lot');
             const sumDiv = el('div', 'kensasu-sum border-2 border-gray-800 bg-white font-bold text-base px-1.5 flex items-center justify-center shrink-0 min-w-[32px]', {
html: '<span class="kensasu-sum-display">0</span>'}
);
            wrapper.appendChild(lDiv);
 wrapper.appendChild(sumDiv);
 return wrapper;
        }
        function updateEdabanVisibility() {
            const h1 = $('headerRow1');
 if(!h1) return;
 const ths = Array.from(h1.children).slice(1);
            const s = sheets.find(sh => sh.id === activeSheetId);
            if (!s.lotBikou) s.lotBikou = [];
                        ths.forEach((th, c) => {
                const blocks = th.querySelectorAll('.lot-cell');
 let hasUT = false;
 let hasSuminiku = false;
 blocks.forEach(b => {
 if (isUtKigou(b.dataset.kigou)) hasUT = true;
 if (isSuminikuKigou(b.dataset.kigou)) hasSuminiku = true;
 }
);
                const headerCells = $('headerRow2').children;
                const showBikou = !!s.lotBikou[c];
                                for(let idx=0;
 idx<6;
 idx++) {
                    const headerTh = headerCells[1 + c * 6 + idx];
                     if (headerTh) {
                         if (idx === 3 && !hasUT) {
 headerTh.classList.add('hidden-col');
 headerTh.classList.remove('suminiku-disabled');
 }
                        else if (idx === 4 && !showBikou) {
 headerTh.classList.add('hidden-col');
 headerTh.classList.remove('suminiku-disabled');
 }
                        else if (hasSuminiku && idx < 5) {
 headerTh.classList.remove('hidden-col');
 headerTh.classList.add('suminiku-disabled');
 }
                        else {
 headerTh.classList.remove('hidden-col');
 headerTh.classList.remove('suminiku-disabled');
 }
                    }
                }
                Array.from($('tableBody').children).forEach(tr => {
                     for(let idx=0;
 idx<6;
 idx++) {
                        const td = tr.children[1 + c * 6 + idx];
                         if (td) {
                             if (idx === 3 && !hasUT) {
 td.classList.add('hidden-col');
 td.classList.remove('suminiku-disabled');
 }
                            else if (idx === 4 && !showBikou) {
 td.classList.add('hidden-col');
 td.classList.remove('suminiku-disabled');
 }
                            else if (hasSuminiku && idx < 5) {
 td.classList.remove('hidden-col');
 td.classList.add('suminiku-disabled');
 }
                            else {
 td.classList.remove('hidden-col');
 td.classList.remove('suminiku-disabled');
 }
                        }
                     }
                }
);
                let colSpanLen = 6;
                if (!hasUT) colSpanLen--;
                if (!showBikou) colSpanLen--;
                th.colSpan = colSpanLen;
            }
);
        }
        function renderHeaders() {
            const h1 = $('headerRow1'), h2 = $('headerRow2');
            const sheetInfoTh = el('th', 'border border-gray-300 p-1 sticky-top sticky-left min-w-[120px] bg-gray-100 not-draggable cursor-pointer hover:bg-gray-200 transition z-[45]', {
 onclick: openSheetInfoModal, style: 'cursor: pointer;
' }
);
            sheetInfoTh.innerHTML = `<div class="text-[10px] text-gray-500 mb-0.5">シート情報</div><div id="sheetInfoDisplay" class="font-bold text-xs text-gray-400 whitespace-pre-wrap leading-tight">未設定</div>`;
            h1.innerHTML = '';
 h1.appendChild(sheetInfoTh);
 h2.innerHTML = '<th class="border border-gray-300 p-2 sticky-top-2 sticky-left text-xs bg-gray-50 header-num-space min-w-[60px]">部材番号</th>';
            for(let i=0;
 i<lotCount;
 i++) {
                const th = el('th', 'border border-gray-300 p-2 sticky-top bg-blue-50 border-divider transition-all duration-200', {
colSpan: 6}
);
                const container = el('div', 'lot-blocks-container flex-1 flex flex-col gap-1 justify-center w-full transition-all duration-200');
                container.appendChild(createLotBlock());
 th.appendChild(container);
 h1.appendChild(th);
                lotFieldLabels.forEach((n, idx) => {
                    let wClass = 'min-w-[50px] p-2';
 if (idx === 3 || idx === 4 || idx === 5) wClass = 'w-[28px] min-w-[28px] max-w-[28px] px-0.5 py-1 text-[10px] whitespace-nowrap overflow-hidden';
                    h2.appendChild(el('th', `border border-gray-300 sticky-top-2 text-xs bg-gray-50 ${
wClass}
 ${
idx===0?'border-divider':''}
`, {
text: n}
));
                }
);
            }
            initSortable();
 updateSheetInfoDisplay();
 updateStickyTop();
 setTimeout(updateEdabanVisibility, 10);
        }
        function calcKensasuSum() {
            const tbody = $('tableBody'), h1 = $('headerRow1');
 const ths = Array.from(h1.children).slice(1);
 const lotSums = ths.map(() => [0]);
            Array.from(tbody.children).forEach(tr => {
                ths.forEach((_, c) => {
                    const sums = lotSums[c];
 const blockIndex = sums.length - 1;
 const tdKensasu = tr.children[1 + c * 6 + 5];
                    if (tdKensasu && tdKensasu.querySelector('.main-text')) {
                        const match = tdKensasu.querySelector('.main-text').textContent.match(/-?\d+/);
 if (match) {
 const val = parseInt(match[0], 10);
 if (!isNaN(val)) sums[blockIndex] += val;
 }
                    }
                    const tdAny = tr.children[1 + c * 6];
 if (tdAny && tdAny.classList.contains('cell-double-border')) sums.push(0);
                }
);
            }
);
            ths.forEach((th, c) => {
 const sums = lotSums[c];
 const sumDisplays = th.querySelectorAll('.kensasu-sum-display');
 sumDisplays.forEach((disp, i) => {
 disp.textContent = sums[i] !== undefined ? sums[i] : 0;
 }
);
 }
);
        }
        function createRowElement() {
            const tr = el('tr');
            const td = el('td', 'border border-gray-200 sticky-left touch-cell text-lg row-num-cell');
 bindCell(td, 'buzai', tr);
 renderCellContent(td, {
t:'', c:'black'}
);
 tr.appendChild(td);
            for(let i=0;
 i<lotCount;
 i++) {
                lotFieldTypes.forEach((t, idx) => {
                    let wClass = 'min-w-[50px] text-lg';
 if (idx === 3 || idx === 4 || idx === 5) wClass = 'w-[28px] min-w-[28px] max-w-[28px] px-0.5 text-sm overflow-hidden';
                    const c = el('td', `border border-gray-200 touch-cell ${
wClass}
 ${
idx===0?'border-divider':''}
`);
 bindCell(c, t, tr);
 renderCellContent(c, {
t:'', c:'black'}
);
 tr.appendChild(c);
                }
);
            }
            return tr;
        }
        function addRow(isInit=false) {
 if(!isInit) saveHistory();
 $('tableBody').appendChild(createRowElement());
 if(!isInit) {
 rowCount++;
 reindexCells();
 updateEdabanVisibility();
 }
 }
        function addRows(num) {
 saveHistory();
 const fragment = document.createDocumentFragment();
 for(let i=0;
 i<num;
 i++) {
 fragment.appendChild(createRowElement());
 rowCount++;
 }
 $('tableBody').appendChild(fragment);
 reindexCells();
 updateEdabanVisibility();
 }
        function addLotColumn() {
             saveHistory();
 lotCount++;
 const h1 = $('headerRow1'), h2 = $('headerRow2');
            const th = el('th', 'border border-gray-300 p-2 sticky-top bg-blue-50 border-divider transition-all duration-200', {
colSpan: 6}
);
            const container = el('div', 'lot-blocks-container flex-1 flex flex-col gap-1 justify-center w-full transition-all duration-200');
 container.appendChild(createLotBlock());
 th.appendChild(container);
 h1.appendChild(th);
            lotFieldLabels.forEach((n, idx) => {
 let wClass = 'min-w-[50px] p-2';
 if (idx === 3 || idx === 4 || idx === 5) wClass = 'w-[28px] min-w-[28px] max-w-[28px] px-0.5 py-1 text-[10px] whitespace-nowrap overflow-hidden';
 h2.appendChild(el('th', `border border-gray-300 sticky-top-2 text-xs bg-gray-50 ${
wClass}
 ${
idx===0?'border-divider':''}
`, {
text: n}
));
 }
);
            const tbody = $('tableBody');
            Array.from(tbody.children).forEach(tr => {
 lotFieldTypes.forEach((t, idx) => {
 let wClass = 'min-w-[50px] text-lg';
 if (idx === 3 || idx === 4 || idx === 5) wClass = 'w-[28px] min-w-[28px] max-w-[28px] px-0.5 text-sm overflow-hidden';
 const c = el('td', `border border-gray-200 touch-cell font-bold ${
wClass}
 ${
idx===0?'border-divider':''}
`);
 bindCell(c, t, tr);
 renderCellContent(c, {
t:'', c:'black'}
);
 tr.appendChild(c);
 }
);
 }
);
            initSortable();
 reindexCells();
 calcKensasuSum();
 updateEdabanVisibility();
 updateStickyTop();
        }
        function openModal(id, initFn) {
 $('modalOverlay').classList.remove('hidden');
 $('modalOverlay').classList.add('flex');
 document.querySelectorAll('.modal-content').forEach(m => m.classList.add('hidden'));
 $(id).classList.remove('hidden');
 $(id).classList.add('flex');
 if(id === 'projectModal') renderProjectList();
 if(initFn) initFn();
 }
        function closeModal() {
 $('modalOverlay').classList.add('hidden');
 $('modalOverlay').classList.remove('flex');
 targetCell = null;
 targetTr = null;
 targetCellForMenu = null;
 }
        let targetTr = null;
 let targetCellForMenu = null;
                function openActionMenu(tr, cell) {
            targetTr = tr;
 targetCellForMenu = cell;
 const isLocked = tr.classList.contains('buzai-locked');
 $('toggleLockBtn').textContent = isLocked ? '🔓 この部材のロックを解除' : '🔒 この部材をロック';
            $('toggleBorderBtn').textContent = tr.classList.contains('row-thick-border') ? 'この行の太線を消す' : 'この行の下に太線を引く';
                        const splitBtn = $('splitLotBtn');
            const defectBtn = $('defectRecordBtn');
                        if (cell && parseInt(cell.dataset.c) > 0) {
                splitBtn.classList.remove('hidden');
                splitBtn.textContent = cell.classList.contains('cell-double-border') ? 'ロットの区切りを解除する' : 'ここでロットを区切る';
                                const cIdx = parseInt(cell.dataset.c);
                const isBui = ((cIdx - 1) % 6 === 2);
                if (isBui) {
 defectBtn.classList.remove('hidden');
 }
 else {
 defectBtn.classList.add('hidden');
 }
            }
 else {
 splitBtn.classList.add('hidden');
 defectBtn.classList.add('hidden');
 }
                        const selAdd = $('addRowCount');
 if (selAdd.options.length === 0) {
 for (let i = 1;
 i <= 20;
 i++) selAdd.appendChild(el('option', '', {
value: i, text: i}
));
 }
 selAdd.value = 1;
            const selDel = $('deleteRowCount');
 if (selDel.options.length === 0) {
 for (let i = 1;
 i <= 20;
 i++) selDel.appendChild(el('option', '', {
value: i, text: i}
));
 }
 selDel.value = 1;
            openModal('actionMenuModal');
        }
                function getBuzaiStartEnd(r) {

            const trs = Array.from($('tableBody').children);

            let startR = 0;

            for (let i = r - 1;
 i >= 0;
 i--) {
 if (trs[i].classList.contains('row-thick-border')) {
 startR = i + 1;
 break;
 }
 }

            let endR = trs.length - 1;

            for (let i = r;
 i < trs.length;
 i++) {
 if (trs[i].classList.contains('row-thick-border')) {
 endR = i;
 break;
 }
 }

            return {
 start: startR, end: endR }
;

        }

        function toggleBuzaiLock() {

            if (!targetTr) return;

            saveHistory();

            const r = Array.from($('tableBody').children).indexOf(targetTr);

            const bounds = getBuzaiStartEnd(r);

            const trs = Array.from($('tableBody').children);

            const isLocked = trs[bounds.start].classList.contains('buzai-locked');

            for (let i = bounds.start;
 i <= bounds.end;
 i++) {

                if (isLocked) trs[i].classList.remove('buzai-locked');

                else trs[i].classList.add('buzai-locked');

            }

            syncActiveSheetToModel();

            closeModal();

        }

        function toggleRowBorder() {
 if (targetTr && targetTr.classList.contains('buzai-locked')) {
 alert('この部材はロックされているため太線の追加・削除はできません。');
 return;
 }
 saveHistory();
 if (targetTr) targetTr.classList.toggle('row-thick-border');
 closeModal();
 }
                function splitLotAtTarget() {
            if (!targetCellForMenu || !targetTr) return;
 let currentTarget = targetTr;
 const rowsToDelete = [];
 for (let i = 0;
 i < count;
 i++) {
 if (currentTarget) {
 rowsToDelete.push(currentTarget);
 currentTarget = currentTarget.nextElementSibling;
 }
 else break;
 }

            if (rowsToDelete.some(tr => tr.classList.contains('buzai-locked'))) {
 alert('削除対象の行にロックされた部材が含まれているため、削除できません。');
 return;
 }


            if (rowsToDelete.length === 0) return;
 let hasData = false;
            for (const tr of rowsToDelete) {
 for (const td of tr.querySelectorAll('td')) {
 if (td.querySelector('.main-text') && td.querySelector('.main-text').textContent.trim() !== '') {
 hasData = true;
 break;
 }
 }
 if (hasData) break;
 }
            if (hasData && !confirm(`消去予定の行にデータが入力されています。\n本当に ${
rowsToDelete.length}
 行を消去してもよろしいですか？`)) return;
 saveHistory();
            let hasThickBorder = false;
 let doubleBorders = {
}
;
            rowsToDelete.forEach(tr => {
 if(tr.classList.contains('row-thick-border')) hasThickBorder = true;
 Array.from(tr.children).forEach((td, idx) => {
 if (td.classList.contains('cell-double-border')) doubleBorders[idx] = true;
 }
);
 }
);
            const prevTr = rowsToDelete[0].previousElementSibling;
 for (const tr of rowsToDelete) tr.remove();
 rowCount -= rowsToDelete.length;
 if (rowCount <= 0) addRow(true);
            if (prevTr) {
 if (hasThickBorder) prevTr.classList.add('row-thick-border');
 Object.keys(doubleBorders).forEach(idx => {
 if (prevTr.children[idx]) prevTr.children[idx].classList.add('cell-double-border');
 }
);
 }
            reindexCells();
 for(let c=0;
 c<lotCount;
 c++) syncLotHeaderCount(c);
 calcKensasuSum();
 updateEdabanVisibility();
 closeModal();
        }
        /* ================= 欠陥記録の管理 ================= */        function getInheritedValue(rowIdx, colIdx, isDataModel = false, dataRows = null) {
            if (isDataModel) {
                for (let i = rowIdx;
 i >= 0;
 i--) {
                    if (dataRows[i] && dataRows[i][colIdx] && dataRows[i][colIdx].t && dataRows[i][colIdx].t.trim() !== '') {
                        return dataRows[i][colIdx].t.trim();
                    }
                }
            }
 else {
                const tbody = document.getElementById('tableBody');
                for (let i = rowIdx;
 i >= 0;
 i--) {
                    if (tbody.children[i] && tbody.children[i].children[colIdx]) {
                        const txt = tbody.children[i].children[colIdx].querySelector('.main-text')?.textContent;
                        if (txt && txt.trim() !== '') return txt.trim();
                    }
                }
            }
            return '';
        }
        function formatDefectPosition(mode, buzai, kai, houkou, bui, edaban, kensasuVal) {
            if (mode === 'Suminiku') return kensasuVal || '';
            let posParts = [];
            if (kai) posParts.push(kai + 'F');
            if (houkou) posParts.push(houkou);
            if (bui) posParts.push(bui);
            if ((mode === 'UT' || mode === 'VT') && edaban) {
                posParts.push(edaban);
            }
            let posStr = posParts.join('-');
            return buzai ? `【${
buzai}
】 ${
posStr}
` : posStr;
        }
        function isMisalignKigou(k) {
            if (!k) return false;
            const master = getMaster();
            const maKigous = (master && master.lot_kigou && master.lot_kigou['食違いずれ']) ? master.lot_kigou['食違いずれ'] : [];
            return [...maKigous, '食違いずれ'].includes(k);
        }
        let currentDefectRow = -1;
 let currentDefectCol = -1;
 let currentDefects = [];
 let currentDefectIndex = 0;
 let currentDefectMode = 'UT';
                function openDefectModal(initMode) {
            if(!targetCellForMenu) return;
            currentDefectRow = parseInt(targetCellForMenu.dataset.r);
            currentDefectCol = parseInt(targetCellForMenu.dataset.c);
            const defectsStr = targetCellForMenu.dataset.defects;
            currentDefects = (defectsStr && defectsStr !== 'undefined') ? JSON.parse(defectsStr) : [];
                        if (currentDefects.length === 0) {
                currentDefects.push({
 mode: initMode || 'UT' }
);
            }
            currentDefectIndex = 0;
            if (initMode) currentDefectMode = initMode;
            else currentDefectMode = currentDefects[0].mode;
                        const lotIdx = Math.floor((currentDefectCol - 1) / 6);
            let blockIndex = 0;
            for(let i=0;
 i<=currentDefectRow;
 i++){
                const tdAny = $('tableBody').children[i].children[1 + lotIdx * 6];
                if(tdAny && tdAny.classList.contains('cell-double-border')) blockIndex++;
            }
            const h1 = $('headerRow1'), th = h1.children[lotIdx + 1];
            if(th) {
                const blocks = th.querySelectorAll('.lot-cell');
                const tb = blocks[Math.min(blockIndex, blocks.length - 1)];
                if(tb) $('defectLotNo').textContent = `${
tb.dataset.setsu||''}
-${
tb.dataset.kigou||''}
-${
tb.dataset.suu||''}
`;
            }
            const buzai = getInheritedValue(currentDefectRow, 0);
            const kai = getInheritedValue(currentDefectRow, 1 + lotIdx * 6 + 0);
            const houkou = getInheritedValue(currentDefectRow, 1 + lotIdx * 6 + 1);
            const bui = getInheritedValue(currentDefectRow, 1 + lotIdx * 6 + 2);
            const edaban = $('tableBody').children[currentDefectRow].children[1 + lotIdx * 6 + 3].querySelector('.main-text')?.textContent?.trim() || '';
            const kensasu = $('tableBody').children[currentDefectRow].children[1 + lotIdx * 6 + 5].querySelector('.main-text')?.textContent?.trim() || '';
            $('defectPosition').textContent = formatDefectPosition(currentDefectMode, buzai, kai, houkou, bui, edaban, kensasu);
                        renderDefectForm();
            openModal('defectModal');
        }
        function switchDefectTab(mode) {
            if (currentDefectMode === mode) return;
            saveCurrentDefect();
                         const currentData = currentDefects[currentDefectIndex];
            const hasData = Object.keys(currentData).some(k => k !== 'mode' && currentData[k] !== '' && currentData[k] !== false);
            if (hasData) {
                alert('このデータNoには既に記録が入力されています。別の種類の記録を入力するには「新規記録追加」で新しいデータNoを作成してください。');
                return;
            }
                        currentDefects[currentDefectIndex].mode = mode;
            currentDefectMode = mode;
                         if (currentDefectCol > 0) {
                const lotIdx = Math.floor((currentDefectCol - 1) / 6);
                const buzai = getInheritedValue(currentDefectRow, 0);
                const kai = getInheritedValue(currentDefectRow, 1 + lotIdx * 6 + 0);
                const houkou = getInheritedValue(currentDefectRow, 1 + lotIdx * 6 + 1);
                const bui = getInheritedValue(currentDefectRow, 1 + lotIdx * 6 + 2);
                const edaban = $('tableBody').children[currentDefectRow].children[1 + lotIdx * 6 + 3].querySelector('.main-text')?.textContent?.trim() || '';
                const kensasu = $('tableBody').children[currentDefectRow].children[1 + lotIdx * 6 + 5].querySelector('.main-text')?.textContent?.trim() || '';
                $('defectPosition').textContent = formatDefectPosition(currentDefectMode, buzai, kai, houkou, bui, edaban, kensasu);
            }
            renderDefectForm();
        }
        function changeDefectIndex(dir) {
            saveCurrentDefect();
            const nextIdx = currentDefectIndex + dir;
            if(nextIdx >= 0 && nextIdx < Math.max(1, currentDefects.length)) {
                currentDefectIndex = nextIdx;
                 renderDefectForm();
            }
        }
                function addNewDefect() {
            saveCurrentDefect();
            currentDefects.push({
 mode: currentDefectMode }
);
            currentDefectIndex = currentDefects.length - 1;
            renderDefectForm();
        }
                function deleteCurrentDefect() {
            if (confirm('表示中の欠陥記録を削除しますか？')) {
                currentDefects.splice(currentDefectIndex, 1);
                if (currentDefects.length === 0) {
                    currentDefects.push({
 mode: currentDefectMode }
);
                    currentDefectIndex = 0;
                }
 else if (currentDefectIndex >= currentDefects.length) {
                    currentDefectIndex = currentDefects.length - 1;
                }
                renderDefectForm();
            }
        }
        function renderDefectForm() {
            const data = currentDefects[currentDefectIndex] || {
 mode: currentDefectMode }
;
            currentDefectMode = data.mode || 'UT';
                        $('defectTabUT').className = currentDefectMode === 'UT' ? 'flex-1 bg-blue-600 text-white font-bold py-2 rounded-l-lg border-r border-blue-700 transition shadow-sm' : 'flex-1 bg-gray-200 text-gray-700 font-bold py-2 rounded-l-lg hover:bg-gray-300 border-r border-gray-300 transition shadow-sm';
            $('defectTabVT').className = currentDefectMode === 'VT' ? 'flex-1 bg-blue-600 text-white font-bold py-2 border-r border-blue-700 transition shadow-sm' : 'flex-1 bg-gray-200 text-gray-700 font-bold py-2 border-r border-gray-300 hover:bg-gray-300 transition shadow-sm';
            $('defectTabMisalign').className = currentDefectMode === 'Misalign' ? 'flex-1 bg-blue-600 text-white font-bold py-2 border-r border-blue-700 transition shadow-sm' : 'flex-1 bg-gray-200 text-gray-700 font-bold py-2 border-r border-gray-300 hover:bg-gray-300 transition shadow-sm';
            const tabSum = $('defectTabSuminiku');
            if(tabSum) tabSum.className = currentDefectMode === 'Suminiku' ? 'flex-1 bg-blue-600 text-white font-bold py-2 rounded-r-lg transition shadow-sm' : 'flex-1 bg-gray-200 text-gray-700 font-bold py-2 rounded-r-lg hover:bg-gray-300 transition shadow-sm';
                        $('defectFormUT').style.display = currentDefectMode === 'UT' ? 'flex' : 'none';
            $('defectFormVT').style.display = currentDefectMode === 'VT' ? 'flex' : 'none';
            $('defectFormMisalign').style.display = currentDefectMode === 'Misalign' ? 'block' : 'none';
            const formSum = $('defectFormSuminiku');
            if(formSum) formSum.style.display = currentDefectMode === 'Suminiku' ? 'flex' : 'none';
                        if ($('defectModalFooter')) {
                $('defectModalFooter').style.display = (currentDefectMode === 'UT' || currentDefectMode === 'VT') ? 'none' : 'flex';
            }
                        $('defectDataNo').textContent = currentDefectIndex + 1;
            $('defectTotalCount').textContent = Math.max(1, currentDefects.length);
                        if (currentDefectMode === 'UT') {
                ['tansho','x','siji','t1','y','hyoka','t2','w','sowa','stb','k','gohi','d','kaiseki'].forEach(k => {
                    const el = $('ut_' + k);
 if(el) el.value = data[k] || '';
                }
);
                setRadio('ut_men', data.men);
 setRadio('ut_hoho', data.hoho);
 setRadio('ut_ryoiki', data.ryoiki);
                $('ut_hoshu').checked = !!data.hoshu;
                updateKaisekiButtons();
            }
 else if (currentDefectMode === 'VT') {
                ['tansho','x','t1','l','t2','sokutei','dia','biko','type'].forEach(k => {
                    const el = $('vt_' + k);
 if(el) el.value = data[k] || '';
                }
);
                setRadio('vt_men', data.men);
                if($('vt_type_display')) $('vt_type_display').value = $('vt_type').value || '';
            }
 else if (currentDefectMode === 'Misalign') {
                ['t1','t2','t3','haba','kijun','e1','e2','e3','ekm_ezm','biko'].forEach(k => {
                    const el = $('misalign_' + k);
 if(el) el.value = data[k] || '';
                }
);
            }
 else if (currentDefectMode === 'Suminiku') {
                ['posText','type','count','length','val'].forEach(k => {
                    const el = $('suminiku_' + k);
 if(el) el.value = data[k] || '';
                }
);
            }
        }
        function setKaiseki(val) {
            $('ut_kaiseki').value = val;
            updateKaisekiButtons();
        }
        function updateKaisekiButtons() {
            /* (既存のKaisekiボタンがあれば処理するが現在はテキスト直入力になったため簡略化) */            const val = $('ut_kaiseki').value;
        }
        function onKaisekiImageClick(event) {
            const rect = event.target.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const w = rect.width;
            const h = rect.height;
                        const px = x / w;
            const py = y / h;
                        let result = '';
                        if (py < 0.25) {
                const items = ['1','2','3','4','5','6','7','8','9','0'];
                result = items[Math.min(9, Math.floor(px * 10))];
            }
 else if (py < 0.45) {
                const items = ['0A','0B','0C','0D','0E','0F','0G','0H','0I','0J'];
                result = items[Math.min(9, Math.floor(px * 10))];
            }
 else if (py < 0.65) {
                const items = ['0K','0L','0M','0N','0O','0P','0Q','0R','0S'];
                result = items[Math.min(8, Math.floor(px * 9))];
            }
 else if (py < 0.82) {
                const items = ['0T','0U','0V','0W','0X','0Y','0Z'];
                result = items[Math.min(6, Math.floor(px * 7))];
            }
 else {
                const items = ['7','0B','0M','0Q','0W','XA','XB'];
                result = items[Math.min(6, Math.floor(px * 7))];
            }
                        if (result) {
                $('ut_kaiseki').value = result;
                updateKaisekiHighlight(result);
            }
        }
        function updateKaisekiHighlight(val) {
            const hl = $('kaiseki_highlight');
            if (!hl) return;
            if (!val) {
 hl.style.display = 'none';
 return;
 }
                        let box = null;
            const rows = [                {
 items: ['1','2','3','4','5','6','7','8','9','0'], top: 0, h: 25, w: 10 }
,                {
 items: ['0A','0B','0C','0D','0E','0F','0G','0H','0I','0J'], top: 25, h: 20, w: 10 }
,                {
 items: ['0K','0L','0M','0N','0O','0P','0Q','0R','0S'], top: 45, h: 20, w: 100/9 }
,                {
 items: ['0T','0U','0V','0W','0X','0Y','0Z'], top: 65, h: 17, w: 100/7 }
,                {
 items: ['7','0B','0M','0Q','0W','XA','XB'], top: 82, h: 18, w: 100/7 }
            ];
                        for (let r of rows) {
                let idx = r.items.indexOf(val);
                if (idx >= 0) {
                    box = {
 left: idx * r.w, top: r.top, width: r.w, height: r.h }
;
                    break;
                }
            }
                        if (box) {
                hl.style.display = 'block';
                hl.style.left = box.left + '%';
                hl.style.top = box.top + '%';
                hl.style.width = box.width + '%';
                hl.style.height = box.height + '%';
            }
 else {
                hl.style.display = 'none';
            }
        }
        function getRadio(name) {
 const el = document.querySelector(`input[name="${
name}
"]:checked`);
 return el ? el.value : '';
 }
        function setRadio(name, value) {
 document.querySelectorAll(`input[name="${
name}
"]`).forEach(el => {
 el.checked = (el.value === value);
 }
);
 }
        function saveCurrentDefect() {
            let data = {
 mode: currentDefectMode }
;
            if (currentDefectMode === 'UT') {
                ['tansho','x','siji','t1','y','hyoka','t2','w','sowa','stb','k','gohi','d','kaiseki'].forEach(k => {
 const v = $('ut_'+k).value;
 data[k] = v;
 }
);
                data.men = getRadio('ut_men');
 data.hoho = getRadio('ut_hoho');
 data.ryoiki = getRadio('ut_ryoiki');
 data.hoshu = $('ut_hoshu').checked;
            }
 else if (currentDefectMode === 'VT') {
                ['tansho','x','t1','l','t2','sokutei','dia','biko','type'].forEach(k => {
 const v = $('vt_'+k).value;
 data[k] = v;
 }
);
                data.men = getRadio('vt_men');
            }
 else if (currentDefectMode === 'Misalign') {
                ['t1','t2','t3','haba','kijun','e1','e2','e3','ekm_ezm','biko'].forEach(k => {
 const v = $('misalign_'+k).value;
 data[k] = v;
 }
);
            }
 else if (currentDefectMode === 'Suminiku') {
                ['posText','type','count','length','val'].forEach(k => {
 const v = $('suminiku_'+k).value;
 data[k] = v;
 }
);
            }
            if (currentDefects.length > currentDefectIndex) currentDefects[currentDefectIndex] = data;
        }
        function applyDefectsToCell() {
            const validDefects = currentDefects.filter(d => {
                return Object.keys(d).some(k => k !== 'mode' && d[k] !== '' && d[k] !== false);
            }
);
                        const cell = document.querySelector(`#tableBody td[data-r="${
currentDefectRow}
"][data-c="${
currentDefectCol}
"]`);
            if (cell) {
                const t = cell.querySelector('.main-text') ? cell.querySelector('.main-text').textContent : '';
                const c = cell.dataset.color || 'black';
                const db = cell.classList.contains('cell-double-border');
                renderCellContent(cell, {
 t, c, db, defects: validDefects }
);
            }
        }
        function saveAndCloseDefect() {
             saveCurrentDefect();
             saveHistory();
             applyDefectsToCell();
             closeModal();
         }
        function saveAndStayDefect() {
            saveCurrentDefect();
            saveHistory();
            applyDefectsToCell();
            addNewDefect();
        }
        function saveAndNextCellDefect() {
            saveCurrentDefect();
            saveHistory();
            applyDefectsToCell();
                        if (targetCellForMenu) {
                const r = parseInt(targetCellForMenu.dataset.r);
                const c = parseInt(targetCellForMenu.dataset.c);
                const nextCell = document.querySelector(`#tableBody td[data-r="${
r + 1}
"][data-c="${
c}
"]`);
                                closeModal();
                if (nextCell) {
                    setTimeout(() => {
                        targetCellForMenu = nextCell;
                        openDefectModal('UT');
                    }
, 150);
                }
            }
 else {
                closeModal();
            }
        }
                function closeDefectModal() {
             closeModal();
         }
        let targetCell = null, targetType = '', targetInputId = null;
        function toggleMinus() {
 const input = $('customInput');
 let val = input.value.trim();
 if (val.startsWith('-')) {
 input.value = val.slice(1);
 }
 else {
 input.value = '-' + val;
 }
 /* input.focus();
 disabled for iPad */ }
                function openInput(cell, type) {
            targetCell = cell;
 targetInputId = null;
 targetType = type;
            const cat = catDefs.find(c => c.id === type);
            $('inputModalTitle').textContent = cat ? cat.n : type;
            $('customInput').value = cell.querySelector('.main-text') ? cell.querySelector('.main-text').textContent : '';
             $('customInput').type = 'text';
 $('customInput').inputMode = 'text';
            setupInputMasterBtns(type);
            openModal('inputModal');
            setTimeout(() => {
 /* $('customInput').focus();
 disabled for iPad */ }
, 100);
        }
        function openInputForId(inputId, type, title) {
            targetCell = null;
 targetInputId = inputId;
 targetType = type;
            $('inputModalTitle').textContent = title + '入力';
            $('customInput').value = $(inputId).value || '';
 $('customInput').type = 'text';
 $('customInput').inputMode = 'text';
            setupInputMasterBtns(type);
            openModal('inputModal');
            setTimeout(() => {
 /* $('customInput').focus();
 disabled for iPad */ }
, 100);
        }
        function cancelInputModal() {
            if (targetInputId) {
                targetInputId = null;
                openModal('defectModal');
            }
 else {
                closeModal();
            }
        }
        function setupInputMasterBtns(type) {
            const box = $('inputMasterBtns');
 box.innerHTML = '';
 migrateMasterData(getMaster());
            if (type === 'kensasu') {
                $('minusToggleBtn').classList.remove('hidden');
 box.className = 'grid grid-cols-3 gap-2';
 const keys = ['7','8','9','4','5','6','1','2','3','0','.','×'];
                keys.forEach(k => {
                    const btn = el('button', 'bg-gray-100 border rounded-xl p-4 font-bold active:bg-blue-200 text-2xl shadow-sm', {
text: k}
);
 btn.type = 'button';
                    btn.onclick = () => {
 const input = $('customInput');
 if (k === '×') {
 input.value = input.value.slice(0, -1);
 }
 else if (k === '-') {
 if (input.value.startsWith('-')) input.value = input.value.slice(1);
 else input.value = '-' + input.value;
 }
 else {
 input.value += k;
 }
 /* input.focus();
 disabled for iPad */ }
;
 box.appendChild(btn);
                }
);
                const decideBtn = el('button', 'col-span-3 bg-blue-600 text-white border rounded-xl p-3 font-bold active:bg-blue-700 text-xl shadow-sm mt-1', {
text: '決定'}
);
 decideBtn.type = 'button';
 decideBtn.onclick = () => {
 $('customInput').blur();
 applyCustomInput();
 }
;
 box.appendChild(decideBtn);
            }
 else {
                $('minusToggleBtn').classList.add('hidden');
                if (groupDefs[type]) {
                    box.className = 'flex flex-col gap-3';
 const masterObj = getMaster()[type] || {
}
;
                    groupDefs[type].forEach(sub => {
                        const items = masterObj[sub] || [];
                        if (items.length > 0) {
                            const groupWrap = el('div', 'bg-gray-50 p-3 rounded-xl border border-gray-200');
 groupWrap.appendChild(el('div', 'font-bold text-gray-500 mb-2 text-sm', {
text: `【${
sub}
】`}
));
                            const gridBox = el('div', 'grid grid-cols-3 md:grid-cols-4 gap-2');
                            items.forEach(item => {
                                const btn = el('button', 'bg-white border border-gray-300 rounded-lg p-3 font-bold active:bg-blue-200 text-base shadow-sm hover:bg-gray-50', {
text: item}
);
 btn.type = 'button';
                                btn.onclick = () => {
 saveHistory();
 const newData = {
 t: item, c: currentTextColor, db: targetCell.classList.contains('cell-double-border'), defects: targetCell.dataset.defects ? JSON.parse(targetCell.dataset.defects) : [] }
;
 renderCellContent(targetCell, newData);
 calcKensasuSum();
 closeModal();
 }
;
 gridBox.appendChild(btn);
                            }
);
                            groupWrap.appendChild(gridBox);
 box.appendChild(groupWrap);
                        }
                    }
);
                    if (box.innerHTML === '') box.innerHTML = '<div class="text-center text-gray-400 py-4 font-bold">マスタが登録されていません</div>';
                }
 else {
                    box.className = 'grid grid-cols-3 md:grid-cols-4 gap-3';
 const masterList = getMaster()[type] || defMaster[type] || [];
                    masterList.forEach(item => {
                        const btn = el('button', 'bg-gray-100 border rounded-xl p-4 font-bold active:bg-blue-200 text-lg hover:bg-gray-200', {
text: item}
);
 btn.type = 'button';
                        btn.onclick = () => {
 saveHistory();
 const newData = {
 t: item, c: currentTextColor, db: targetCell.classList.contains('cell-double-border'), defects: targetCell.dataset.defects ? JSON.parse(targetCell.dataset.defects) : [] }
;
 renderCellContent(targetCell, newData);
 calcKensasuSum();
 closeModal();
 }
;
 box.appendChild(btn);
                    }
);
                }
            }
            openModal('inputModal');
 if (type !== 'kensasu') {
 setTimeout(() => {
 /* $('customInput').focus();
 disabled for iPad */ }
, 100);
 }
        }
                function applyCustomInput() {
            if ((!targetCell && !targetInputId) || !targetType) return;
             const v = $('customInput').value.trim();
 migrateMasterData(getMaster());
            if (v) {
                if (groupDefs[targetType]) {
 if (!getMaster()[targetType]['その他']) getMaster()[targetType]['その他'] = [];
 let exists = false;
 Object.values(getMaster()[targetType]).forEach(arr => {
 if(arr.includes(v)) exists = true;
 }
);
 if (!exists) {
 getMaster()[targetType]['その他'].push(v);
 saveData();
 }
 }
                 else {
 if (!getMaster()[targetType]) getMaster()[targetType] = [];
 if (!getMaster()[targetType].includes(v)) {
 getMaster()[targetType].push(v);
 saveData();
 }
 }
            }
                        if (targetInputId) {
                $(targetInputId).value = v;
                targetInputId = null;
                openModal('defectModal');
                return;
            }
            saveHistory();
             const newData = {
 t: v, c: v ? currentTextColor : 'black', db: targetCell.classList.contains('cell-double-border'), defects: targetCell.dataset.defects ? JSON.parse(targetCell.dataset.defects) : [] }
;
            renderCellContent(targetCell, newData);
 calcKensasuSum();
 closeModal();
        }
        function toggleBikou() {
            if (!targetCell) return;
            const th = targetCell.closest('th');
             const colIndex = Array.from(th.parentNode.children).indexOf(th) - 1;
            const s = sheets.find(sh => sh.id === activeSheetId);
            if (!s) return;
            if (!s.lotBikou) s.lotBikou = [];
            s.lotBikou[colIndex] = !s.lotBikou[colIndex];
                        const btn = document.getElementById('toggleBikouBtn');
            if (s.lotBikou[colIndex]) {
                btn.textContent = '備考欄非表示';
                btn.classList.replace('bg-indigo-100', 'bg-gray-100');
                btn.classList.replace('text-indigo-700', 'text-gray-700');
                btn.classList.replace('border-indigo-200', 'border-gray-200');
            }
 else {
                btn.textContent = '備考欄表示';
                btn.classList.replace('bg-gray-100', 'bg-indigo-100');
                btn.classList.replace('text-gray-700', 'text-indigo-700');
                btn.classList.replace('border-gray-200', 'border-indigo-200');
            }
            updateEdabanVisibility();
        }
        let edLot = {
setsu:'', kigou:'', suu:''}
;
        function openLot(cell) {
            targetCell = cell;
 edLot = {
setsu: cell.dataset.setsu||'', kigou: cell.dataset.kigou||'', suu: cell.dataset.suu||''}
;
 migrateMasterData(getMaster());
            const th = targetCell.closest('th');
 const colIndex = Array.from(th.parentNode.children).indexOf(th) - 1;
            const s = sheets.find(sh => sh.id === activeSheetId);
            const btn = document.getElementById('toggleBikouBtn');
            if (s && s.lotBikou && s.lotBikou[colIndex]) {
                btn.textContent = '備考欄非表示';
                btn.classList.replace('bg-indigo-100', 'bg-gray-100');
                btn.classList.replace('text-indigo-700', 'text-gray-700');
                btn.classList.replace('border-indigo-200', 'border-gray-200');
            }
 else {
                btn.textContent = '備考欄表示';
                btn.classList.replace('bg-gray-100', 'bg-indigo-100');
                btn.classList.replace('text-gray-700', 'text-indigo-700');
                btn.classList.replace('border-gray-200', 'border-indigo-200');
            }
            const renderBtns = () => {
                $('lotMasterContainer').innerHTML='';
                ['setsu', 'kigou', 'suu'].forEach(part => {
                    const type = 'lot_' + part;
 const w = el('div', 'bg-gray-50 p-3 rounded-lg border border-gray-200');
 w.appendChild(el('div', 'font-bold text-gray-500 mb-2 text-sm', {
text: `【${
catDefs.find(c=>c.id===type).n.split('【')[1].replace('】','')}
】`}
));
                    if (groupDefs[type]) {
                        const masterObj = getMaster()[type] || {
}
;
                        groupDefs[type].forEach(sub => {
                            const items = masterObj[sub] || [];
                            if (items.length > 0) {
                                const subW = el('div', 'mb-3 last:mb-0');
 subW.appendChild(el('div', 'text-xs text-gray-500 font-bold mb-1', {
text: `◆ ${
sub}
`}
));
 const bBox = el('div', 'flex flex-wrap gap-2');
                                items.forEach(i => {
 bBox.appendChild(el('button', `px-4 py-1.5 rounded-lg font-bold border shadow-sm ${
edLot[part]===i ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 text-sm hover:bg-gray-100'}
`, {
text: i, onclick: () => {
 edLot[part]=i;
 $(`p_${
part}
`).textContent=i;
 renderBtns();
 }
}
));
 }
);
                                subW.appendChild(bBox);
 w.appendChild(subW);
                            }
                        }
);
                        if(w.childElementCount === 1) w.appendChild(el('div', 'text-center text-gray-400 py-2 text-xs font-bold', {
text: '登録なし'}
));
                    }
 else {
                        const bBox = el('div', 'flex flex-wrap gap-2');
                        (getMaster()[type] || []).forEach(i => {
                            bBox.appendChild(el('button', `px-5 py-2 rounded-lg font-bold border-2 ${
edLot[part]===i ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 hover:bg-gray-100'}
`, {
text: i, onclick: () => {
 edLot[part]=i;
 $(`p_${
part}
`).textContent=i;
 renderBtns();
 }
}
));
                        }
);
                        w.appendChild(bBox);
                    }
                    $('lotMasterContainer').appendChild(w);
                }
);
            }
;
            ['setsu','kigou','suu'].forEach(p => $(`p_${
p}
`).textContent = edLot[p]);
 renderBtns();
 openModal('lotModal');
        }
                function updLot(cell) {
            const has = cell.dataset.setsu || cell.dataset.kigou || cell.dataset.suu;
            const disp = cell.querySelector('.lot-display');
            disp.textContent = has ? `${
cell.dataset.setsu}
-${
cell.dataset.kigou}
-${
cell.dataset.suu}
` : '';
            disp.classList.toggle('hidden', !has);
            cell.querySelector('.placeholder-text').classList.toggle('hidden', has);
            has ? cell.classList.add('bg-blue-100') : cell.classList.remove('bg-blue-100');
            if (has && cell.dataset.color) setCellColorClass(cell, cell.dataset.color);
        }
                function applyLot(clear=false) {
             saveHistory();
            if(clear) {
 edLot={
setsu:'',kigou:'',suu:''}
;
 setCellColorClass(targetCell, 'black');
 }
            else {
 setCellColorClass(targetCell, currentTextColor);
 }
            Object.assign(targetCell.dataset, edLot);
 updLot(targetCell);
 updateEdabanVisibility();
 closeModal();
         }
        function deleteLotColumn() {
            if (lotCount <= 1) return alert('最低1つのロット列は残す必要があります。');
            const th = targetCell.closest('th');
 const colIndex = Array.from(th.parentNode.children).indexOf(th) - 1;
             let hasData = false;
            Array.from($('tableBody').children).forEach(tr => {
                for(let k=1;
 k<=6;
 k++) {
 const td = tr.children[k + (colIndex * 6)];
 if (td && td.querySelector('.main-text') && td.querySelector('.main-text').textContent.trim() !== '') hasData = true;
 }
            }
);
            if (hasData && !confirm('このロットの列にはデータが入力されています。本当に列ごと消去してもよろしいですか？')) return;
                        saveHistory();
            th.remove();
            for(let i=0;
 i<6;
 i++) {
 const targetHeader = $('headerRow2').children[1 + (colIndex * 6)];
 if(targetHeader) targetHeader.remove();
 }
            Array.from($('tableBody').children).forEach(tr => {
                for(let i=0;
 i<6;
 i++) {
 const targetTd = tr.children[1 + (colIndex * 6)];
 if(targetTd) targetTd.remove();
 }
            }
);
            lotCount--;
 initSortable();
 reindexCells();
 calcKensasuSum();
 updateEdabanVisibility();
 updateStickyTop();
 closeModal();
        }
        /* --- 記録データのセット保存・読込 --- */        function openStorageModal() {
            const d = new Date();
            const dateStr = `${
d.getFullYear()}
/${
String(d.getMonth()+1).padStart(2,'0')}
/${
String(d.getDate()).padStart(2,'0')}
/${
String(d.getHours()).padStart(2,'0')}
:${
String(d.getMinutes()).padStart(2,'0')}
-${
String(d.getSeconds()).padStart(2,'0')}
`;
            const baseName = `${
projects[currentPId].name}
 ${
dateStr}
`;
                        const saved = JSON.parse(localStorage.getItem('appRecords')||'[]');
            let finalName = baseName;
            let counter = 2;
            while(saved.some(r => r.name === finalName)) {
 finalName = `${
baseName}
-${
counter}
`;
 counter++;
 }
                        $('saveName').value = finalName;
 renderSavedRecords();
 openModal('storageModal');
        }
        function createNewRecord() {
            if(!confirm("現在の記入内容をリセットして新しく記録を作成しますか？\n（入力済みのデータは自動で一時保存されます）")) return;
                        syncActiveSheetToModel();
                        let hasData = false;
            for(let s of sheets) {
                if(s.sheetInfo && (s.sheetInfo.setsu || s.sheetInfo.taishou || s.sheetInfo.sonota || s.sheetInfo.custom)) {
 hasData = true;
 break;
 }
                for(let row of s.rows) {
                    for(let cell of row) {
                        if(cell.t && cell.t.trim() !== "") {
 hasData = true;
 break;
 }
                        if(cell.defects && cell.defects.length > 0) {
 hasData = true;
 break;
 }
                    }
                    if(hasData) break;
                }
                if(hasData) break;
            }
                        if (hasData) {
                const autoName = "【自動保存】" + new Date().toLocaleString();
                const rec = {
 id: Date.now(), name: autoName, pId: currentPId, sheets: JSON.parse(JSON.stringify(sheets)), recordInfo: JSON.parse(JSON.stringify(recordInfo)) }
;
                 try {
                    const saved = JSON.parse(localStorage.getItem("appRecords")||"[]");
                     saved.unshift(rec);
                     localStorage.setItem("appRecords", JSON.stringify(saved));
                     renderSavedRecords();
                }
 catch(e) {
                    console.error(e);
                    alert("容量制限のため自動保存できませんでした。不要なデータを消去してから再度お試しください。");
                    return;
                 }
            }
                        historyStack = [];
            sheets = [createEmptySheet("sheet_" + Date.now(), "シート1")];
            activeSheetId = sheets[0].id;
            recordInfo = {
 date: getTodayString(), inspectors: [] }
;
            updateRecordInfoUI();
            loadActiveSheetToDOM();
            renderSheetTabs();
            saveDraft();
        }
        function saveRecord() {
            const name = $('saveName').value.trim() || new Date().toLocaleString();
             syncActiveSheetToModel();
                         const rec = {
 id: Date.now(), name: name, pId: currentPId, sheets: JSON.parse(JSON.stringify(sheets)), recordInfo: JSON.parse(JSON.stringify(recordInfo)) }
;
             const saved = JSON.parse(localStorage.getItem('appRecords')||'[]');
             saved.unshift(rec);
 localStorage.setItem('appRecords', JSON.stringify(saved));
             $('saveName').value='';
 renderSavedRecords();
         }
        function renderSavedRecords() {
             const list = $('savedList');
 list.innerHTML = '';
 const saved = JSON.parse(localStorage.getItem('appRecords')||'[]');
             saved.forEach(r => {
                 const li = el('li', 'flex justify-between items-center bg-gray-50 border p-3 rounded-lg');
                 const sheetCount = r.sheets ? r.sheets.length : 1;
                li.innerHTML = `<div><div class="font-bold">${
r.name}
</div><div class="text-xs text-gray-500">工事: ${
projects[r.pId]?.name||'不明'}
 (シート数: ${
sheetCount}
)</div></div>`;
                 const bBox = el('div', 'flex gap-2');
                 bBox.appendChild(el('button', 'bg-blue-100 text-blue-700 px-3 py-1 rounded font-bold text-sm', {
text:'読込', onclick:()=>{
 loadRecord(r);
 }
}
));
                 bBox.appendChild(el('button', 'bg-red-50 text-red-500 px-3 py-1 rounded font-bold text-sm', {
text:'削除', onclick:()=>{
                     if(confirm('本当にこの記録データを消去してもよろしいですか？')) {
 localStorage.setItem('appRecords', JSON.stringify(saved.filter(x=>x.id!==r.id)));
 renderSavedRecords();
 }
                }
}
));
                 li.appendChild(bBox);
 list.appendChild(li);
             }
);
         }
        function loadRecord(r) {
             if(!confirm('現在のデータを上書きして記録を読み込みますか？\n（現在入力済みのデータは自動で一時保存されます）')) return;
                         syncActiveSheetToModel();
            let hasData = false;
            for(let s of sheets) {
                if(s.sheetInfo && (s.sheetInfo.setsu || s.sheetInfo.taishou || s.sheetInfo.sonota || s.sheetInfo.custom)) {
 hasData = true;
 break;
 }
                for(let row of s.rows) {
                    for(let cell of row) {
                        if(cell && cell.t && cell.t.trim() !== "") {
 hasData = true;
 break;
 }
                        if(cell && cell.defects && cell.defects.length > 0) {
 hasData = true;
 break;
 }
                    }
                    if(hasData) break;
                }
                if(hasData) break;
            }
            if (hasData) {
                const autoName = "【自動保存】" + new Date().toLocaleString();
                const rec = {
 id: Date.now(), name: autoName, pId: currentPId, sheets: JSON.parse(JSON.stringify(sheets)), recordInfo: JSON.parse(JSON.stringify(recordInfo)) }
;
                 try {
                    const saved = JSON.parse(localStorage.getItem("appRecords")||"[]");
                     saved.unshift(rec);
                     localStorage.setItem("appRecords", JSON.stringify(saved));
                     renderSavedRecords();
                }
 catch(e) {
 console.warn(e);
 }
            }
            saveHistory();
 currentPId = r.pId;
             if(!projects[currentPId]) {
 projects[currentPId] = {
name:'復元工事', master:JSON.parse(JSON.stringify(defMaster))}
;
 saveData();
 }
                         migrateMasterData(projects[currentPId].master);
                        $('headerProjectName').textContent = projects[currentPId].name;
                        if(r.sheets) {
 sheets = JSON.parse(JSON.stringify(r.sheets));
 activeSheetId = sheets[0].id;
 }
             else {
 sheets = [{
 id: 'sheet_' + Date.now(), name: 'シート1', lc: r.lc || 3, rc: r.rc || 100, lots: r.lots || [], rows: r.rows || [], thick: r.thick || [], notes: r.notes || [], sheetInfo: r.sheetInfo || {
 setsu: '', taishou: '', sonota: '', custom: '' }
 }
];
 activeSheetId = sheets[0].id;
 }
                        recordInfo = r.recordInfo ? JSON.parse(JSON.stringify(r.recordInfo)) : {
 date: getTodayString(), inspectors: [] }
;
            updateRecordInfoUI();
                        loadActiveSheetToDOM();
 renderSheetTabs();
 closeModal();
 saveDraft();
        }
        function exportRecords() {
             try {
                const saved = JSON.parse(localStorage.getItem('appRecords')||'[]');
                 const blob = new Blob([JSON.stringify(saved, null, 2)], {
type: 'application/json'}
);
                 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
                 a.href = url;
 a.download = `records_backup_${
Date.now()}
.json`;
 document.body.appendChild(a);
 a.click();
                 setTimeout(() => {
 document.body.removeChild(a);
 URL.revokeObjectURL(url);
 }
, 100);
            }
 catch(e) {
 console.error(e);
 alert("記録の書き出しに失敗しました。");
 }
        }
                function importRecords(e) {
             const file = e.target.files[0];
 if(!file) return;
 const reader = new FileReader();
             reader.onload = (evt) => {
                 try {
                     const data = JSON.parse(evt.target.result);
                     if(Array.isArray(data)) {
 localStorage.setItem('appRecords', JSON.stringify(data));
 renderSavedRecords();
 alert('記録データを復元しました');
 }
                     else throw new Error('Invalid format');
                }
 catch(err) {
 alert('読み込みエラー: ' + err.message);
 console.error(err);
 }
                 e.target.value = '';
             }
;
 reader.readAsText(file);
         }
        /* --- 本物のExcel(.xlsx)生成・出力機能 --- */        async function downloadExcel(btn, isSpreadsheet = false) {
            const originalText = btn.innerHTML;
 btn.innerHTML = '⏳ 処理中...';
 btn.disabled = true;
            try {
                syncActiveSheetToModel();
 const workbook = new ExcelJS.Workbook();
                                sheets.forEach((s, sheetIndex) => {
                    let sheetName = s.name || `Sheet${
sheetIndex + 1}
`;
                    if (workbook.worksheets.some(ws => ws.name === sheetName)) sheetName = `${
sheetName}
_${
sheetIndex + 1}
`;
                    const worksheet = workbook.addWorksheet(sheetName);
                    let lastDataIndex = -1;
                    for(let r = s.rc - 1;
 r >= 0;
 r--){
 let hasData = false;
 const rData = s.rows[r];
 if(rData){
 for(let c = 0;
 c < rData.length;
 c++){
 if(rData[c] && rData[c].t.trim() !== '') {
 hasData = true;
 break;
 }
 }
 }
 if(hasData) {
 lastDataIndex = r;
 break;
 }
 }
                    const maxRow = Math.max(0, lastDataIndex);
                    const sums = Array.from({
length: s.lc}
, () => [0]);
                    for (let r = 0;
 r <= maxRow;
 r++) {
                        for (let c = 0;
 c < s.lc;
 c++) {
                            const blockIndex = sums[c].length - 1;
 const tdData = s.rows[r] ? s.rows[r][1 + c * 6 + 5] : null;
                            if (tdData && tdData.t) {
 const match = tdData.t.match(/-?\d+/);
 if (match) sums[c][blockIndex] += parseInt(match[0], 10);
 }
                            const tdAny = s.rows[r] ? s.rows[r][1 + c * 6] : null;
 if (tdAny && tdAny.db) sums[c].push(0);
                        }
                    }
                    const headerRow1 = worksheet.getRow(1);
 headerRow1.height = 40;
                    const headerRow2 = worksheet.getRow(2);
 headerRow2.height = 25;
                    const infoParts = s.sheetInfo ? [s.sheetInfo.setsu, s.sheetInfo.taishou, s.sheetInfo.sonota, s.sheetInfo.custom].filter(v => v) : [];
                    let colIndex = 1;
                    for (let c = 0;
 c < s.lc;
 c++) {
                        let hasUT = false;
 let hasSuminiku = false;
 const lotBlocks = s.lots[c] || [];
 lotBlocks.forEach(lb => {
 if(isUtKigou(lb.k)) hasUT = true;
 if(isSuminikuKigou(lb.k)) hasSuminiku = true;
 }
);
 const showBikou = !!(s.lotBikou && s.lotBikou[c]);
                                                /* ヘッダー行1: シート情報 or 空白 */                        const infoCell = headerRow1.getCell(colIndex);
                        if (c === 0) {
 infoCell.value = infoParts.join('\n');
 }
                        infoCell.alignment = {
 vertical: 'middle', horizontal: 'center', wrapText: true }
;
                        infoCell.border = {
 top: {
style:'thin'}
, left: {
style:'medium'}
, right: {
style:'thin'}
, bottom: {
style:'thin'}
 }
;
                        infoCell.fill = {
 type: 'pattern', pattern: 'solid', fgColor: {
 argb: 'FFF3F4F6' }
 }
;
                        infoCell.font = {
 bold: true }
;
                        /* ヘッダー行2: 部材番号 */                        const bzCell = headerRow2.getCell(colIndex);
                        bzCell.value = "部材番号";
                         bzCell.alignment = {
 vertical: 'middle', horizontal: 'center' }
;
                         bzCell.border = {
 top: {
style:'thin'}
, left: {
style:'medium'}
, right: {
style:'thin'}
, bottom: {
style:'thin'}
 }
;
                         bzCell.fill = {
 type: 'pattern', pattern: 'solid', fgColor: {
 argb: 'FFF3F4F6' }
 }
;
                         bzCell.font = {
 bold: true }
;
                        /* ヘッダー行1: ロット情報 */                        let lotTexts = [];
                         (lotBlocks.length > 0 ? lotBlocks : [{
s:'',k:'',u:'',c:'black'}
]).forEach((lb, idx) => {
                             const lTxt = (lb.s || lb.k || lb.u) ? `${
lb.s}
-${
lb.k}
-${
lb.u}
` : '';
                             const sTxt = sums[c][idx] !== undefined ? sums[c][idx] : 0;
                             if (lTxt) lotTexts.push(`${
lTxt}
 (計:${
sTxt}
)`);
                         }
);
                        const lotCell = headerRow1.getCell(colIndex + 1);
                         lotCell.value = lotTexts.join(' / ');
                         lotCell.alignment = {
 vertical: 'middle', horizontal: 'center', wrapText: true }
;
                        lotCell.border = {
 top: {
style:'thin'}
, left: {
style:'thin'}
, right: {
style:'thin'}
, bottom: {
style:'thin'}
 }
;
                         lotCell.fill = {
 type: 'pattern', pattern: 'solid', fgColor: {
 argb: 'FFF3F4F6' }
 }
;
                         lotCell.font = {
 bold: true }
;
                                                let colSpanLen = 4;
 if(hasUT) colSpanLen++;
 if(showBikou) colSpanLen++;
 if(hasSuminiku) colSpanLen = 1;
                         worksheet.mergeCells(1, colIndex + 1, 1, colIndex + colSpanLen);
                         /* ヘッダー行2: ロット詳細ラベル */                        let detailColIndex = colIndex + 1;
                        const labels = ['階', '方向', '部位', '枝番', '備考', '検査数'];
                        labels.forEach((lbl, idx) => {
                            let skip = false;
 if (hasSuminiku && idx < 5) skip = true;
 else if (idx === 3 && !hasUT) skip = true;
 else if (idx === 4 && !showBikou) skip = true;
                            if (skip) return;
                             const cCell = headerRow2.getCell(detailColIndex);
                             cCell.value = lbl;
                             cCell.alignment = {
 vertical: 'middle', horizontal: 'center' }
;
                            cCell.border = {
 top: {
style:'thin'}
, left: {
style:'thin'}
, right: {
style:'thin'}
, bottom: {
style:'thin'}
 }
;
                             cCell.fill = {
 type: 'pattern', pattern: 'solid', fgColor: {
 argb: 'FFF3F4F6' }
 }
;
                             cCell.font = {
 bold: true }
;
                             detailColIndex++;
                        }
);
                        colIndex += 1 + colSpanLen;
 if (c < s.lc - 1) {
 worksheet.getColumn(colIndex).width = 2;
 colIndex++;
 }
                    }
                    for (let r = 0;
 r <= maxRow;
 r++) {
                        const rData = s.rows[r] || [];
 const excelRow = worksheet.getRow(r + 3);
 excelRow.height = 25;
 const isThick = s.thick && s.thick.includes(r);
                                                const cellBuzai = rData[0] || {
 t: '', c: 'black', db: false, defects: [] }
;
                         const cellValueBuzai = cellBuzai.t;
                        let excelColIndex = 1;
                        for (let c = 0;
 c < s.lc;
 c++) {
                            let hasUT = false;
 let hasSuminiku = false;
 const lotBlocks = s.lots[c] || [];
 lotBlocks.forEach(lb => {
 if(isUtKigou(lb.k)) hasUT = true;
 if(isSuminikuKigou(lb.k)) hasSuminiku = true;
 }
);
 const showBikou = !!(s.lotBikou && s.lotBikou[c]);
                             /* 部材番号セル */                            const excelCellBz = excelRow.getCell(excelColIndex);
                            let cellTextBz = cellValueBuzai;
                            if (cellBuzai.defects && cellBuzai.defects.length > 0) {
                                if(cellBuzai.defects.some(d=>d.mode==='UT')) cellTextBz += '\n※UT記録あり';
                                if(cellBuzai.defects.some(d=>d.mode==='VT')) cellTextBz += '\n※外観記録あり';
                                if(cellBuzai.defects.some(d=>d.mode==='Misalign')) cellTextBz += '\n※食違い記録あり';
                            }
                            if (cellTextBz === cellValueBuzai && cellValueBuzai !== '' && !isNaN(cellValueBuzai)) {
                                 excelCellBz.value = Number(cellValueBuzai);
                             }
 else {
                                 excelCellBz.value = cellTextBz;
                             }
                            excelCellBz.alignment = {
 vertical: 'middle', horizontal: 'center', wrapText: true }
;
                            let borderStyleBz = {
 top: {
style:'thin'}
, left: {
style:'medium'}
, right: {
style:'thin'}
, bottom: {
style:'thin'}
 }
;
                            if (isThick) borderStyleBz.bottom = {
style: 'medium'}
;
                             if (cellBuzai.db) borderStyleBz.bottom = {
style: 'double'}
;
                            excelCellBz.border = borderStyleBz;
                             if (cellBuzai.c) {
 const colorMap = {
 black: 'FF000000', red: 'FFDC2626', blue: 'FF2563EB', green: 'FF16A34A' }
;
 excelCellBz.font = {
 color: {
 argb: colorMap[cellBuzai.c] || 'FF000000' }
 }
;
 }
                            excelColIndex++;
                            /* ロット詳細セル */                            for (let k = 0;
 k < 6;
 k++) {
                                let skip = false;
 if (hasSuminiku && k < 5) skip = true;
 else if (k === 3 && !hasUT) skip = true;
 else if (k === 4 && !showBikou) skip = true;
                                if (skip) continue;
                                                                const cellData = rData[1 + c * 6 + k] || {
 t: '', c: 'black', db: false, defects: [] }
;
                                 const cellValue = cellData.t;
                                 const excelCell = excelRow.getCell(excelColIndex);
                                                                let cellText = cellValue;
                                if (cellData.defects && cellData.defects.length > 0) {
                                    if(cellData.defects.some(d=>d.mode==='UT')) cellText += '\n※UT記録あり';
                                    if(cellData.defects.some(d=>d.mode==='VT')) cellText += '\n※外観記録あり';
                                    if(cellData.defects.some(d=>d.mode==='Misalign')) cellText += '\n※食違い記録あり';
                                }
                                                                if (cellText === cellValue && cellValue !== '' && !isNaN(cellValue)) {
                                     excelCell.value = Number(cellValue);
                                 }
 else {
                                     excelCell.value = cellText;
                                 }
                                                                excelCell.alignment = {
 vertical: 'middle', horizontal: 'center', wrapText: true }
;
                                let borderStyle = {
 top: {
style:'thin'}
, left: {
style:'thin'}
, right: {
style:'thin'}
, bottom: {
style:'thin'}
 }
;
                                if (isThick) borderStyle.bottom = {
style: 'medium'}
;
                                 if (cellData.db) borderStyle.bottom = {
style: 'double'}
;
                                excelCell.border = borderStyle;
                                 if (cellData.c) {
 const colorMap = {
 black: 'FF000000', red: 'FFDC2626', blue: 'FF2563EB', green: 'FF16A34A' }
;
 excelCell.font = {
 color: {
 argb: colorMap[cellData.c] || 'FF000000' }
 }
;
 }
                                excelColIndex++;
                            }
                            if (c < s.lc - 1) {
 excelColIndex++;
 }
                        }
                    }
                    let widthColIndex = 1;
                    for (let c = 0;
 c < s.lc;
 c++) {
                        let hasUT = false;
 let hasSuminiku = false;
 const lotBlocks = s.lots[c] || [];
 lotBlocks.forEach(lb => {
 if(isUtKigou(lb.k)) hasUT = true;
 if(isSuminikuKigou(lb.k)) hasSuminiku = true;
 }
);
                                                /* 部材番号幅 */                        worksheet.getColumn(widthColIndex).width = 15;
                         widthColIndex++;
                        const showBikou = !!(s.lotBikou && s.lotBikou[c]);
                        const labels = ['階', '方向', '部位', '枝番', '備考', '検査数'];
                        labels.forEach((lbl, idx) => {
                            let skip = false;
 if (hasSuminiku && idx < 5) skip = true;
 else if (idx === 3 && !hasUT) skip = true;
 else if (idx === 4 && !showBikou) skip = true;
                            if (skip) return;
                            if (idx === 3 || idx === 4 || idx === 5) {
 worksheet.getColumn(widthColIndex).width = 6;
 }
                            else {
 worksheet.getColumn(widthColIndex).width = 10;
 }
                            widthColIndex++;
                        }
);
                        if (c < s.lc - 1) widthColIndex++;
                    }
                    let allDefects = [];
                    for (let r = 0;
 r < s.rc;
 r++) {
                        for (let c = 0;
 c < 1 + s.lc * 6;
 c++) {
                            const cellData = s.rows[r] ? s.rows[r][c] : null;
                            if (cellData && cellData.defects && cellData.defects.length > 0) {
                                const lotIdx = Math.floor((c - 1) / 6);
 let blockIndex = 0;
                                for(let i=0;
 i<=r;
 i++){
 if(s.rows[i] && s.rows[i][1+lotIdx*6] && s.rows[i][1+lotIdx*6].db) blockIndex++;
 }
                                blockIndex = Math.min(blockIndex, (s.lots[lotIdx] || []).length - 1);
 if (blockIndex < 0) blockIndex = 0;
                                const lotBlock = s.lots[lotIdx] ? s.lots[lotIdx][blockIndex] : null;
                                const lotNo = lotBlock ? `${
lotBlock.s||''}
-${
lotBlock.k||''}
-${
lotBlock.u||''}
` : '';
                                const buzai = getInheritedValue(r, 0, true, s.rows);
                                const kai = getInheritedValue(r, 1 + lotIdx * 6 + 0, true, s.rows);
                                const houkou = getInheritedValue(r, 1 + lotIdx * 6 + 1, true, s.rows);
                                const bui = getInheritedValue(r, 1 + lotIdx * 6 + 2, true, s.rows);
                                const edaban = s.rows[r][1 + lotIdx * 6 + 3] && s.rows[r][1 + lotIdx * 6 + 3].t ? s.rows[r][1 + lotIdx * 6 + 3].t.trim() : '';
                                const kensasu = s.rows[r][1 + lotIdx * 6 + 5] && s.rows[r][1 + lotIdx * 6 + 5].t ? s.rows[r][1 + lotIdx * 6 + 5].t.trim() : '';
                                cellData.defects.forEach((def, index) => {
                                    let posParts = [];
                                    if (kai) posParts.push(kai + 'F');
                                    if (houkou) posParts.push(houkou);
                                    if (bui) posParts.push(bui);
                                    if (((def.mode || def.m) === 'UT' || (def.mode || def.m) === 'VT') && edaban) {
 posParts.push(edaban);
 }
                                    const posStr = ((def.mode || def.m) === 'Suminiku') ? kensasu : posParts.join('-');
                                    allDefects.push({
 lotNo, buzai, pos: posStr, dataNo: index + 1, ...def }
);
                                 }
);
                            }
                        }
                    }
                    if (allDefects.length > 0) {
                        worksheet.addRow([]);
                        const utDefects = allDefects.filter(d => d.mode === 'UT');
                        const vtDefects = allDefects.filter(d => d.mode === 'VT');
                        const maDefects = allDefects.filter(d => d.mode === 'Misalign');
                        if(utDefects.length > 0) {
                            const tRow = worksheet.addRow(['【UT欠陥記録】']);
 tRow.font = {
 bold: true }
;
                            const hRow = worksheet.addRow(['ロット番号','部材名','検査位置','NO','探傷長','板厚1','板厚2','開先形状','STB角','X','Y','W','k','d','指示長','評価長','総和','合否','探傷面','方法','領域','補修後']);
                            hRow.font = {
 bold: true }
;
 hRow.eachCell(c => c.fill = {
 type: 'pattern', pattern: 'solid', fgColor: {
 argb: 'FFF3F4F6' }
 }
);
                            utDefects.forEach(d => {
 worksheet.addRow([d.lotNo, d.buzai||'', d.pos, d.dataNo, d.tansho, d.t1, d.t2, d.kaiseki, d.stb, d.x, d.y, d.w, d.k, d.d, d.siji, d.hyoka, d.sowa, d.gohi, d.men, (d.hoho||'').replace('スキップ', ''), d.ryoiki, d.hoshu ? '✓' : '']);
 }
);
                            worksheet.addRow([]);
                        }
                        if(vtDefects.length > 0) {
                            const tRow = worksheet.addRow(['【外観欠陥記録】']);
 tRow.font = {
 bold: true }
;
                            const hRow = worksheet.addRow(['ロット番号','部材名','検査位置','NO','探傷長','板厚t1','板厚t2','ダイア','探傷面','X','L','測定値','欠陥種別','備考']);
                            hRow.font = {
 bold: true }
;
 hRow.eachCell(c => c.fill = {
 type: 'pattern', pattern: 'solid', fgColor: {
 argb: 'FFF3F4F6' }
 }
);
                            vtDefects.forEach(d => {
 worksheet.addRow([d.lotNo, d.buzai||'', d.pos, d.dataNo, d.tansho, d.t1, d.t2, d.dia, d.men, d.x, d.l, d.sokutei, d.type, d.biko]);
 }
);
                            worksheet.addRow([]);
                        }
                                                if(maDefects.length > 0) {
                            const tRow = worksheet.addRow(['【食違いずれ記録】']);
 tRow.font = {
 bold: true }
;
                            const hRow = worksheet.addRow(['ロット番号','部材名','検査位置','NO','板厚 t1','板厚 t2','板厚 t3','柱、梁幅','判定基準','e1','e2','e3','ekm、ezm','備考']);
                            hRow.font = {
 bold: true }
;
 hRow.eachCell(c => c.fill = {
 type: 'pattern', pattern: 'solid', fgColor: {
 argb: 'FFF3F4F6' }
 }
);
                            maDefects.forEach(d => {
 worksheet.addRow([d.lotNo, d.buzai||'', d.pos, d.dataNo, d.t1, d.t2, d.t3, d.haba, d.kijun, d.e1, d.e2, d.e3, d.ekm_ezm, d.biko]);
 }
);
                            worksheet.addRow([]);
                        }
                                                const smDefects = allDefects.filter(d => d.mode === 'Suminiku');
                        if(smDefects.length > 0) {
                            const tRow = worksheet.addRow(['【すみ肉欠陥記録】']);
 tRow.font = {
 bold: true }
;
                            const hRow = worksheet.addRow(['ロット番号','部材名','検査位置','NO','欠陥位置','欠陥種別','欠陥箇所数','欠陥長さ(mm)','測定値(mm)']);
                            hRow.font = {
 bold: true }
;
 hRow.eachCell(c => c.fill = {
 type: 'pattern', pattern: 'solid', fgColor: {
 argb: 'FFF3F4F6' }
 }
);
                            smDefects.forEach(d => {
 worksheet.addRow([d.lotNo, d.buzai||'', d.pos, d.dataNo, d.posText||'', d.type||'', d.count||'', d.length||'', d.val||'']);
 }
);
                            worksheet.addRow([]);
                        }
                    }
                }
);
                const buffer = await workbook.xlsx.writeBuffer();
 const blob = new Blob([buffer], {
 type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
);
                const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
                const projectName = projects[currentPId] ? projects[currentPId].name : 'data';
 const dateStr = new Date().toLocaleDateString('ja-JP').replace(/\//g, '');
                a.download = `${
projectName}
_${
dateStr}
.xlsx`;
 document.body.appendChild(a);
 a.click();
 setTimeout(() => {
 document.body.removeChild(a);
 URL.revokeObjectURL(url);
 }
, 100);
            }
 catch (e) {
 console.error(e);
 alert('Excelファイルの生成中にエラーが発生しました。');
 }
 finally {
 btn.innerHTML = originalText;
 btn.disabled = false;
 }
        }
                async function executePrint(btn) {
             const originalText = btn.innerHTML;
 btn.innerHTML = '⏳ 処理中...';
 btn.disabled = true;
            try {
                closeModal();
 setMode('pencil');
 syncActiveSheetToModel();
 document.body.classList.add('pdf-export-mode');
                const pdfContainer = document.createElement('div');
 pdfContainer.className = 'pdf-container';
                sheets.forEach((s, sheetIndex) => {
                    const sheetWrapper = document.createElement('div');
 sheetWrapper.className = 'sheet-wrapper';
                    if (sheetIndex > 0) {
 sheetWrapper.classList.add('pdf-page-break');
 sheetWrapper.style.pageBreakBefore = 'always';
 sheetWrapper.style.breakBefore = 'page';
 }
                    const titleDiv = document.createElement('div');
 titleDiv.style.marginBottom = '5px';
                     const insText = (recordInfo.inspectors && recordInfo.inspectors.length > 0) ? recordInfo.inspectors.join('、') : '未選択';
                    const dateText = recordInfo.date || '未設定';
                    titleDiv.innerHTML = `<div style="display:flex;
 justify-content:space-between;
 align-items:flex-end;
">                        <div style="font-size:12px;
 font-weight:bold;
">【 ${
s.name}
 】</div>                        <div style="font-size:10px;
 font-weight:normal;
 text-align:right;
 color:#333;
">                            <span style="margin-right:15px;
">検査日: <span style="font-weight:bold;
 border-bottom:1px solid #333;
 padding:0 5px;
">${
dateText}
</span></span>                            <span>検査員: <span style="font-weight:bold;
 border-bottom:1px solid #333;
 padding:0 5px;
">${
insText}
</span></span>                        </div>                    </div>`;
                    sheetWrapper.appendChild(titleDiv);
                    const sums = Array.from({
length: s.lc}
, () => [0]);
                    for(let r = 0;
 r < s.rc;
 r++){
                        for(let c = 0;
 c < s.lc;
 c++){
                            const blockIndex = sums[c].length - 1;
 const tdData = s.rows[r] ? s.rows[r][1 + c*6 + 5] : null;
                            if(tdData && tdData.t){
 const match = tdData.t.match(/-?\d+/);
 if (match) sums[c][blockIndex] += parseInt(match[0], 10);
 }
                            const tdAny = s.rows[r] ? s.rows[r][1 + c*6] : null;
 if(tdAny && tdAny.db) sums[c].push(0);
                        }
                    }
                    let lastDataIndex = -1;
                    for(let r = s.rc - 1;
 r >= 0;
 r--){
 let hasData = false;
 const rData = s.rows[r];
 if(rData){
 for(let c = 0;
 c < rData.length;
 c++){
 if(rData[c] && rData[c].t.trim() !== '') {
 hasData = true;
 break;
 }
 }
 }
 if(hasData) {
 lastDataIndex = r;
 break;
 }
 }
                    const table = document.createElement('table');
 table.className = 'print-table text-center text-sm';
                    const thead = document.createElement('thead');
 const tr1 = document.createElement('tr');
 const tr2 = document.createElement('tr');
 tr2.className = 'header-row-2';
                    const thInfo = document.createElement('th');
 thInfo.className = 'p-1 bg-gray-100 border-thick-left border-thick-right border-thick-top border-thick-bottom';
 const infoParts = s.sheetInfo ? [s.sheetInfo.setsu, s.sheetInfo.taishou, s.sheetInfo.sonota, s.sheetInfo.custom].filter(v => v) : [];
                    thInfo.innerHTML = `<div class="text-[10px] text-gray-500 mb-0.5">シート情報</div><div class="font-bold text-xs text-blue-700 whitespace-pre-wrap leading-tight">${
infoParts.length > 0 ? infoParts.join('\n') : '未設定'}
</div>`;
 tr1.appendChild(thInfo);
                    const thBuzai = document.createElement('th');
 thBuzai.className = 'p-1 text-xs bg-gray-50 border-thick-left border-thick-right border-thick-top border-thick-bottom';
 thBuzai.textContent = '部材番号';
 tr2.appendChild(thBuzai);
                    for(let c = 0;
 c < s.lc;
 c++){
                        let hasUT = false;
 let hasSuminiku = false;
 const lotBlocks = s.lots[c] || [];
 lotBlocks.forEach(lb => {
 if(isUtKigou(lb.k)) hasUT = true;
 if(isSuminikuKigou(lb.k)) hasSuminiku = true;
 }
);
 const showBikou = !!(s.lotBikou && s.lotBikou[c]);
                        let colSpanLen = 4;
 if(hasUT) colSpanLen++;
 if(showBikou) colSpanLen++;
 if(hasSuminiku) colSpanLen = 1;
 const thLot = document.createElement('th');
 thLot.className = 'p-1 bg-blue-50 border-thick-left border-thick-right border-thick-top border-thick-bottom';
 thLot.colSpan = colSpanLen;
                        const cont = document.createElement('div');
 cont.className = 'flex-1 flex flex-col gap-0.5 justify-center w-full';
                        (lotBlocks.length > 0 ? lotBlocks : [{
s:'',k:'',u:'',c:'black'}
]).forEach((lb, idx) => {
                            const w = document.createElement('div');
 w.className = 'flex items-stretch justify-between gap-0 w-full';
                            const lDiv = document.createElement('div');
 lDiv.className = 'bg-white border rounded-lg p-0.5 flex-1 text-[10px] font-bold text-center';
 const tColorClass = {
black: 'text-gray-800', red: 'text-red-600', blue: 'text-blue-600', green: 'text-green-600'}
[lb.c || 'black'];
 lDiv.innerHTML = `<span class="${
tColorClass}
">${
(lb.s||lb.k||lb.u) ? `${
lb.s}
-${
lb.k}
-${
lb.u}
` : ''}
</span>`;
                            const sTxt = sums[c][idx] !== undefined ? sums[c][idx] : 0;
 const sDiv = document.createElement('div');
 sDiv.className = 'kensasu-sum border border-gray-800 bg-white font-bold text-[10px] px-0.5 flex items-center justify-center shrink-0';
 sDiv.textContent = sTxt;
                            w.appendChild(lDiv);
 w.appendChild(sDiv);
 cont.appendChild(w);
                        }
);
                        thLot.appendChild(cont);
 tr1.appendChild(thLot);
                        const labels = ['階', '方向', '部位', '枝番', '備考', '検査数'];
                        labels.forEach((lbl, idx) => {
                             let skip = false;
 if (hasSuminiku && idx < 5) skip = true;
 else if (idx === 3 && !hasUT) skip = true;
 else if (idx === 4 && !showBikou) skip = true;
                            if (skip) return;
                             const thItem = document.createElement('th');
 let isFirstLbl = true;
 for(let i=0;
 i<idx;
 i++){
 let s=false;
 if(hasSuminiku && i<5) s=true;
 else if(i===3 && !hasUT) s=true;
 else if(i===4 && !showBikou) s=true;
 if(!s){
 isFirstLbl=false;
 break;
 }
 }
 let isLastLbl = true;
 for(let i=idx+1;
 i<labels.length;
 i++){
 let s=false;
 if(hasSuminiku && i<5) s=true;
 else if(i===3 && !hasUT) s=true;
 else if(i===4 && !showBikou) s=true;
 if(!s){
 isLastLbl=false;
 break;
 }
 }
 thItem.className = `p-0.5 text-[10px] bg-gray-50 ${
isFirstLbl ? 'border-thick-left' : ''}
 ${
isLastLbl ? 'border-thick-right' : ''}
 border-thick-top border-thick-bottom`;
 thItem.textContent = lbl;
 tr2.appendChild(thItem);
                         }
);
                    }
                    thead.appendChild(tr1);
 thead.appendChild(tr2);
 table.appendChild(thead);
                    let currentTbody = document.createElement('tbody');
 currentTbody.className = 'print-block';
 table.appendChild(currentTbody);
                    for(let r = 0;
 r <= lastDataIndex;
 r++){
                        const rData = s.rows[r] || [];
 const isThick = s.thick && s.thick.includes(r);
 const tr = document.createElement('tr');
 if (isThick) tr.classList.add('row-thick-border');
                        const rowNumStr = ((r + 1) % 10 === 0) ? (r + 1) : "";
 const tdBuzai = document.createElement('td');
 tdBuzai.className = 'font-bold text-xs row-num-cell relative border-thick-left border-thick-right';
                                                const bText = rData[0] ? rData[0].t : '';
                        tdBuzai.innerHTML = `<span class="main-text">${
bText}
</span>`;
                         tdBuzai.dataset.rowNum = rowNumStr;
                        if(rData[0] && rData[0].c) {
 const tc = {
black: 'text-gray-800', red: 'text-red-600', blue: 'text-blue-600', green: 'text-green-600'}
[rData[0].c];
 if(tc) tdBuzai.classList.add(tc);
 }
                        tr.appendChild(tdBuzai);
                        let hasDouble = false;
                        for(let c = 0;
 c < s.lc;
 c++){
                            let hasUT = false;
 let hasSuminiku = false;
 const lotBlocks = s.lots[c] || [];
 lotBlocks.forEach(lb => {
 if(isUtKigou(lb.k)) hasUT = true;
 if(isSuminikuKigou(lb.k)) hasSuminiku = true;
 }
);
 const showBikou = !!(s.lotBikou && s.lotBikou[c]);
                            for(let k = 0;
 k < 6;
 k++){
                                let skip = false;
 if (hasSuminiku && k < 5) skip = true;
 else if (k === 3 && !hasUT) skip = true;
 else if (k === 4 && !showBikou) skip = true;
                                if (skip) continue;
                                 const cellD = rData[1 + c*6 + k] || {
t:'', c:'black', db:false, defects:[]}
;
                                const td = document.createElement('td');
 let isFirstK = true;
 for(let i=0;
 i<k;
 i++){
 let s=false;
 if(hasSuminiku && i<5) s=true;
 else if(i===3 && !hasUT) s=true;
 else if(i===4 && !showBikou) s=true;
 if(!s){
 isFirstK=false;
 break;
 }
 }
 let isLastK = true;
 for(let i=k+1;
 i<6;
 i++){
 let s=false;
 if(hasSuminiku && i<5) s=true;
 else if(i===3 && !hasUT) s=true;
 else if(i===4 && !showBikou) s=true;
 if(!s){
 isLastK=false;
 break;
 }
 }
 td.className = `text-xs font-bold ${
isFirstK ? 'border-thick-left' : ''}
 ${
isLastK ? 'border-thick-right' : ''}
 ${
cellD.db ? 'cell-double-border' : ''}
`;
                                                                let cHtml = `<span class="main-text">${
cellD.t}
</span>`;
                                if(cellD.defects && cellD.defects.length > 0) {
                                     if(cellD.defects.some(d=>d.mode==='UT')) cHtml += `<div class="text-[8px] text-red-600 font-normal leading-[1.1] mt-0.5 whitespace-normal break-words">※UT記録あり</div>`;
                                     if(cellD.defects.some(d=>d.mode==='VT')) cHtml += `<div class="text-[8px] text-blue-600 font-normal leading-[1.1] mt-0.5 whitespace-normal break-words">※外観記録あり</div>`;
                                     if(cellD.defects.some(d=>d.mode==='Misalign')) cHtml += `<div class="text-[8px] text-green-600 font-normal leading-[1.1] mt-0.5 whitespace-normal break-words">※食違い記録あり</div>`;
                                     if(cellD.defects.some(d=>d.mode==='Suminiku')) cHtml += `<div class="text-[8px] text-orange-600 font-normal leading-[1.1] mt-0.5 whitespace-normal break-words">※すみ肉記録あり</div>`;
                                }
                                td.innerHTML = cHtml;
                                if(cellD.c) {
 const tc = {
black: 'text-gray-800', red: 'text-red-600', blue: 'text-blue-600', green: 'text-green-600'}
[cellD.c];
 if(tc) td.classList.add(tc);
 }
                                tr.appendChild(td);
 if (cellD.db) hasDouble = true;
                            }
                        }
                        currentTbody.appendChild(tr);
                        if((isThick || hasDouble) && r < lastDataIndex){
 currentTbody = document.createElement('tbody');
 currentTbody.className = 'print-block';
 table.appendChild(currentTbody);
 }
                    }
                    sheetWrapper.appendChild(table);
                    /* --- 欠陥記録一覧のPDF出力 --- */                    let allDefects = [];
                    for (let r = 0;
 r <= lastDataIndex;
 r++) {
                        for (let c = 0;
 c < 1 + s.lc * 6;
 c++) {
                            const cellData = s.rows[r] ? s.rows[r][c] : null;
                            if (cellData && cellData.defects && cellData.defects.length > 0) {
                                const lotIdx = Math.floor((c - 1) / 6);
 let blockIndex = 0;
                                for(let i=0;
 i<=r;
 i++){
 if(s.rows[i] && s.rows[i][1+lotIdx*6] && s.rows[i][1+lotIdx*6].db) blockIndex++;
 }
                                blockIndex = Math.min(blockIndex, (s.lots[lotIdx] || []).length - 1);
 if (blockIndex < 0) blockIndex = 0;
                                const lotBlock = s.lots[lotIdx] ? s.lots[lotIdx][blockIndex] : null;
                                const lotNo = lotBlock ? `${
lotBlock.s||''}
-${
lotBlock.k||''}
-${
lotBlock.u||''}
` : '';
                                const buzai = getInheritedValue(r, 0, true, s.rows);
                                const kai = getInheritedValue(r, 1 + lotIdx * 6 + 0, true, s.rows);
                                const houkou = getInheritedValue(r, 1 + lotIdx * 6 + 1, true, s.rows);
                                const bui = getInheritedValue(r, 1 + lotIdx * 6 + 2, true, s.rows);
                                const edaban = s.rows[r][1 + lotIdx * 6 + 3] && s.rows[r][1 + lotIdx * 6 + 3].t ? s.rows[r][1 + lotIdx * 6 + 3].t.trim() : '';
                                const kensasu = s.rows[r][1 + lotIdx * 6 + 5] && s.rows[r][1 + lotIdx * 6 + 5].t ? s.rows[r][1 + lotIdx * 6 + 5].t.trim() : '';
                                cellData.defects.forEach((def, index) => {
                                    let posParts = [];
                                    if (kai) posParts.push(kai + 'F');
                                    if (houkou) posParts.push(houkou);
                                    if (bui) posParts.push(bui);
                                    if (((def.mode || def.m) === 'UT' || (def.mode || def.m) === 'VT') && edaban) {
 posParts.push(edaban);
 }
                                    const posStr = ((def.mode || def.m) === 'Suminiku') ? kensasu : posParts.join('-');
                                    allDefects.push({
 lotNo, buzai, pos: posStr, dataNo: index + 1, ...def }
);
                                 }
);
                            }
                        }
                    }
                    if (allDefects.length > 0) {
                        const utDefects = allDefects.filter(d => d.mode === 'UT');
                        const vtDefects = allDefects.filter(d => d.mode === 'VT');
                        const maDefects = allDefects.filter(d => d.mode === 'Misalign');
                        const suDefects = allDefects.filter(d => d.mode === 'Suminiku');
                        const defectWrapper = document.createElement('div');
                        defectWrapper.className = 'print-block';
                        defectWrapper.style.marginTop = '20px';
                        if (utDefects.length > 0) {
                            const title = document.createElement('div');
 title.innerHTML = `<strong>【UT欠陥記録】</strong> ${
s.name}
`;
 title.className = 'mb-1 text-sm';
 defectWrapper.appendChild(title);
                            const tUT = document.createElement('table');
 tUT.className = 'print-table text-center mb-4 w-full';
                            tUT.innerHTML = `<thead><tr class="bg-gray-100"><th>ロット</th><th>部材名</th><th>検査位置</th><th>NO</th><th>探傷長</th><th>板厚 t1</th><th>板厚 t2</th><th>解析</th><th>STB屈折角</th><th>X</th><th>Y</th><th>W</th><th>k</th><th>d</th><th>指示長さ</th><th>評価長さ</th><th>総和</th><th>合否</th><th>面</th><th>方法</th><th>領域</th><th>補修後</th></tr></thead><tbody>                                ${
utDefects.map(d => `<tr><td>${
d.lotNo}
</td><td>${
d.buzai||''}
</td><td>${
d.pos}
</td><td>${
d.dataNo}
</td><td>${
d.tansho||''}
</td><td>${
d.t1||''}
</td><td>${
d.t2||''}
</td><td>${
d.kaiseki||''}
</td><td>${
d.stb||''}
</td><td>${
d.x||''}
</td><td>${
d.y||''}
</td><td>${
d.w||''}
</td><td>${
d.k||''}
</td><td>${
d.d||''}
</td><td>${
d.siji||''}
</td><td>${
d.hyoka||''}
</td><td>${
d.sowa||''}
</td><td>${
d.gohi||''}
</td><td>${
d.men||''}
</td><td>${
(d.hoho||'').replace('スキップ', '')}
</td><td>${
d.ryoiki||''}
</td><td>${
d.hoshu ? '✓' : ''}
</td></tr>`).join('')}
                            </tbody>`;
                            defectWrapper.appendChild(tUT);
                        }
                        if (vtDefects.length > 0) {
                            const title = document.createElement('div');
 title.innerHTML = `<strong>【外観欠陥記録】</strong> ${
s.name}
`;
 title.className = 'mb-1 text-sm mt-4';
 defectWrapper.appendChild(title);
                            const tVT = document.createElement('table');
 tVT.className = 'print-table text-center w-full';
                            tVT.innerHTML = `<thead><tr class="bg-gray-100"><th>ロット</th><th>部材名</th><th>検査位置</th><th>NO</th><th>探傷長</th><th>板厚t1</th><th>板厚t2</th><th>ダイア</th><th>探傷面</th><th>X</th><th>L</th><th>測定値</th><th>欠陥種別</th><th>備考</th></tr></thead><tbody>                                ${
vtDefects.map(d => `<tr><td>${
d.lotNo}
</td><td>${
d.buzai||''}
</td><td>${
d.pos}
</td><td>${
d.dataNo}
</td><td>${
d.tansho||''}
</td><td>${
d.t1||''}
</td><td>${
d.t2||''}
</td><td>${
d.dia||''}
</td><td>${
d.men||''}
</td><td>${
d.x||''}
</td><td>${
d.l||''}
</td><td>${
d.sokutei||''}
</td><td>${
d.type||''}
</td><td>${
d.biko||''}
</td></tr>`).join('')}
                            </tbody>`;
                            defectWrapper.appendChild(tVT);
                        }
                                                if (maDefects.length > 0) {
                            const title = document.createElement('div');
 title.innerHTML = `<strong>【食違いずれ記録】</strong> ${
s.name}
`;
 title.className = 'mb-1 text-sm mt-4';
 defectWrapper.appendChild(title);
                            const tMA = document.createElement('table');
 tMA.className = 'print-table text-center w-full';
                            tMA.innerHTML = `<thead><tr class="bg-gray-100"><th>ロット</th><th>部材名</th><th>検査位置</th><th>NO</th><th>板厚 t1</th><th>板厚 t2</th><th>板厚 t3</th><th>柱、梁幅</th><th>判定基準</th><th>e1</th><th>e2</th><th>e3</th><th>ekm、ezm</th><th>備考</th></tr></thead><tbody>                                ${
maDefects.map(d => `<tr><td>${
d.lotNo}
</td><td>${
d.buzai||''}
</td><td>${
d.pos}
</td><td>${
d.dataNo}
</td><td>${
d.t1||''}
</td><td>${
d.t2||''}
</td><td>${
d.t3||''}
</td><td>${
d.haba||''}
</td><td>${
d.kijun||''}
</td><td>${
d.e1||''}
</td><td>${
d.e2||''}
</td><td>${
d.e3||''}
</td><td>${
d.ekm_ezm||''}
</td><td>${
d.biko||''}
</td></tr>`).join('')}
                            </tbody>`;
                            defectWrapper.appendChild(tMA);
                        }
                        if (suDefects.length > 0) {
                            const title = document.createElement('div');
 title.innerHTML = `<strong>【すみ肉欠陥記録】</strong> ${
s.name}
`;
 title.className = 'mb-1 text-sm mt-4';
 defectWrapper.appendChild(title);
                            const tSU = document.createElement('table');
 tSU.className = 'print-table text-center w-full';
                            tSU.innerHTML = `<thead><tr class="bg-gray-100"><th>ロット</th><th>部材名</th><th>検査位置</th><th>NO</th><th>欠陥位置</th><th>欠陥種別</th><th>欠陥箇所数</th><th>欠陥長さ(mm)</th><th>測定値(mm)</th></tr></thead><tbody>                                ${
suDefects.map(d => `<tr><td>${
d.lotNo}
</td><td>${
d.buzai||''}
</td><td>${
d.pos}
</td><td>${
d.dataNo}
</td><td>${
d.posText||''}
</td><td>${
d.type||''}
</td><td>${
d.count||''}
</td><td>${
d.length||''}
</td><td>${
d.val||''}
</td></tr>`).join('')}
                            </tbody>`;
                            defectWrapper.appendChild(tSU);
                        }
                                                sheetWrapper.appendChild(defectWrapper);
                    }
                    pdfContainer.appendChild(sheetWrapper);
                }
);
                const mainView = document.getElementById('view-input');
 document.body.appendChild(pdfContainer);
                                /* PC・iPadともにブラウザ標準の印刷ダイアログを呼び出す */                setTimeout(() => {
                    window.print();
                                        /* CSSの @media print で表示制御しているため、JSでの非表示処理は不要です。 */                    /* 印刷ダイアログ終了後にDOMから削除するだけで済みます。 */                    /* Safari等で非同期になるため、少し余裕を持たせて削除します。 */                    setTimeout(() => {
                        if (document.body.contains(pdfContainer)) {
                            document.body.removeChild(pdfContainer);
                        }
                        btn.innerHTML = originalText;
 btn.disabled = false;
                        document.body.classList.remove('pdf-export-mode');
                    }
, 3000);
 /* 印刷ダイアログが表示されている間も裏で消えて問題ない(print時にはDOMが存在していれば良く、印刷スプールに入ればOK) */                              /* 念のため少し長めに設定。 */                }
, 100);
            }
 catch (e) {
                 console.error(e);
                 alert('印刷画面の準備中にエラーが発生しました。');
                 document.getElementById('view-input').style.display = 'flex';
                 document.body.classList.remove('pdf-export-mode');
                 btn.innerHTML = originalText;
 btn.disabled = false;
            }
        }
    
let currentZoom=1;
function updateZoomDisplay(){

    const display=document.getElementById('zoomLevelDisplay');

    if(display)display.innerText=Math.round(currentZoom*100)+'%';

    const container=document.getElementById('tableWrapper');

    const transformContainer=document.getElementById('transformContainer');

    if(container && transformContainer){

        container.style.zoom='';

        container.style.transform='scale('+currentZoom+')';

        container.style.transformOrigin='0 0';

        container.style.width='';
 
        
        // Update transformContainer size to force scrollbars
        const rect = container.getBoundingClientRect();

        // getBoundingClientRect gives the scaled size! So we can use it to set the container size.
        // Wait, rect includes scaling. So rect.width is already scaled.
        // But if container.style.width is empty, it takes intrinsic size.
        // To be safe, we calculate based on scrollWidth of the table inside.
        const table = document.getElementById('mainTable');

        if(table) {

            transformContainer.style.width = (table.offsetWidth * currentZoom) + 'px';

            transformContainer.style.height = (table.offsetHeight * currentZoom) + 'px';

        }

    }

    const header=document.getElementById('headerRow1');

    if(header) header.style.zoom='';

}
function zoomIn(){
if(currentZoom<3){
currentZoom+=0.1;
updateZoomDisplay();
}
}
function zoomOut(){
if(currentZoom>0.2){
currentZoom-=0.1;
updateZoomDisplay();
}
}
function resetZoom(){
currentZoom=1;
updateZoomDisplay();
}


(function() {

    let initialDistance = null;

    let initialZoom = 1;

    const scrollArea = document.getElementById("tableScrollArea");

    if(scrollArea) {

        scrollArea.addEventListener("touchstart", function(e) {

            if(e.touches.length === 2) {

                initialDistance = Math.hypot(
                    e.touches[0].pageX - e.touches[1].pageX,
                    e.touches[0].pageY - e.touches[1].pageY
                );

                initialZoom = currentZoom;

                if(e.cancelable) e.preventDefault();

            }

        }
, {
passive: false}
);

        scrollArea.addEventListener("touchmove", function(e) {

            if(e.touches.length === 2 && initialDistance) {

                const currentDistance = Math.hypot(
                    e.touches[0].pageX - e.touches[1].pageX,
                    e.touches[0].pageY - e.touches[1].pageY
                );

                const scale = currentDistance / initialDistance;

                let newZoom = initialZoom * scale;

                if(newZoom > 3) newZoom = 3;

                if(newZoom < 0.2) newZoom = 0.2;

                currentZoom = newZoom;

                updateZoomDisplay();

                if(e.cancelable) e.preventDefault();

            }

        }
, {
passive: false}
);

        scrollArea.addEventListener("touchend", function(e) {

            if(e.touches.length < 2) {

                initialDistance = null;

            }

        }
);

    }

}
)();



window.isPinching = false;

window.lastPinchTime = 0;


if(typeof originalOpenModal === "undefined" && typeof window.openModal === "function") {

    window.originalOpenModal = window.openModal;

    window.openModal = function(id) {

        if(id === "actionMenuModal" && (window.isPinching || Date.now() - window.lastPinchTime < 500)) {

            return;

        }

        window.originalOpenModal(id);

    }
;

}


(function() {

    let initialDistance = null;

    let initialZoom = 1;

    let initialScrollLeft = 0;

    let initialScrollTop = 0;

    let pinchCenterX = 0;

    let pinchCenterY = 0;

    
    const scrollArea = document.getElementById("tableScrollArea");

    if(scrollArea) {

        scrollArea.addEventListener("touchstart", function(e) {

            if(e.touches.length >= 2) {

                window.isPinching = true;

                window.lastPinchTime = Date.now();

                initialDistance = Math.hypot(
                    e.touches[0].pageX - e.touches[1].pageX,
                    e.touches[0].pageY - e.touches[1].pageY
                );

                initialZoom = currentZoom;

                
                const rect = scrollArea.getBoundingClientRect();

                pinchCenterX = ((e.touches[0].clientX + e.touches[1].clientX) / 2) - rect.left;

                pinchCenterY = ((e.touches[0].clientY + e.touches[1].clientY) / 2) - rect.top;

                
                initialScrollLeft = scrollArea.scrollLeft;

                initialScrollTop = scrollArea.scrollTop;

                
            }

        }
, {
passive: true, capture: true}
);

        
        scrollArea.addEventListener("touchmove", function(e) {

            if(e.touches.length >= 2) {

                window.isPinching = true;

                window.lastPinchTime = Date.now();

                if(initialDistance) {

                    const currentDistance = Math.hypot(
                        e.touches[0].pageX - e.touches[1].pageX,
                        e.touches[0].pageY - e.touches[1].pageY
                    );

                    const scale = currentDistance / initialDistance;

                    let newZoom = initialZoom * scale;

                    if(newZoom > 3) newZoom = 3;

                    if(newZoom < 0.2) newZoom = 0.2;

                    
                    const oldZoom = currentZoom;

                    currentZoom = newZoom;

                    
                    updateZoomDisplay();

                    
                    // Adjust scroll to center around the pinch
                    const newScrollLeft = ((pinchCenterX + initialScrollLeft) / initialZoom) * newZoom - pinchCenterX;

                    const newScrollTop = ((pinchCenterY + initialScrollTop) / initialZoom) * newZoom - pinchCenterY;

                    
                    scrollArea.scrollLeft = newScrollLeft;

                    scrollArea.scrollTop = newScrollTop;

                }

                if(e.cancelable) e.preventDefault();

            }

        }
, {
passive: false, capture: true}
);

        
        scrollArea.addEventListener("touchend", function(e) {

            if(e.touches.length < 2) {

                window.isPinching = false;

                window.lastPinchTime = Date.now();

                initialDistance = null;

            }

        }
, {
capture: true}
);

    }

}
)();



document.addEventListener('DOMContentLoaded', function() {

    const modalOverlay = document.getElementById('modalOverlay');

    if(modalOverlay && modalOverlay.parentNode !== document.body) {

        document.body.appendChild(modalOverlay);

    }

    // Also move custom input or action menus if they exist outside
    const actionMenu = document.getElementById('actionMenuModal');

    if(actionMenu && actionMenu.parentNode !== modalOverlay && actionMenu.parentNode !== document.body) {

        document.body.appendChild(actionMenu);

    }

    
    const tableScrollArea = document.getElementById('tableScrollArea');

    const tableWrapper = document.getElementById('tableWrapper');

    if(tableScrollArea && tableWrapper && !document.getElementById('transformContainer')) {

        const transformContainer = document.createElement('div');

        transformContainer.id = 'transformContainer';

        tableWrapper.parentNode.insertBefore(transformContainer, tableWrapper);

        transformContainer.appendChild(tableWrapper);

    }

}
);




