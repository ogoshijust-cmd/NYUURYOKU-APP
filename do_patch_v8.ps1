$content = Get-Content -Path .\nyuuryoku.html -Raw -Encoding UTF8

$oldBlock = @"
        function splitLotAtTarget() {
            if (!targetCellForMenu || !targetTr) return;
            saveHistory();
            const cIdx = parseInt(targetCellForMenu.dataset.c);
            if (!isNaN(cIdx)) {
                const lotIndex = Math.floor(cIdx / 6);
                const startCIdx = lotIndex * 6;
                const endCIdx = startCIdx + 5;
                const shouldAdd = !targetCellForMenu.classList.contains('cell-double-border');
                const tds = targetTr.querySelectorAll('td');
                tds.forEach(td => {
                    const c = parseInt(td.dataset.c);
                    if (!isNaN(c) && c >= startCIdx && c <= endCIdx) {
                        if (shouldAdd) {
                            td.classList.add('cell-double-border');
                        } else {
                            td.classList.remove('cell-double-border');
                        }
                    }
                });
            } else {
                targetCellForMenu.classList.toggle('cell-double-border');
            }
            if (typeof syncActiveSheetToModel === 'function') syncActiveSheetToModel();
            closeModal();
        }
"@

$newBlock = @"
        function splitLotAtTarget() {
            if (!targetCellForMenu || !targetTr) return;
            saveHistory();
            const cIdx = parseInt(targetCellForMenu.dataset.c);
            if (cIdx === 0) { closeModal(); return; }
            const lotIdx = Math.floor((cIdx - 1) / 6);
            const isSplit = targetCellForMenu.classList.contains('cell-double-border');
            for (let i = 0; i < 6; i++) {
                const cell = targetTr.children[1 + lotIdx * 6 + i];
                if (cell) {
                    if (isSplit) cell.classList.remove('cell-double-border');
                    else cell.classList.add('cell-double-border');
                }
            }
            if (typeof syncActiveSheetToModel === 'function') syncActiveSheetToModel();
            closeModal();
        }
"@

$content = $content.Replace($oldBlock, $newBlock)
Set-Content -Path .\nyuuryoku.html -Value $content -Encoding UTF8
