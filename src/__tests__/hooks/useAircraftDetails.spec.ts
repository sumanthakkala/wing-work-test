import { renderHook } from "@testing-library/react";
import dayjs from "dayjs";
import { act } from "react-dom/test-utils";
import useAircraftDetails from "../../hooks/useAircraftDetails";

const mockAxiosGet = jest.fn((url: string) => {
  if (url.includes("aircraft")) {
    return Promise.resolve({
      data: [
        {
          id: 1,
          tail_number: "N123AA",
          current_hobbs: 950,
          current_landings: 480,
          last_maintenance_date: "2023-03-01",
        },
      ]
    });
  }
  if (url.includes("maintenance_type")) {
    return Promise.resolve({
      data: [
        {
          id: 1,
          description: "100-hour inspection",
          hobbs_interval: 100,
          landings_interval: 0,
          calendar_days_interval: 0,
        },
        {
          id: 2,
          description: "400-hour inspection",
          hobbs_interval: 400,
          landings_interval: 0,
          calendar_days_interval: 0,
        },
        {
          id: 3,
          description: "Annual inspection",
          hobbs_interval: 0,
          landings_interval: 0,
          calendar_days_interval: 365,
        },
      ]
    });
  }
  if (url.includes("maintenance_event")) {
    return Promise.resolve({
      data: [
        {
          id: 1,
          aircraft_id: 1,
          maintenance_type_id: 1,
          next_due_hobbs: 1000,
          next_due_landings: 0,
          next_due_date: "2023-03-31",
        },
        {
          id: 2,
          aircraft_id: 1,
          maintenance_type_id: 2,
          next_due_hobbs: 1200,
          next_due_landings: 0,
          next_due_date: "2023-06-30",
        },
        {
          id: 3,
          aircraft_id: 1,
          maintenance_type_id: 3,
          next_due_hobbs: 0,
          next_due_landings: 0,
          next_due_date: "2023-12-31",
        },
      ]
    });
  }
  if (url.includes("maintenance_schedule")) {
    return Promise.resolve({
      data: [
        {
          id: 1,
          aircraft_id: 1,
          maintenance_type_id: 1,
          start_date: "2023-03-20",
          end_date: "2023-03-23",
        },
      ]
    });
  }
  if (url.includes("trip")) {
    return Promise.resolve({
      data: [
        {
          id: 1,
          aircraft_id: 1,
          start_date: "2023-03-10",
          end_date: "2023-03-11",
          flying_time: 25,
          landing_count: 10,
        },
        {
          id: 2,
          aircraft_id: 1,
          start_date: "2023-03-15",
          end_date: "2023-03-16",
          flying_time: 20,
          landing_count: 8,
        },
        {
          id: 4,
          aircraft_id: 1,
          start_date: "2023-03-25",
          end_date: "2023-03-26",
          flying_time: 10,
          landing_count: 4,
        },
      ]
    });
  }
});

jest.mock("axios", () => {
  return {
    get: (url: string) => mockAxiosGet(url),
  };
});

