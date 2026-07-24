$content = Get-Content -Path .\nyuuryoku.html -Raw -Encoding UTF8

$brokenPattern = "function splitLotAtTarget\(\) \{.*?(?=/\* ================= 欠陥記録の管理 ================= \*/)"

$newBlock = @"
        function addRowsFromMenu() {
            const countStr = document.getElementById('addRowCount').value;
            const count = parseInt(countStr, 10) || 1;
            saveHistory();
            const fragment = document.createDocumentFragment();
            for(let i=0; i<count; i++) {
                fragment.appendChild(createRowElement());
                rowCount++;
            }
            if (targetTr && targetTr.nextSibling) {
                targetTr.parentNode.insertBefore(fragment, targetTr.nextSibling);
            } else {
                document.getElementById('tableBody').appendChild(fragment);
            }
            reindexCells();
            updateEdabanVisibility();
            if (typeof syncActiveSheetToModel === 'function') syncActiveSheetToModel();
            closeModal();
        }

        function deleteRowsFromMenu() {
            const countStr = document.getElementById('deleteRowCount').value;
            const count = parseInt(countStr, 10) || 1;
            if (!targetCellForMenu || !targetTr) return;
            let currentTarget = targetTr;
            const rowsToDelete = [];
            for (let i = 0; i < count; i++) {
                if (currentTarget) {
                    rowsToDelete.push(currentTarget);
                    currentTarget = currentTarget.nextElementSibling;
                } else break;
            }
            if (rowsToDelete.some(tr => tr.classList.contains('buzai-locked'))) {
                alert('削除対象の行にロックされた部材が含まれているため、削除できません。');
                return;
            }
            if (rowsToDelete.length === 0) return;
            let hasData = false;
            for (const tr of rowsToDelete) {
                for (const td of tr.querySelectorAll('td')) {
                    const mt = td.querySelector('.main-text');
                    if (mt && mt.textContent.trim() !== '') {
                        hasData = true;
                        break;
                    }
                }
                if (hasData) break;
            }
            if (hasData && !confirm(`消去予定の行にデータが入力されています。\n本当に ${rowsToDelete.length} 行を消去してもよろしいですか？`)) return;
            saveHistory();
            let hasThickBorder = false;
            let doubleBorders = {};
            rowsToDelete.forEach(tr => {
                if(tr.classList.contains('row-thick-border')) hasThickBorder = true;
                Array.from(tr.children).forEach((td, idx) => {
                    if (td.classList.contains('cell-double-border')) doubleBorders[idx] = true;
                });
            });
            const prevTr = rowsToDelete[0].previousElementSibling;
            for (const tr of rowsToDelete) tr.remove();
            rowCount -= rowsToDelete.length;
            if (rowCount <= 0) addRow(true);
            if (prevTr) {
                if (hasThickBorder) prevTr.classList.add('row-thick-border');
                Object.keys(doubleBorders).forEach(idx => {
                    if (prevTr.children[idx]) prevTr.children[idx].classList.add('cell-double-border');
                });
            }
            reindexCells();
            for(let c=0; c<lotCount; c++) syncLotHeaderCount(c);
            calcKensasuSum();
            updateEdabanVisibility();
            if (typeof syncActiveSheetToModel === 'function') syncActiveSheetToModel();
            closeModal();
        }

        function splitLotAtTarget() {
            if (!targetCellForMenu || !targetTr) return;
            saveHistory();
            targetCellForMenu.classList.toggle('cell-double-border');
            if (typeof syncActiveSheetToModel === 'function') syncActiveSheetToModel();
            closeModal();
        }
        
"@

$content = [regex]::Replace($content, $brokenPattern, $newBlock, [System.Text.RegularExpressions.RegexOptions]::Singleline)

Set-Content -Path .\nyuuryoku.html -Value $content -Encoding UTF8
