const SHEET_ID = '1jLGdcmLq-4BgaYwXN9WewsH4slUDTwKA5H4XEsMIv5w';
const API_KEY = 'AIzaSyDJcmG7-_yl0TXrbRbF6u4U0lfvmL-SXhA';
const SHEET_NAME = 'Dados Site';

document.getElementById('dataForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Array.from(formData.values());
    appendData(data);
});

function appendData(data) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}!A2:H:append?valueInputOption=USER_ENTERED&key=${API_KEY}`;

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            range: `${SHEET_NAME}!A2:H2`,
            majorDimension: 'ROWS',
            values: [data]
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro na requisição: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        document.getElementById('message').textContent = 'Dados inseridos com sucesso!';
        loadData(); // Recarrega os dados após a inserção
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
            throw new Error('Erro na requisição: ' + response.statusText);
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
            tableBody.innerHTML = '<tr><td colspan="9">Nenhum dado encontrado.</td></tr>';
        }
    })
    .catch(error => {
        console.error('Erro ao carregar dados:', error);
        document.getElementById('message').textContent = 'Erro ao carregar dados. Verifique o console para mais detalhes.';
    });
}

function searchData() {
    const searchValue = document.getElementById('searchInput').value;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}!A2:H?key=${API_KEY}`;

    fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro na requisição: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        const filteredData = data.values.filter(row => row[0] === searchValue);
        const tableBody = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
        tableBody.innerHTML = '';
        if (filteredData.length > 0) {
            filteredData.forEach(row => {
                const newRow = tableBody.insertRow();
                row.forEach((cell, cellIndex) => {
                    const newCell = newRow.insertCell(cellIndex);
                    newCell.textContent = cell;
                });
                const actionCell = newRow.insertCell(row.length);
                actionCell.innerHTML = `<button onclick="editData(${data.values.indexOf(row) + 2})">Editar</button> <button onclick="deleteData(${data.values.indexOf(row) + 2})">Excluir</button>`;
            });
        } else {
            tableBody.innerHTML = '<tr><td colspan="9">Nenhum resultado encontrado.</td></tr>';
        }
    })
    .catch(error => {
        console.error('Erro ao pesquisar dados:', error);
        document.getElementById('message').textContent = 'Erro ao pesquisar dados. Verifique o console para mais detalhes.';
    });
}

function deleteData(rowIndex) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}!A${rowIndex}:H${rowIndex}?key=${API_KEY}`;

    fetch(url, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro na requisição: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log('Dados excluídos com sucesso:', data);
        loadData(); // Recarrega os dados após a exclusão
    })
    .catch(error => {
        console.error('Erro ao excluir dados:', error);
        document.getElementById('message').textContent = 'Erro ao excluir dados. Verifique o console para mais detalhes.';
    });
}

// Carregar dados ao iniciar
loadData();
