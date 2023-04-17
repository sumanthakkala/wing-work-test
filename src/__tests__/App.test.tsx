/* eslint-disable testing-library/no-node-access */
/* eslint-disable testing-library/no-container */
/* eslint-disable testing-library/prefer-screen-queries */
import { render, act, fireEvent, waitFor } from "@testing-library/react";
import App from "../App";
import '@testing-library/jest-dom'

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

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
      ],
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
      ],
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
      ],
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
      ],
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
      ],
    });
  }
});

jest.mock("axios", () => {
  return {
    get: (url: string) => mockAxiosGet(url),
  };
});

describe("App", () => {
  it("renders dashboard", async () => {
    const { container } = render(<App />);
    await act(() => mockAxiosGet);
    expect(mockAxiosGet).toHaveBeenCalledTimes(5);
    expect(container).toMatchSnapshot();
  });

  it("opens modal on search click", async () => {
    const { container, getByTitle, queryByText } = render(<App />);
    await act(() => mockAxiosGet);
    const dateRangeIp = container.querySelector("#trip_search_date_range");
    fireEvent.mouseDown(dateRangeIp!);
    fireEvent.click(dateRangeIp!);
    const startDate = getByTitle("2023-04-19");
    fireEvent.click(startDate);
    const endDate = getByTitle("2023-04-20");
    fireEvent.click(endDate);
    const landingCountIp = container.querySelector("#trip_search_landing_count");
    fireEvent.change(landingCountIp!, { target: { value: 2 } });
    const flyingTimeIp = container.querySelector("#trip_search_flying_time");
    fireEvent.change(flyingTimeIp!, { target: { value: 10 } });
    const form = container.querySelector('form');
    fireEvent.submit(form!)
    await waitFor(() => {
      const modalText = queryByText("Aircraft Availability");
      expect(modalText).toBeInTheDocument();
    });
  });
});
