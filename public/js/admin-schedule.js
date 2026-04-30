const scheduleData = document.getElementById('schedule-data').dataset;
const employeeId = parseInt(scheduleData.employeeId);
const HOUR_START = parseInt(scheduleData.hourStart);
const HOUR_HEIGHT = parseInt(scheduleData.hourHeight);

const modalAdd  = document.getElementById('modal-add');
const modalSlot = document.getElementById('modal-slot');

// Clic sur une colonne vide → ouvre la modale d'ajout
document.querySelectorAll('.sc-day-col').forEach(col => {
    col.addEventListener('click', (e) => {
        if (e.target.closest('.sc-slot')) return;

        const date = col.dataset.date;
        const rect = col.getBoundingClientRect();
        const y = e.clientY - rect.top + col.scrollTop;
        const clickedHour = Math.floor(HOUR_START + y / HOUR_HEIGHT);
        const start = Math.max(HOUR_START, Math.min(19, clickedHour));
        const end = Math.min(20, start + 1);

        document.getElementById('new-slot-date').value = date;
        document.getElementById('new-slot-date-display').value = new Date(date + 'T00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
        document.getElementById('new-slot-start').value = String(start).padStart(2, '0') + ':00';
        document.getElementById('new-slot-end').value = String(end).padStart(2, '0') + ':00';
        document.getElementById('slot-error').style.display = 'none';
        document.getElementById('add-slot-form').querySelector('select').value = 'work';

        modalAdd.showModal();
    });
});

// Clic sur un créneau existant → ouvre la modale de détail
document.querySelectorAll('.sc-slot').forEach(slot => {
    slot.addEventListener('click', () => {
        const { slotId, start, end, type, date } = slot.dataset;
        const label = type === 'work' ? 'Travail' : 'Pause';
        const dateLabel = new Date(date + 'T00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

        document.getElementById('modal-slot-title').textContent = label;
        document.getElementById('modal-slot-info').textContent = dateLabel + ' · ' + start + ' – ' + end;
        document.getElementById('btn-delete-slot').dataset.slotId = slotId;

        modalSlot.showModal();
    });
});

// Bouton supprimer dans la modale
document.getElementById('btn-delete-slot').addEventListener('click', async (e) => {
    const slotId = e.currentTarget.dataset.slotId;
    if (!confirm('Supprimer ce créneau ?')) return;
    const res = await fetch('/admin/schedule/slot/' + slotId, { method: 'DELETE' });
    if (res.ok) location.reload();
    else alert('Erreur lors de la suppression');
});

// Bouton ajouter dans la modale
document.getElementById('btn-add-slot').addEventListener('click', async () => {
    const form = document.getElementById('add-slot-form');
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const data = Object.fromEntries(new FormData(form));
    const errorEl = document.getElementById('slot-error');
    errorEl.style.display = 'none';

    const res = await fetch('/admin/schedule/' + employeeId + '/slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (res.ok) {
        modalAdd.close();
        location.reload();
    } else {
        const j = await res.json();
        errorEl.textContent = j.error;
        errorEl.style.display = 'block';
    }
});

// Formulaire contraintes
document.getElementById('restrictions-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    data.weeklyHoursTarget = parseFloat(data.weeklyHoursTarget);
    data.maxConsecutiveHours = parseFloat(data.maxConsecutiveHours);
    const res = await fetch('/admin/schedule/' + employeeId + '/restrictions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (res.ok) location.reload();
    else alert('Erreur lors de la mise à jour des contraintes');
});
