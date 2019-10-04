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

  const daysWithUpdatedSpots = (
    days,
    appointmentID,
    addInterview,
    removeInterview
  ) => {
    let dayToUpdate = 0;
    for (let day in days) {
      console.log(day);
      for (let appointment of days[day].appointments) {
        if (appointment === appointmentID) {
          console.log(appointment);
          if (addInterview) {
            days[day].spots--;
          } else if (removeInterview) {
            days[day].spots++;
          }
          break;
        }
      }
    }
    console.log("days: ", days);
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
    socket.onopen = event => {
      socket.send("ping");
    };
    socket.onmessage = event => {
      // console.log(event.data);
      const receivedMessage = JSON.parse(event.data);
      // console.log(receivedMessage);
      const setInterview = receivedMessage.type === "SET_INTERVIEW";
      const appointmentID = receivedMessage.id;
      const interview = receivedMessage.interview;
      if (setInterview && state.days.length > 0) {
        // console.log("in setInterview");
        // console.log("state: ", state);
        // console.log("appointment ID: ", appointmentID);
        // console.log("interview: ", interview);
        const appointment = {
          ...state.appointments[appointmentID],
          interview: interview ? { ...interview } : null
        };
        const appointments = {
          ...state.appointments,
          [appointmentID]: appointment
        };
        dispatch({ type: SET_INTERVIEW, appointments });
        // console.log("new state: ", state);
        // const addInterview = interview ? true : false;
        // const removeInterview = interview ? false : true;
        // let newDays = { ...state.days };
        // console.log("NewDays: ", newDays);
        // newDays = daysWithUpdatedSpots(
        //   newDays,
        //   appointmentID,
        //   addInterview,
        //   removeInterview
        // );
        // console.log(newDays);
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
      dispatch({ type: SET_INTERVIEW, appointments });
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
      dispatch({ type: SET_INTERVIEW, appointments });
    });
  };

  return { state, setDay, bookInterview, deleteInterview };
};

export { useApplicationData };