describe("useAircraftDetails Hook", () => {
  it("initial and success state", async () => {
    renderHook(() => useAircraftDetails());
    expect(mockAxiosGet).toHaveBeenCalledTimes(5);
  });

  it("should give aircraft available", async () => {
    const { result, } = renderHook(() => useAircraftDetails());
    await act(() => mockAxiosGet)
    expect(mockAxiosGet).toHaveBeenCalledTimes(5);
    const formData = {
      date_range: [dayjs("2023-04-14"), dayjs("2023-04-15")],
      landing_count: 2,
      flying_time: 10
    }
    const { getAircraftAvailability } = result.current;
    const availability = getAircraftAvailability(formData);
    expect(availability).toMatchObject([
      {
        id: 1,
        tail_number: "N123AA",
        status: "AVAILABLE",
      }
    ])
  });

  it("should give aircraft unavailable for conflicting trip", async () => {
    const { result, } = renderHook(() => useAircraftDetails());
    await act(() => mockAxiosGet)
    expect(mockAxiosGet).toHaveBeenCalledTimes(5);
    const { getAircraftAvailability } = result.current;
    const formData = {
      date_range: [dayjs("2023-03-24"), dayjs("2023-03-25")],
      landing_count: 2,
      flying_time: 10
    }
    const availability = getAircraftAvailability(formData);
    expect(availability).toMatchObject([
      {
        id: 1,
        tail_number: "N123AA",
        status: "UNAVAILABLE",
      }
    ])

    const formData1 = {
      date_range: [dayjs("2023-03-25"), dayjs("2023-03-27")],
      landing_count: 2,
      flying_time: 10
    }
    const availability1 = getAircraftAvailability(formData1);
    expect(availability1).toMatchObject([
      {
        id: 1,
        tail_number: "N123AA",
        status: "UNAVAILABLE",
      }
    ])

    const formData2 = {
      date_range: [dayjs("2023-03-26"), dayjs("2023-03-27")],
      landing_count: 2,
      flying_time: 10
    }
    const availability2 = getAircraftAvailability(formData2);
    expect(availability2).toMatchObject([
      {
        id: 1,
        tail_number: "N123AA",
        status: "UNAVAILABLE",
      }
    ])

    const formData3 = {
      date_range: [dayjs("2023-03-24"), dayjs("2023-03-27")],
      landing_count: 2,
      flying_time: 10
    }
    const availability3 = getAircraftAvailability(formData3);
    expect(availability3).toMatchObject([
      {
        id: 1,
        tail_number: "N123AA",
        status: "UNAVAILABLE",
      }
    ])

    const formData4 = {
      date_range: [dayjs("2023-03-24"), dayjs("2023-03-26")],
      landing_count: 2,
      flying_time: 10
    }
    const availability4 = getAircraftAvailability(formData4);
    expect(availability4).toMatchObject([
      {
        id: 1,
        tail_number: "N123AA",
        status: "UNAVAILABLE",
      }
    ])
  });

  it("should give aircraft unavailable for scheduled maintainance", async () => {
    const { result, } = renderHook(() => useAircraftDetails());
    await act(() => mockAxiosGet)
    expect(mockAxiosGet).toHaveBeenCalledTimes(5);
    const { getAircraftAvailability } = result.current;
    const formData = {
      date_range: [dayjs("2023-03-20"), dayjs("2023-03-25")],
      landing_count: 2,
      flying_time: 10
    }
    const availability = getAircraftAvailability(formData);
    expect(availability).toMatchObject([
      {
        id: 1,
        tail_number: "N123AA",
        status: "UNAVAILABLE",
      }
    ])

    const formData1 = {
      date_range: [dayjs("2023-03-18"), dayjs("2023-03-20")],
      landing_count: 2,
      flying_time: 10
    }
    const availability1 = getAircraftAvailability(formData1);
    expect(availability1).toMatchObject([
      {
        id: 1,
        tail_number: "N123AA",
        status: "UNAVAILABLE",
      }
    ])

    const formData2 = {
      date_range: [dayjs("2023-03-23"), dayjs("2023-03-27")],
      landing_count: 2,
      flying_time: 10
    }
    const availability2 = getAircraftAvailability(formData2);
    expect(availability2).toMatchObject([
      {
        id: 1,
        tail_number: "N123AA",
        status: "UNAVAILABLE",
      }
    ])

    const formData3 = {
      date_range: [dayjs("2023-03-18"), dayjs("2023-03-23")],
      landing_count: 2,
      flying_time: 10
    }
    const availability3 = getAircraftAvailability(formData3);
    expect(availability3).toMatchObject([
      {
        id: 1,
        tail_number: "N123AA",
        status: "UNAVAILABLE",
      }
    ])

    const formData4 = {
      date_range: [dayjs("2023-03-20"), dayjs("2023-03-23")],
      landing_count: 2,
      flying_time: 10
    }
    const availability4 = getAircraftAvailability(formData4);
    expect(availability4).toMatchObject([
      {
        id: 1,
        tail_number: "N123AA",
        status: "UNAVAILABLE",
      }
    ])
  });

  it("should give aircraft unavailable for hobbs meter reading", async () => {
    const { result, } = renderHook(() => useAircraftDetails());
    await act(() => mockAxiosGet)
    expect(mockAxiosGet).toHaveBeenCalledTimes(5);
    const { getAircraftAvailability } = result.current;
    const formData = {
      date_range: [dayjs("2023-03-14"), dayjs("2023-03-18")],
      landing_count: 20,
      flying_time: 100
    }
    const availability = getAircraftAvailability(formData);
    expect(availability).toMatchObject([
      {
        id: 1,
        tail_number: "N123AA",
        status: "UNAVAILABLE",
      }
    ])
  });

  it("should give aircraft unavailable for maintainance due date", async () => {
    const { result, } = renderHook(() => useAircraftDetails());
    await act(() => mockAxiosGet)
    expect(mockAxiosGet).toHaveBeenCalledTimes(5);
    const { getAircraftAvailability } = result.current;
    const formData = {
      date_range: [dayjs("2023-06-25"), dayjs("2023-06-30")],
      landing_count: 20,
      flying_time: 100
    }
    const availability = getAircraftAvailability(formData);
    expect(availability).toMatchObject([
      {
        id: 1,
        tail_number: "N123AA",
        status: "UNAVAILABLE",
      }
    ])
  });

  it("should give aircraft available if maintainance is scheduled to take care of due items", async () => {
    const { result, } = renderHook(() => useAircraftDetails());
    await act(() => mockAxiosGet)
    expect(mockAxiosGet).toHaveBeenCalledTimes(5);
    const { getAircraftAvailability } = result.current;
    const formData = {
      date_range: [dayjs("2023-03-27"), dayjs("2023-03-30")],
      landing_count: 20,
      flying_time: 100
    }
    const availability = getAircraftAvailability(formData);
    expect(availability).toMatchObject([
      {
        id: 1,
        tail_number: "N123AA",
        status: "AVAILABLE",
      }
    ])
  });
});
