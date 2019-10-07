import { useEffect, useReducer } from "react";
import axios from "axios";
import {
  updateSpotsRemaining,
  createNewAppointments
} from "helpers/dataUpdaters";

const SET_DAY = "SET_DAY";
const SET_APPLICATION_DATA = "SET_APPLICATION_DATA";
const SET_INTERVIEW = "SET_INTERVIEW";

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

const useApplicationData = () => {
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
        const newAppointments = createNewAppointments(
          state,
          interview,
          appointmentID
        );
        const newDays = [...state.days];
        dispatch({
          type: SET_INTERVIEW,
          appointments: newAppointments,
          days: updateSpotsRemaining(newAppointments, newDays)
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
      const newDays = [...state.days];
      dispatch({
        type: SET_INTERVIEW,
        appointments,
        days: updateSpotsRemaining(appointments, newDays)
      });
    });
  };

  const deleteInterview = id => {
    const newAppointments = createNewAppointments(state, null, id);
    return axios.delete(`/api/appointments/${id}`).then(() => {
      const newDays = [...state.days];
      dispatch({
        type: SET_INTERVIEW,
        appointments: newAppointments,
        days: updateSpotsRemaining(newAppointments, newDays)
      });
    });
  };

  return { state, setDay, bookInterview, deleteInterview };
};

export { useApplicationData };
