const getAppointmentsForDay = (state, day) => {
  const apptObj = state.days.find(e => e.name === day);
  if (apptObj === undefined) {
    return [];
  } else {
    const apptArray = apptObj.appointments;
    const appointments = apptArray.map(x => state.appointments[x]);
    return appointments === undefined ? [] : appointments;
  }
};

const getInterviewersForDay = (state, day) => {
  const apptObj = state.days.find(e => e.name === day);
  if (apptObj === undefined) {
    return [];
  } else {
    const interviewersArray = apptObj.interviewers;
    const interviewers = interviewersArray.map(x => state.interviewers[x]);
    return interviewers === undefined ? [] : interviewers;
  }
};

const getInterview = (state, interview) => {
  if (!interview) {
    return interview;
  } else {
    const interviewerInfo = state.interviewers[interview.interviewer];
    const newInterview = {
      student: interview.student,
      interviewer: interviewerInfo
    };
    return newInterview;
  }
};

export { getAppointmentsForDay, getInterviewersForDay, getInterview };
