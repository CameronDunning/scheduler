import React from "react";

import DayListItem from "components/DayListItem";

const DayList = props => {
  const days = props.days.map(day => {
    return (
      <DayListItem
        key={day.id}
        name={day.name}
        spots={day.spots}
        selected={day.name === props.day}
        setDay={props.setDay}
      />
    );
  });
  return days;
};

export default DayList;
