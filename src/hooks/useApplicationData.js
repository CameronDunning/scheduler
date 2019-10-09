import { useEffect, useReducer } from "react";
import axios from "axios";
import {
  updateSpotsRemaining,
  createNewAppointments
} from "helpers/dataUpdaters";
import {
  reducer,
  SET_DAY,
  SET_APPLICATION_DATA,
  SET_INTERVIEW
} from "reducers/application";

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
    const socket = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);
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
