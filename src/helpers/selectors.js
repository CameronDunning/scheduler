const getAppointmentsForDay = (state, day) => {
  let apptObj = state.days.find(e => e.name === day);
  if (apptObj === undefined) {
    return [];
  } else {
    let apptArray = apptObj.appointments;
    let appointments = apptArray.map(x => state.appointments[x]);
    return appointments === undefined ? [] : appointments;
  }
};

export { getAppointmentsForDay };
