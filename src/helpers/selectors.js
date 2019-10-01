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

const getInterview = (state, interview) => {
  if (!interview) {
    return interview;
  } else {
    const interviewerInfo = state.interviewers[interview.interviewer];
    let newInterview = {
      student: interview.student,
      interviewer: interviewerInfo
    };
    return newInterview;
  }
};

export { getAppointmentsForDay, getInterview };
