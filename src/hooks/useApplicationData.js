import { useEffect, useReducer } from "react";
import axios from "axios";

const useApplicationData = () => {
  const SET_DAY = "SET_DAY";
  const SET_APPLICATION_DATA = "SET_APPLICATION_DATA";
  const SET_INTERVIEW = "SET_INTERVIEW";

  const daysDictionary = {
    Monday: 0,
    Tuesday: 1,
    Wednesday: 2,
    Thursday: 3,
    Friday: 4
  };

  const reducer = (state, action) => {
    switch (action.type) {
      case SET_DAY:
        return { ...state, day: action.day };
      case SET_APPLICATION_DATA:
        return {
          ...state,
          ...action.data
        };
      case SET_INTERVIEW:
        return {
          ...state,
          appointments: action.appointments,
          days: action.days
        };
      default:
        throw new Error(
          `Tried to reduce with unsupported action type: ${action.type}`
        );
    }
  };

  const [state, dispatch] = useReducer(reducer, {
    day: "Monday",
    days: [],
    appointments: {}
  });

  useEffect(() => {
    Promise.all([
      axios.get(`/api/days`),
      axios.get(`/api/appointments`),
      axios.get(`/api/interviewers`)
    ]).then(all => {
      dispatch({
        type: SET_APPLICATION_DATA,
        data: {
          days: all[0].data,
          appointments: all[1].data,
          interviewers: all[2].data
        }
      });
    });
  }, []);

  const setDay = day => dispatch({ type: SET_DAY, day: day });

  const bookInterview = (id, interview) => {
    const appointment = {
      ...state.appointments[id],
      interview: { ...interview }
    };
    const appointments = {
      ...state.appointments,
      [id]: appointment
    };
    return axios.put(`/api/appointments/${id}`, appointment).then(() => {
      let newDays = state.days;
      newDays[daysDictionary[state.day]].spots--;
      dispatch({ type: SET_INTERVIEW, appointments, days: newDays });
    });
  };

  const deleteInterview = id => {
    const appointment = {
      ...state.appointments[id],
      interview: null
    };
    const appointments = {
      ...state.appointments,
      [id]: appointment
    };
    return axios.delete(`/api/appointments/${id}`).then(() => {
      let newDays = state.days;
      newDays[daysDictionary[state.day]].spots++;
      dispatch({ type: SET_INTERVIEW, appointments, days: newDays });
    });
  };

  return { state, setDay, bookInterview, deleteInterview };
};

export { useApplicationData };
