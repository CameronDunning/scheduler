import { useEffect, useReducer } from "react";
import axios from "axios";

const useApplicationData = () => {
  const SET_DAY = "SET_DAY";
  const SET_APPLICATION_DATA = "SET_APPLICATION_DATA";
  const SET_INTERVIEW = "SET_INTERVIEW";

  const updateSpotsRemaining = (appointments, days) => {
    for (const day in days) {
      let spots = 5;
      for (const appointment of days[day].appointments) {
        if (appointments[appointment].interview !== null) {
          spots--;
        }
      }
      days[day].spots = spots;
    }
    return days;
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
          appointments: action.appointments
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

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8001");
    socket.onmessage = event => {
      const receivedMessage = JSON.parse(event.data);
      const setInterview = receivedMessage.type === "SET_INTERVIEW";
      const appointmentID = receivedMessage.id;
      const interview = receivedMessage.interview;
      if (setInterview && state.days.length > 0) {
        const appointment = {
          ...state.appointments[appointmentID],
          interview: interview ? { ...interview } : null
        };
        const appointments = {
          ...state.appointments,
          [appointmentID]: appointment
        };
        const newDays = { ...state.days };
        dispatch({
          type: SET_INTERVIEW,
          appointments,
          days: updateSpotsRemaining(appointments, newDays)
        });
      }
    };
    return () => {
      socket.close();
    };
  });

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
      const newDays = { ...state.days };
      dispatch({
        type: SET_INTERVIEW,
        appointments,
        days: updateSpotsRemaining(appointments, newDays)
      });
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
      const newDays = { ...state.days };
      dispatch({
        type: SET_INTERVIEW,
        appointments,
        days: updateSpotsRemaining(appointments, newDays)
      });
    });
  };

  return { state, setDay, bookInterview, deleteInterview };
};

export { useApplicationData };
