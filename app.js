const sitesContainer = document.getElementById('sites-container');
const monthDisplay = document.getElementById('current-month');

// Stato dell'app: caricamento da LocalStorage o inizializzazione
let state = JSON.parse(localStorage.getItem('webCheckData')) || {
    lastUpdate: new Date().getMonth(),
    sites: []
};

// Controllo reset mensile: se è cambiato il mese, azzera i checkbox
const checkMonthlyReset = () => {
    const currentMonth = new Date().getMonth();
    if (state.lastUpdate !== currentMonth) {
        state.sites.forEach(site => {
            site.tasks.forEach(t => t.completed = false);
        });
        state.lastUpdate = currentMonth;
        save();
    }
};

const save = () => {
    localStorage.setItem('webCheckData', JSON.stringify(state));
    render();
};

// Funzione per salvare le note senza ricaricare tutta l'interfaccia (evita lag)
window.updateNotes = (sIdx, value) => {
    state.sites[sIdx].notes = value;
    localStorage.setItem('webCheckData', JSON.stringify(state));
};

const render = () => {
    const months = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
    monthDisplay.innerText = `Manutenzione di ${months[new Date().getMonth()]}`;

    sitesContainer.innerHTML = state.sites.map((site, sIdx) => `
        <div class="bg-white rounded-xl shadow-sm p-4 border-l-4 ${getStatusColor(site)} transition-all">
            <div class="flex justify-between items-center mb-3">
                <h2 class="font-bold text-lg text-gray-800">${site.name}</h2>
                <button onclick="removeSite(${sIdx})" class="text-red-400 text-sm hover:text-red-600">Elimina</button>
            </div>
            
            <div class="grid grid-cols-1 gap-2 mb-4">
                ${site.tasks.map((task, tIdx) => `
                    <label class="flex items-center space-x-3 p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors">
                        <input type="checkbox" ${task.completed ? 'checked' : ''} 
                            onchange="toggleTask(${sIdx}, ${tIdx})"
                            class="w-5 h-5 text-blue-600 rounded">
                        <span class="${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}">${task.name}</span>
                    </label>
                `).join('')}
            </div>

            <div class="mt-2">
                <label class="text-xs font-semibold text-gray-400 uppercase">Note libere</label>
                <textarea 
                    oninput="updateNotes(${sIdx}, this.value)"
                    placeholder="Es: credenziali, data ultimo backup, errori..."
                    class="w-full mt-1 p-2 text-sm bg-blue-50 border-none rounded-lg focus:ring-2 focus:ring-blue-200 outline-none resizable-none"
                    rows="2">${site.notes || ''}</textarea>
            </div>
        </div>
    `).join('');
};

const getStatusColor = (site) => {
    const done = site.tasks.filter(t => t.completed).length;
    if (done === 0) return 'border-red-500';
    if (done === site.tasks.length) return 'border-green-500';
    return 'border-yellow-500';
};

window.toggleTask = (sIdx, tIdx) => {
    state.sites[sIdx].tasks[tIdx].completed = !state.sites[sIdx].tasks[tIdx].completed;
    save();
};

window.removeSite = (idx) => {
    if(confirm('Eliminare definitivamente questo sito?')) {
        state.sites.splice(idx, 1);
        save();
    }
};

document.getElementById('add-site-btn').onclick = () => {
    const name = prompt("Nome del sito:");
    if (name) {
        state.sites.push({
            name,
            notes: "", // Inizializzazione campo note
            tasks: [
                {name: "Backup Database", completed: false},
                {name: "Backup Spazio Web", completed: false}, // Nuovo Task aggiunto
                {name: "Update Core/Plugin", completed: false},
                {name: "Check Sicurezza", completed: false},
                {name: "Test Velocità", completed: false}
            ]
        });
        save();
    }
};

checkMonthlyReset();
render();