import React, { useEffect } from "react";

import "components/Appointment/styles.scss";
import Header from "components/Appointment/Header";
import Empty from "components/Appointment/Empty";
import Show from "components/Appointment/Show";
import Form from "components/Appointment/Form";
import Status from "components/Appointment/Status";
import Confirm from "components/Appointment/Confirm";
import Error from "components/Appointment/Error";
import { useVisualMode } from "hooks/useVisualMode";

const EMPTY = "EMPTY";
const SHOW = "SHOW";
const CREATE = "CREATE";
const EDIT = "EDIT";
const SAVING = "SAVING";
const DELETING = "DELETING";
const CONFIRM_DELETE = "CONFIRM_DELETE";
const ERROR_SAVING = "ERROR_SAVING";
const ERROR_DELETING = "ERROR_DELETING";

const Appointment = props => {
  const { mode, transition, back } = useVisualMode(
    props.interview ? SHOW : EMPTY
  );

  const save = (name, interviewer) => {
    transition(SAVING);
    const interview = {
      student: name,
      interviewer
    };
    props
      .bookInterview(props.id, interview)
      .then(() => transition(SHOW))
      .catch(() => {
        transition(ERROR_SAVING, true);
      });
  };

  const deleteInt = () => {
    transition(DELETING, true);
    props
      .deleteInterview(props.id)
      .then(() => transition(EMPTY))
      .catch(() => transition(ERROR_DELETING, true));
  };

  const confirmDelete = () => {
    transition(CONFIRM_DELETE);
  };

  useEffect(() => {
    if (props.interview && mode === EMPTY) {
      transition(SHOW);
    }
    if (props.interview === null && mode === SHOW) {
      transition(EMPTY);
    }
  }, [props.interview, transition, mode]);

  return (
    <>
      <Header time={props.time} />
      {mode === EMPTY && <Empty onAdd={() => transition(CREATE)} />}
      {mode === SHOW && props.interview && (
        <Show
          student={props.interview.student}
          interviewer={props.interview.interviewer}
          onDelete={() => confirmDelete()}
          onEdit={() => transition(EDIT)}
        />
      )}
      {mode === CREATE && (
        <Form
          interviewers={props.interviewers}
          onSave={(name, interviewer) => save(name, interviewer)}
          onCancel={() => back()}
        />
      )}
      {mode === EDIT && (
        <Form
          interviewers={props.interviewers}
          onSave={(name, interviewer) => save(name, interviewer)}
          onCancel={() => back()}
          interviewer={props.interview.interviewer.id}
          name={props.interview.student}
        />
      )}
      {mode === SAVING && <Status message={"Saving"} />}
      {mode === DELETING && <Status message={"Deleting"} />}
      {mode === CONFIRM_DELETE && (
        <Confirm
          message={"Delete this Appointment?"}
          onCancel={() => back()}
          onConfirm={() => deleteInt()}
        />
      )}
      {mode === ERROR_SAVING && (
        <Error message={"Error saving"} onClose={() => back()} />
      )}
      {mode === ERROR_DELETING && (
        <Error message={"Error saving"} onClose={() => back()} />
      )}
    </>
  );
};

export default Appointment;
