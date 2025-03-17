const SHEET_ID = '1UmO5Nuh4myBiZxqH3U3icmkkzGysUpjEeAMyrVekwkA'; // ID da planilha
const API_KEY = 'AIzaSyC1UDGTRm6aMgipsKLKPrsa8Eri237Ni8E'; // Chave de API
const SHEET_NAME = 'Dados Site'; // Nome da aba da planilha

document.getElementById('dataForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Array.from(formData.values());
    appendData(data);
});

function appendData(data) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}!A1:append?valueInputOption=USER_ENTERED&key=${API_KEY}`;

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            range: `${SHEET_NAME}!A1`,
            majorDimension: 'ROWS',
            values: [data]
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        document.getElementById('message').textContent = 'Dados inseridos com sucesso!';
        loadData();
    })
    .catch(error => {
        console.error('Erro ao inserir dados:', error);
        document.getElementById('message').textContent = 'Erro ao inserir dados. Verifique o console para mais detalhes.';
    });
}

function loadData() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}!A2:H?key=${API_KEY}`;

    fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro ao carregar dados: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        const tableBody = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
        tableBody.innerHTML = '';
        if (data.values && data.values.length > 0) {
            data.values.forEach((row, index) => {
                const newRow = tableBody.insertRow();
                row.forEach((cell, cellIndex) => {
                    const newCell = newRow.insertCell(cellIndex);
                    newCell.textContent = cell;
                });
                const actionCell = newRow.insertCell(row.length);
                actionCell.innerHTML = `<button onclick="editData(${index + 2})">Editar</button> <button onclick="deleteData(${index + 2})">Excluir</button>`;
            });
        } else {
            console.log('Nenhum dado encontrado na planilha.');
        }
    })
    .catch(error => console.error('Erro ao carregar dados:', error));
}

function searchData() {
    const searchValue = document.getElementById('searchInput').value;
    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}!A2:H?key=${API_KEY}`)
    .then(response => response.json())
    .then(data => {
        const filteredData = data.values.filter(row => row[0] === searchValue);
        const tableBody = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
        tableBody.innerHTML = '';
        filteredData.forEach(row => {
            const newRow = tableBody.insertRow();
            row.forEach((cell, cellIndex) => {
                const newCell = newRow.insertCell(cellIndex);
                newCell.textContent = cell;
            });
            const actionCell = newRow.insertCell(row.length);
            actionCell.innerHTML = `<button onclick="editData(${data.values.indexOf(row) + 2})">Editar</button> <button onclick="deleteData(${data.values.indexOf(row) + 2})">Excluir</button>`;
        });
    })
    .catch(error => console.error('Erro ao pesquisar dados:', error));
}

function deleteData(rowIndex) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}!A${rowIndex}:H${rowIndex}?key=${API_KEY}`;

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            requests: [
                {
                    updateCells: {
                        range: {
                            sheetId: SHEET_ID,
                            startRowIndex: rowIndex - 1,
                            endRowIndex: rowIndex,
                            startColumnIndex: 0,
                            endColumnIndex: 8
                        },
                        fields: 'userEnteredValue'
                    }
                }
            ]
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Dados excluídos com sucesso:', data);
        loadData();
    })
    .catch(error => console.error('Erro ao excluir dados:', error));
}

function editData(rowIndex) {
    const newData = prompt("Insira os novos dados separados por vírgula:");
    if (newData) {
        const dataArray = newData.split(',');
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}!A${rowIndex}:H${rowIndex}?valueInputOption=USER_ENTERED&key=${API_KEY}`;

        fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                range: `${SHEET_NAME}!A${rowIndex}:H${rowIndex}`,
                majorDimension: 'ROWS',
                values: [dataArray]
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Dados editados com sucesso:', data);
            loadData();
        })
        .catch(error => console.error('Erro ao editar dados:', error));
    }
}

// Carregar dados ao iniciar
loadData();
