import { Modal, Table } from "antd";
import React from "react";
import { AircraftAvailability } from "../../types";
import { aircraftAvailabilityColumns } from "./consts";

interface Props {
  isModalOpen: boolean;
  aircraftAvailability: AircraftAvailability[];
  onCancel: () => void;
}

const AircraftAvailabilityModal: React.FC<Props> = ({ isModalOpen, aircraftAvailability, onCancel }) => {
  return (
    <Modal title="Aircraft Availability" open={isModalOpen} footer={null} onCancel={onCancel}>
      <Table dataSource={aircraftAvailability} columns={aircraftAvailabilityColumns} />
    </Modal>
  );
};

export default AircraftAvailabilityModal;
