<script>
  import { untrack } from 'svelte';

  const HOUR_START = 7;
  const HOUR_END = 20;
  const HOUR_HEIGHT = 64;
  const DAY_MS = 864e5;

  let { employeeId, weekStart: weekStartStr, slots, restrictions: r } = $props();

  // UTC strict : évite le décalage jour/heure (serveur UTC, navigateur UTC+X)
  const utcStr = (d) =>
    d.getUTCFullYear() +
    '-' +
    String(d.getUTCMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getUTCDate()).padStart(2, '0');
  const timeStr = (dt) =>
    new Date(dt).toLocaleTimeString('fr-FR', {
      timeZone: 'UTC',
      hour: '2-digit',
      minute: '2-digit',
    });
  const toH = (dt) => {
    const d = new Date(dt);
    return d.getUTCHours() + d.getUTCMinutes() / 60;
  };

  // untrack : les props ne changent jamais (navigation = rechargement page), pas besoin de réactivité
  const weekStart = untrack(() => new Date(weekStartStr + 'T00:00:00Z'));
  const days = Array.from({ length: 7 }, (_, i) => new Date(weekStart.getTime() + i * DAY_MS));
  const prevWeekStr = utcStr(new Date(weekStart.getTime() - 7 * DAY_MS));
  const nextWeekStr = utcStr(new Date(weekStart.getTime() + 7 * DAY_MS));
  const weekLabel =
    weekStart.toLocaleDateString('fr-FR', { timeZone: 'UTC' }) +
    ' au ' +
    new Date(weekStart.getTime() + 6 * DAY_MS).toLocaleDateString('fr-FR', { timeZone: 'UTC' });
  const todayStr = utcStr(new Date());
  const hours = Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => HOUR_START + i);
  const lines = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => i);

  const slotsByDay = untrack(() => {
    const map = Object.fromEntries(days.map((d) => [utcStr(d), []]));
    for (const s of slots) {
      const k = utcStr(new Date(s.date));
      if (map[k]) map[k].push(s);
    }
    return map;
  });

  const slotTop = (s) => (toH(s.startTime) - HOUR_START) * HOUR_HEIGHT;
  const slotHeight = (s) => Math.max((toH(s.endTime) - toH(s.startTime)) * HOUR_HEIGHT, 20);

  // bind:this stocke la référence DOM native <dialog>
  let modalAdd = $state(null),
    modalSlot = $state(null);
  let selected = $state(null);
  let date = $state(''),
    start = $state('09:00'),
    end = $state('10:00'),
    type = $state('work'),
    err = $state('');
  // dateDisplay dérivé de date : pas besoin de le maintenir manuellement
  let dateDisplay = $derived(
    date
      ? new Date(date + 'T00:00:00Z').toLocaleDateString('fr-FR', {
          timeZone: 'UTC',
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })
      : ''
  );

  let weekly = $state(untrack(() => r?.weeklyHoursTarget ?? 35));
  let consec = $state(untrack(() => r?.maxConsecutiveHours ?? 8));
  let notes = $state(untrack(() => r?.notes ?? ''));

  function openAdd(e, dateStr) {
    if (e.target.closest('.sc-slot')) return; // ignore le bubbling depuis un créneau
    const y = e.clientY - e.currentTarget.getBoundingClientRect().top + e.currentTarget.scrollTop;
    const h = Math.max(HOUR_START, Math.min(19, Math.floor(HOUR_START + y / HOUR_HEIGHT)));
    date = dateStr;
    start = String(h).padStart(2, '0') + ':00';
    end = String(Math.min(20, h + 1)).padStart(2, '0') + ':00';
    type = 'work';
    err = '';
    modalAdd.showModal();
  }

  function openSlot(e, slot) {
    e.stopPropagation();
    selected = slot;
    modalSlot.showModal();
  }

  async function addSlot() {
    err = '';
    const res = await fetch(`/admin/schedule/${employeeId}/slot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, startTime: start, endTime: end, type }),
    });
    if (res.ok) {
      modalAdd.close();
      location.reload();
    } else err = (await res.json()).error || 'Erreur';
  }

  async function deleteSlot() {
    if (!confirm('Supprimer ce créneau ?')) return;
    const res = await fetch(`/admin/schedule/slot/${selected.idSlot}`, { method: 'DELETE' });
    if (res.ok) {
      modalSlot.close();
      location.reload();
    } else alert('Erreur lors de la suppression');
  }

  async function saveRestrictions(e) {
    e.preventDefault();
    const res = await fetch(`/admin/schedule/${employeeId}/restrictions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weeklyHoursTarget: +weekly, maxConsecutiveHours: +consec, notes }),
    });
    if (res.ok) location.reload();
    else alert('Erreur lors de la mise à jour des contraintes');
  }
</script>

