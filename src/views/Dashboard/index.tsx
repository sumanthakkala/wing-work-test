import React, { useState } from "react";
import { AircraftAvailability } from "../../types";
import { Button, Col, Divider, Form, Row, Table, DatePicker, InputNumber } from "antd";
import { aircraftColumns, maintainanceSchedulesColumns, tripsColumns } from "./consts";
import { HourglassOutlined, NumberOutlined } from "@ant-design/icons";
import AircraftAvailabilityModal from "./AircraftAvailabilityModal";
import useAircraftDetails from "../../hooks/useAircraftDetails";
const { RangePicker } = DatePicker;

const dateFormat = "YYYY-MM-DD";

const Dashboard: React.FC = () => {
  const [form] = Form.useForm();
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [aircraftAvailabilityStatuses, setAircraftAvailabilityStatuses] = useState<AircraftAvailability[]>([]);
  const { aircrafts, maintainanceSchedules, trips, getAircraftAvailability } = useAircraftDetails();

  return (
    <div>
      <AircraftAvailabilityModal
        isModalOpen={showAvailabilityModal}
        aircraftAvailability={aircraftAvailabilityStatuses}
        onCancel={() => setShowAvailabilityModal(false)}
      />
      <Form
        form={form}
        name="trip_search"
        onFinish={(values) => {
          console.log(values);
          const aircraftStatuses = getAircraftAvailability(values);
          setAircraftAvailabilityStatuses(aircraftStatuses);
          setShowAvailabilityModal(true);
        }}
      >
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item name={"date_range"}>
              <RangePicker format={dateFormat} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name={"landing_count"}>
              <InputNumber addonAfter={<NumberOutlined />} placeholder={"Number of landings"} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name={"flying_time"}>
              <InputNumber addonAfter={<HourglassOutlined />} placeholder={"Flying hours"} />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Button type="primary" htmlType="submit" block>
            Search
          </Button>
        </Row>
      </Form>
      <Divider orientation="left">Upcoming Trips</Divider>
      <Table dataSource={trips} columns={tripsColumns} />
      <Divider orientation="left">Aircrafts</Divider>
      <Table dataSource={aircrafts} columns={aircraftColumns} />
      <Divider orientation="left">Maintainance Schedules</Divider>
      <Table dataSource={maintainanceSchedules} columns={maintainanceSchedulesColumns} />
    </div>
  );
};

export default Dashboard;
