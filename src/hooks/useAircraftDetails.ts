import { useEffect, useState } from "react";
import axios from "axios";
import { aircraftUrl, maintainanceEventUrl, maintainanceScheduleUrl, maintainanceTypeUrl, tripUrl } from "../consts";
import {
  Aircraft,
  AircraftAvailability,
  MaintenanceEvent,
  MaintenanceSchedule,
  MaintenanceType,
  SearchFormData,
  Trip,
} from "../types";
import dayjs, { Dayjs } from "dayjs";

const useAircraftDetails = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [aircrafts, setAircrafts] = useState<Aircraft[]>([]);
  const [maintainanceTypes, setMaintainanceTypes] = useState<MaintenanceType[]>([]);
  const [maintainanceEvents, setMaintainaceEvents] = useState<MaintenanceEvent[]>([]);
  const [maintainanceSchedules, setMaintainanceSchedules] = useState<MaintenanceSchedule[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    setIsLoading(true);
    const aircraftFetch = axios.get(aircraftUrl);
    const maintainanceTypeFetch = axios.get(maintainanceTypeUrl);
    const maintainanceEventFetch = axios.get(maintainanceEventUrl);
    const maintainanceScheduleFetch = axios.get(maintainanceScheduleUrl);
    const tripFetch = axios.get(tripUrl);
    Promise.all([aircraftFetch, maintainanceTypeFetch, maintainanceEventFetch, maintainanceScheduleFetch, tripFetch])
      .then((values) => {
        console.log(values);
        setAircrafts(values[0].data);
        setMaintainanceTypes(values[1].data);
        setMaintainaceEvents(values[2].data);
        setMaintainanceSchedules(values[3].data);
        setTrips(values[4].data);
        setIsLoading(false);
      })
      .catch((_) => {
        setIsLoading(false);
        alert("Something went wrong");
      });
  }, []);

  const getIsConflictingTrip = (aircraft: Aircraft, date_range: Dayjs[]) => {
    const scheduledTrips = trips.filter((ac) => ac.aircraft_id === aircraft.id);
    let isConflicting = false;
    for (const trip of scheduledTrips) {
      if (
        (date_range[0].isBefore(dayjs(trip.end_date)) && dayjs(trip.start_date).isBefore(date_range[1])) ||
        date_range[0].isSame(dayjs(trip.start_date)) ||
        date_range[0].isSame(dayjs(trip.end_date)) ||
        date_range[1].isSame(dayjs(trip.start_date)) ||
        date_range[1].isSame(dayjs(trip.end_date))
      ) {
        isConflicting = true;
        break;
      }
    }
    return isConflicting;
  };

  const getIsScheduledForMaintainance = (aircraft: Aircraft, date_range: Dayjs[]) => {
    const maintainanceSchedule = maintainanceSchedules.filter((ac) => ac.aircraft_id === aircraft.id);
    let isScheduledForMaintainance = false;
    for (const schedule of maintainanceSchedule) {
      if (
        (date_range[0].isBefore(dayjs(schedule.end_date)) && dayjs(schedule.start_date).isBefore(date_range[1])) ||
        date_range[0].isSame(dayjs(schedule.start_date)) ||
        date_range[0].isSame(dayjs(schedule.end_date)) ||
        date_range[1].isSame(dayjs(schedule.start_date)) ||
        date_range[1].isSame(dayjs(schedule.end_date))
      ) {
        isScheduledForMaintainance = true;
        break;
      }
    }
    return isScheduledForMaintainance;
  };

  const getWillAircraftBeGrounded = (aircraft: Aircraft, formData: SearchFormData) => {
    const { date_range } = formData;
    const aircraftMaintainanceEvents = maintainanceEvents.filter((me) => me.aircraft_id === aircraft.id);
    const aircraftMaintainanceSchedule = maintainanceSchedules.filter((ms) => ms.aircraft_id === aircraft.id);
    const tripsInQueue = trips.filter(
      (trip) => dayjs(trip.end_date).isBefore(date_range[0]) && trip.aircraft_id === aircraft.id
    );

    const isEligibleByHobbsReading = () => {
      const totalHobbsReading =
        aircraft.current_hobbs + tripsInQueue.reduce((prev, trip) => prev + trip.flying_time, 0) + formData.flying_time;
      const upcomingMaintainanceEventByHobbs = aircraftMaintainanceEvents.find(
        (me) => aircraft.current_hobbs < me.next_due_hobbs && me.next_due_hobbs < totalHobbsReading
      );
      if (upcomingMaintainanceEventByHobbs) {
        const scheduledMaintainaceBeforeTrip = aircraftMaintainanceSchedule.find((ams) =>
          dayjs(ams.end_date).isBefore(date_range[0])
        );
        return scheduledMaintainaceBeforeTrip ? true : false;
      } else {
        return true;
      }
    };

    const isEligibleByNumberOfLandings = () => {
      const totalLandings =
        aircraft.current_landings +
        tripsInQueue.reduce((prev, trip) => prev + trip.landing_count, 0) +
        formData.landing_count;
      const upcomingMaintainanceEventByLandings = aircraftMaintainanceEvents.find(
        (me) => aircraft.current_landings < me.next_due_landings && me.next_due_landings < totalLandings
      );
      if (upcomingMaintainanceEventByLandings) {
        const scheduledMaintainaceBeforeTrip = aircraftMaintainanceSchedule.find((ams) =>
          dayjs(ams.end_date).isBefore(date_range[0])
        );
        return scheduledMaintainaceBeforeTrip ? true : false;
      } else {
        return true;
      }
    };

    const isEligibleByDueDate = () => {
      let dueDateConflict = false;
      for (const maintainanceEvent of aircraftMaintainanceEvents) {
        if (
          date_range[0].isSame(dayjs(maintainanceEvent.next_due_date)) ||
          date_range[1].isSame(dayjs(maintainanceEvent.next_due_date)) ||
          (dayjs(maintainanceEvent.next_due_date).isAfter(date_range[0]) &&
            dayjs(maintainanceEvent.next_due_date).isBefore(date_range[1]))
        ) {
          dueDateConflict = true;
          break;
        }
      }
      //   if (dueDateConflict) {
      //     return false;
      //   } else {
      //     const upcomingMaintainanceEventByDueDate = aircraftMaintainanceEvents.find(
      //       (me) =>
      //         dayjs(aircraft.last_maintenance_date).isBefore(me.next_due_date) &&
      //         dayjs(me.next_due_date).isBefore(date_range[0])
      //     );
      //     if (upcomingMaintainanceEventByDueDate) {
      //       const associatedMaintainaceSchedule = aircraftMaintainanceSchedule.find((ams) =>
      //         dayjs(ams.start_date).isSame(dayjs(upcomingMaintainanceEventByDueDate.next_due_date))
      //       );
      //       return associatedMaintainaceSchedule ? true : false;
      //     } else {
      //       return true;
      //     }
      //   }
      return !dueDateConflict;
    };

    return !isEligibleByHobbsReading() || !isEligibleByNumberOfLandings() || !isEligibleByDueDate();
  };

  // Assumption: All data returned by backend is upcoming data.
  const getAircraftAvailability = (formData: SearchFormData): AircraftAvailability[] => {
    const aircraftsAvailability: AircraftAvailability[] = [];
    aircrafts.forEach((aircraft) => {
      const isConflictingTrip = getIsConflictingTrip(aircraft, formData.date_range);
      const isScheduledForMaintainance = getIsScheduledForMaintainance(aircraft, formData.date_range);
      const willAircraftBeGrounded = getWillAircraftBeGrounded(aircraft, formData);
      console.log({
        isConflictingTrip,
        isScheduledForMaintainance,
        willAircraftBeGrounded,
      });
      aircraftsAvailability.push({
        id: aircraft.id,
        tail_number: aircraft.tail_number,
        status: isConflictingTrip || isScheduledForMaintainance || willAircraftBeGrounded ? "UNAVAILABLE" : "AVAILABLE",
      });
    });
    return aircraftsAvailability;
  };

  return {
    isLoading,
    aircrafts,
    maintainanceTypes,
    maintainanceEvents,
    maintainanceSchedules,
    trips,
    getAircraftAvailability,
  };
};

export default useAircraftDetails;
