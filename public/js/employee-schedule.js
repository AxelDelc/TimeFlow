const modalChange = document.getElementById('modal-change');

// Clic sur un créneau → ouvre la modale de demande de modification
document.querySelectorAll('.sc-slot').forEach(slot => {
    slot.addEventListener('click', () => {
        const { slotId, start, end, date } = slot.dataset;
        const dateLabel = new Date(date + 'T00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

        document.getElementById('originalSlotId').value = slotId;
        document.getElementById('modal-change-info').textContent = 'Créneau actuel : ' + dateLabel + ' de ' + start + ' à ' + end;
        document.getElementById('change-request-error').style.display = 'none';
        document.getElementById('change-request-form').reset();
        document.getElementById('originalSlotId').value = slotId;

        // Pré-remplir avec les valeurs actuelles
        document.querySelector('[name="newDate"]').value = date;
        document.querySelector('[name="newStartTime"]').value = start.replace(':', ':');
        document.querySelector('[name="newEndTime"]').value = end.replace(':', ':');

        modalChange.showModal();
    });
});

// Bouton envoyer la demande
document.getElementById('btn-send-change').addEventListener('click', async () => {
    const form = document.getElementById('change-request-form');
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const data = Object.fromEntries(new FormData(form));
    const errorEl = document.getElementById('change-request-error');
    errorEl.style.display = 'none';

    const res = await fetch('/employee/schedule/change-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (res.ok) {
        modalChange.close();
        alert('Demande envoyée.');
    } else {
        errorEl.textContent = "Erreur lors de l'envoi.";
        errorEl.style.display = 'block';
    }
});

// Formulaire heures sup
document.getElementById('overtime-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    const errorEl = document.getElementById('overtime-error');
    errorEl.style.display = 'none';
    const res = await fetch('/employee/overtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (res.ok) {
        e.target.reset();
        alert('Heures supplémentaires déclarées.');
    } else {
        errorEl.textContent = 'Erreur lors de la déclaration.';
        errorEl.style.display = 'block';
    }
});
