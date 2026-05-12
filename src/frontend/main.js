import { mount } from 'svelte';
import CalendarAdmin from './components/CalendarAdmin.svelte';
import CalendarEmployee from './components/CalendarEmployee.svelte';

const adminMount = document.getElementById('calendar-admin');
if (adminMount) {
  const raw = document.getElementById('calendar-admin-data');
  const data = JSON.parse(raw.textContent);
  mount(CalendarAdmin, {
    target: adminMount,
    props: {
      employeeId: data.employeeId,
      weekStart: data.weekStart,
      slots: data.slots,
      restrictions: data.restrictions,
    },
  });
}

const employeeMount = document.getElementById('calendar-employee');
if (employeeMount) {
  const raw = document.getElementById('calendar-employee-data');
  const data = JSON.parse(raw.textContent);
  mount(CalendarEmployee, {
    target: employeeMount,
    props: {
      weekStart: data.weekStart,
      slots: data.slots,
    },
  });
}
