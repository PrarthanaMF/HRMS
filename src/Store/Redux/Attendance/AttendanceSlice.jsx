import { createSlice } from '@reduxjs/toolkit';

// UI cache invalidation only. Authoritative attendance is owned by the service.
const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: { revision: 0 },
  reducers: {
    invalidateAttendance: state => { state.revision += 1; },
  },
});
export const { invalidateAttendance } = attendanceSlice.actions;
export default attendanceSlice.reducer;
