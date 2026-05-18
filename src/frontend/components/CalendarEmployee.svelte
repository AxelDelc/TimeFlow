<script>
  import { untrack } from 'svelte';

  const HOUR_START = 7;
  const HOUR_END = 20;
  const HOUR_HEIGHT = 64;
  const DAY_MS = 864e5;

  let { weekStart: weekStartStr, slots } = $props();

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

  let modal = $state(null),
    selected = $state(null);
  let crDate = $state(''),
    crStart = $state(''),
    crEnd = $state(''),
    crMsg = $state(''),
    crErr = $state('');
  let otErr = $state(''),
    otDate = $state(''),
    otStart = $state(''),
    otEnd = $state(''),
    otReason = $state('colleague_abscence');

  function openModal(slot) {
    selected = slot;
    crDate = utcStr(new Date(slot.date));
    crStart = timeStr(slot.startTime);
    crEnd = timeStr(slot.endTime);
    crMsg = '';
    crErr = '';
    modal.showModal();
  }

  async function sendRequest() {
    crErr = '';
    const res = await fetch('/employee/schedule/change-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        originalSlotId: selected.id,
        newDate: crDate,
        newStartTime: crStart,
        newEndTime: crEnd,
        employeeMessage: crMsg,
      }),
    });
    if (res.ok) {
      modal.close();
      alert('Demande envoyée.');
    } else crErr = "Erreur lors de l'envoi.";
  }

  async function submitOvertime(e) {
    e.preventDefault();
    otErr = '';
    const res = await fetch('/employee/overtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: otDate, startTime: otStart, endTime: otEnd, reason: otReason }),
    });
    if (res.ok) {
      otDate = otStart = otEnd = '';
      otReason = 'colleague_abscence';
      alert('Heures supplémentaires déclarées.');
    } else otErr = 'Erreur lors de la déclaration.';
  }
</script>

<div class="card card--mb">
  <div class="card-header">
    <a href="/employee/schedule?weekStart={prevWeekStr}" class="btn btn-ghost btn-sm">
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
    <a href="/employee/schedule?weekStart={nextWeekStr}" class="btn btn-ghost btn-sm">
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
          data-date={dateStr}
          style="height:{(HOUR_END - HOUR_START) * HOUR_HEIGHT}px"
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
              onclick={() => openModal(slot)}
              onkeydown={(e) => e.key === 'Enter' && openModal(slot)}
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

<div class="card card--mb">
  <div class="card-header"><span class="card-title">Déclarer des heures sup</span></div>
  <div class="card-body">
    {#if otErr}<div class="alert alert-error">{otErr}</div>{/if}
    <form
      onsubmit={submitOvertime}
      style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr auto;gap:12px;align-items:end"
    >
      <div class="form-group" style="margin:0">
        <label class="form-label" for="ot-date">Date</label>
        <input id="ot-date" type="date" class="form-input" bind:value={otDate} required />
      </div>
      <div class="form-group" style="margin:0">
        <label class="form-label" for="ot-start">Début</label>
        <input id="ot-start" type="time" class="form-input" bind:value={otStart} required />
      </div>
      <div class="form-group" style="margin:0">
        <label class="form-label" for="ot-end">Fin</label>
        <input id="ot-end" type="time" class="form-input" bind:value={otEnd} required />
      </div>
      <div class="form-group" style="margin:0">
        <label class="form-label" for="ot-reason">Motif</label>
        <select id="ot-reason" class="form-input" bind:value={otReason} required>
          <option value="colleague_abscence">Absence collègue</option>
          <option value="client_issue">Problème client</option>
          <option value="manager_request">Demande manager</option>
          <option value="other">Autre</option>
        </select>
      </div>
      <button type="submit" class="btn btn-primary">Déclarer</button>
    </form>
  </div>
</div>

<!-- Modale : demande de modification — {#if} évite d'accéder à selected quand il est null -->
<dialog bind:this={modal}>
  {#if selected}
    <div class="modal-header">
      <span class="modal-title">Demander une modification</span>
      <button class="modal-close" onclick={() => modal.close()}>×</button>
    </div>
    <div class="modal-body">
      <p style="color:#475569;font-size:13px;margin-bottom:16px">
        Créneau actuel :
        {new Date(selected.date).toLocaleDateString('fr-FR', {
          timeZone: 'UTC',
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })}
        de {timeStr(selected.startTime)} à {timeStr(selected.endTime)}
      </p>
      {#if crErr}<div class="alert alert-error">{crErr}</div>{/if}
      <div class="form-group">
        <label class="form-label" for="cr-date">Nouvelle date</label>
        <input id="cr-date" type="date" class="form-input" bind:value={crDate} required />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="cr-start">Nouveau début</label>
          <input id="cr-start" type="time" class="form-input" bind:value={crStart} required />
        </div>
        <div class="form-group">
          <label class="form-label" for="cr-end">Nouvelle fin</label>
          <input id="cr-end" type="time" class="form-input" bind:value={crEnd} required />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="cr-msg">Message pour l'admin</label>
        <textarea id="cr-msg" class="form-input" rows="2" bind:value={crMsg}></textarea>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick={() => modal.close()}>Annuler</button>
      <button class="btn btn-primary" onclick={sendRequest}>Envoyer la demande</button>
    </div>
  {/if}
</dialog>
