import React from "react";
import PropTypes from "prop-types";

import InterviewerListItem from "components/InterviewerListItem";
import "components/InterviewerList.scss";

const InterviewerList = props => {
  return (
    <section className="interviewers">
      <h4 className="interviewers__header text--light">Interviewer</h4>
      <ul className="interviewers__list">
        {props.interviewers.map(interviewer => {
          return (
            <InterviewerListItem
              key={interviewer.id}
              name={interviewer.name}
              avatar={interviewer.avatar}
              selected={interviewer.id === props.interviewer}
              setInterviewer={event => props.setInterviewer(interviewer.id)}
            />
          );
        })}
      </ul>
    </section>
  );
};

InterviewerList.propTypes = {
  setInterviewer: PropTypes.func.isRequired,
  interview: PropTypes.object
};

export default InterviewerList;
