$content = Get-Content -Path .\nyuuryoku.html -Raw -Encoding UTF8

$syncLotHeaderStr = @"
        function syncLotHeaderCount(lotIdx) {
            const tbody = $('tableBody'); let splitCount = 0;
            Array.from(tbody.children).forEach(tr => { const cell = tr.children[1 + lotIdx * 6]; if (cell && cell.classList.contains('cell-double-border')) splitCount++; });
            const targetCount = splitCount + 1; const h1 = $('headerRow1'), th = h1.children[lotIdx + 1]; if (!th) return;
            const container = th.querySelector('.lot-blocks-container'); const currentBlocks = container.querySelectorAll('.lot-block-wrapper');
            if (currentBlocks.length < targetCount) { for (let i = currentBlocks.length; i < targetCount; i++) container.appendChild(createLotBlock()); } else if (currentBlocks.length > targetCount) { for (let i = currentBlocks.length - 1; i >= targetCount; i--) currentBlocks[i].remove(); }
            updateStickyTop();
        }
"@

# Append syncLotHeaderCount just before splitLotAtTarget
$oldBlock1 = "function splitLotAtTarget() {"
$newBlock1 = $syncLotHeaderStr + "`n        " + "function splitLotAtTarget() {"
$content = $content.Replace($oldBlock1, $newBlock1)

# Add syncLotHeaderCount(lotIdx) to splitLotAtTarget
$oldBlock2 = @"
                if (cell) {
                    if (isSplit) cell.classList.remove('cell-double-border');
                    else cell.classList.add('cell-double-border');
                }
            }
            if (typeof syncActiveSheetToModel === 'function') syncActiveSheetToModel();
"@
$newBlock2 = @"
                if (cell) {
                    if (isSplit) cell.classList.remove('cell-double-border');
                    else cell.classList.add('cell-double-border');
                }
            }
            syncLotHeaderCount(lotIdx);
            if (typeof syncActiveSheetToModel === 'function') syncActiveSheetToModel();
"@
$content = $content.Replace($oldBlock2, $newBlock2)

# Add it back to deleteRowsFromMenu
$oldBlock3 = "reindexCells(); calcKensasuSum(); updateEdabanVisibility(); closeModal();"
$newBlock3 = "reindexCells(); for(let c=0; c<lotCount; c++) syncLotHeaderCount(c); calcKensasuSum(); updateEdabanVisibility(); closeModal();"
$content = $content.Replace($oldBlock3, $newBlock3)

Set-Content -Path .\nyuuryoku.html -Value $content -Encoding UTF8
