const updateSpotsRemaining = (appointments, days) => {
  for (const day in days) {
    let spots = 0;
    for (const appointment of days[day].appointments) {
      if (appointments[appointment].interview === null) {
        spots++;
      }
    }
    days[day].spots = spots;
  }
  return days;
};

const createNewAppointments = (state, interview, appointmentID) => {
  const appointment = {
    ...state.appointments[appointmentID],
    interview: interview ? { ...interview } : null
  };
  const appointments = {
    ...state.appointments,
    [appointmentID]: appointment
  };
  return appointments;
};

export { updateSpotsRemaining, createNewAppointments };