<div class="card card--mb">
  <div class="card-header">
    <a href="/admin/schedule/{employeeId}?weekStart={prevWeekStr}" class="btn btn-ghost btn-sm">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"><polyline points="15 18 9 12 15 6" /></svg
      >
      Précédente
    </a>
    <span class="card-title">Semaine du {weekLabel}</span>
    <a href="/admin/schedule/{employeeId}?weekStart={nextWeekStr}" class="btn btn-ghost btn-sm">
      Suivante
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"><polyline points="9 18 15 12 9 6" /></svg
      >
    </a>
  </div>

  <div class="sc-calendar">
    <div class="sc-header">
      <div></div>
      {#each days as day}
        <div class="sc-day-header {utcStr(day) === todayStr ? 'today' : ''}">
          {day.toLocaleDateString('fr-FR', {
            timeZone: 'UTC',
            weekday: 'short',
            day: 'numeric',
            month: 'short',
          })}
        </div>
      {/each}
    </div>
    <div class="sc-body">
      <div class="sc-time-col">
        {#each hours as h}
          <div class="sc-hour-label" style="height:{HOUR_HEIGHT}px">
            {String(h).padStart(2, '0')}h
          </div>
        {/each}
      </div>
      {#each days as day}
        {@const dateStr = utcStr(day)}
        <div
          class="sc-day-col"
          role="gridcell"
          tabindex="0"
          data-date={dateStr}
          style="height:{(HOUR_END - HOUR_START) * HOUR_HEIGHT}px"
          onclick={(e) => openAdd(e, dateStr)}
          onkeydown={(e) => e.key === 'Enter' && openAdd(e, dateStr)}
        >
          {#each lines as h}
            <div class="sc-grid-line" style="top:{h * HOUR_HEIGHT}px"></div>
          {/each}
          {#each slotsByDay[dateStr] || [] as slot}
            <div
              class="sc-slot sc-slot--{slot.type}"
              role="button"
              tabindex="0"
              style="top:{slotTop(slot)}px;height:{slotHeight(slot)}px"
              onclick={(e) => openSlot(e, slot)}
              onkeydown={(e) => e.key === 'Enter' && openSlot(e, slot)}
            >
              <span class="sc-slot-time">{timeStr(slot.startTime)} – {timeStr(slot.endTime)}</span>
              <span class="sc-slot-label">{slot.type === 'work' ? 'Travail' : 'Pause'}</span>
            </div>
          {/each}
        </div>
      {/each}
    </div>
  </div>
</div>

<div class="card">
  <div class="card-header"><span class="card-title">Contraintes</span></div>
  <div class="card-body">
    <form
      onsubmit={saveRestrictions}
      style="display:grid;grid-template-columns:1fr 1fr 2fr auto;gap:12px;align-items:end"
    >
      <div class="form-group" style="margin:0">
        <label class="form-label" for="r-weekly">Heures hebdo cibles</label>
        <input
          id="r-weekly"
          type="number"
          class="form-input"
          min="1"
          max="48"
          step="0.5"
          bind:value={weekly}
        />
      </div>
      <div class="form-group" style="margin:0">
        <label class="form-label" for="r-consec">Heures consécutives max</label>
        <input
          id="r-consec"
          type="number"
          class="form-input"
          min="1"
          max="12"
          step="0.5"
          bind:value={consec}
        />
      </div>
      <div class="form-group" style="margin:0">
        <label class="form-label" for="r-notes">Notes</label>
        <input id="r-notes" type="text" class="form-input" bind:value={notes} />
      </div>
      <button type="submit" class="btn btn-primary">Enregistrer</button>
    </form>
  </div>
</div>

<!-- Modale : nouveau créneau -->
<dialog bind:this={modalAdd}>
  <div class="modal-header">
    <span class="modal-title">Nouveau créneau</span>
    <button class="modal-close" onclick={() => modalAdd.close()}>×</button>
  </div>
  <div class="modal-body">
    {#if err}<div class="alert alert-error">{err}</div>{/if}
    <div class="form-group">
      <label class="form-label" for="s-date">Date</label>
      <input id="s-date" type="text" class="form-input" value={dateDisplay} disabled />
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label" for="s-start">Début</label>
        <input id="s-start" type="time" class="form-input" bind:value={start} required />
      </div>
      <div class="form-group">
        <label class="form-label" for="s-end">Fin</label>
        <input id="s-end" type="time" class="form-input" bind:value={end} required />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label" for="s-type">Type</label>
      <select id="s-type" class="form-input" bind:value={type}>
        <option value="work">Travail</option>
        <option value="break">Pause</option>
      </select>
    </div>
  </div>
  <div class="modal-footer">
    <button class="btn btn-ghost" onclick={() => modalAdd.close()}>Annuler</button>
    <button class="btn btn-primary" onclick={addSlot}>Ajouter</button>
  </div>
</dialog>

<!-- Modale : détail créneau — {#if} évite d'accéder à selected quand il est null -->
<dialog bind:this={modalSlot}>
  {#if selected}
    <div class="modal-header">
      <span class="modal-title">{selected.type === 'work' ? 'Travail' : 'Pause'}</span>
      <button class="modal-close" onclick={() => modalSlot.close()}>×</button>
    </div>
    <div class="modal-body">
      <p style="color:#475569;font-size:14px;margin-bottom:4px">
        {new Date(selected.date).toLocaleDateString('fr-FR', {
          timeZone: 'UTC',
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })}
        · {timeStr(selected.startTime)} – {timeStr(selected.endTime)}
      </p>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick={() => modalSlot.close()}>Fermer</button>
      <button class="btn btn-danger" onclick={deleteSlot}>Supprimer</button>
    </div>
  {/if}
</dialog>
