import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { listEmployees, loadOptions } from '../api/employees';
import { selectEmployeesRevision } from '../Store/Redux/Workforce/EmployeeSlice';

// Branches, managers, week-off policies and values in use; loaded once per revision
let cachedOptions = null;

export function useEmployeeOptions() {
  const revision = useSelector(selectEmployeesRevision);
  const [state, setState] = useState({ options: cachedOptions?.revision === revision ? cachedOptions.data : null, error: null });

  useEffect(() => {
    if (cachedOptions?.revision === revision) return undefined;
    let active = true;
    loadOptions().then(
      data => {
        cachedOptions = { revision, data };
        if (active) setState({ options: data, error: null });
      },
      error => { if (active) setState({ options: null, error }); },
    );
    return () => { active = false; };
  }, [revision]);

  return state;
}

// One page of employees for the current filters; reloads after any employee change
export function useEmployeeList(filters, page) {
  const revision = useSelector(selectEmployeesRevision);
  const [state, setState] = useState({ employees: [], pagination: null, loading: true, error: null });
  const key = JSON.stringify(filters);

  useEffect(() => {
    const controller = new AbortController();
    setState(previous => ({ ...previous, loading: true, error: null }));
    // Wait for typing in the search box to settle before asking the server
    const timer = window.setTimeout(() => {
      listEmployees({ filters: JSON.parse(key), page }, controller.signal).then(
        data => setState({ ...data, loading: false, error: null }),
        error => { if (error.name !== 'AbortError') setState({ employees: [], pagination: null, loading: false, error }); },
      );
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [key, page, revision]);

  return state;
}
