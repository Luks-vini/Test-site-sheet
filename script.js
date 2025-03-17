const SHEET_ID = '1GKw3MCOvujgw-_A1LzGYCd_PGNVgrBleTvUMhuewhWE'; // ID da planilha
const API_KEY = 'AIzaSyBEVWAB3OsWf4SkotdFwR0Eu2R3GaKbXz0'; // Chave de API
const SHEET_NAME = 'Dados Site'; // Nome da aba da planilha

document.getElementById('dataForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Array.from(formData.values());
    appendData(data);
});

function appendData(data) {
    // URL para adicionar dados na próxima linha vazia
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}!A1:H1:append?valueInputOption=RAW&key=${API_KEY}`;

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
    // URL para carregar todos os dados da planilha
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
    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}!A${rowIndex}:H${rowIndex}?key=${API_KEY}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        console.log('Dados excluídos com sucesso:', data);
        loadData();
    })
    .catch(error => console.error('Erro ao excluir dados:', error));
}

// Carregar dados ao iniciar
loadData();
