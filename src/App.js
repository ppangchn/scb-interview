import React, { useEffect, useState } from "react";
import { Form, Input, Button, Table, TimePicker } from "antd";
import styled from "styled-components";

import "antd/dist/antd.css";

const Container = styled.div`
  margin: 4rem;
`;

const Title = styled.div`
  font-size: 1.25rem;
  margin: 1.5rem 0;
`;

const FormContainer = styled(Form)`
  display: grid;
  grid-template-columns: 1fr 1fr 0.8fr 0.5fr;
  column-gap: 1.5rem;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    row-gap: 1.5rem;
  }
  .ant-form-item {
    margin-right: 0;
  }
`;

const LogContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const travelLogColumns = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Station",
    dataIndex: "station",
    key: "station",
  },
  {
    title: "Time",
    dataIndex: "time",
    key: "time",
  },
];
const averageTimeColumns = [
  {
    title: "Station1",
    dataIndex: "station1",
    key: "station1",
  },
  {
    title: "Station2",
    dataIndex: "station2",
    key: "station2",
  },
  {
    title: "Time (minute)",
    dataIndex: "time",
    key: "time",
  },
];

const App = () => {
  const [checkInForm] = Form.useForm();
  const [checkOutForm] = Form.useForm();

  const [travelLog, setTravelLog] = useState([]);
  const [travelPairLog, setTravelPairLog] = useState([]);
  const [averageTime, setAverageTime] = useState([]);
  const [stationSet, setStationSet] = useState(new Set());
  const [isDisabledCheckIn, setIsDisabledCheckIn] = useState(false);

  useEffect(() => {
    calculateAverageTime();
  }, [travelPairLog]);

  const handleSubmitCheckIn = (values) => {
    const { passengerName, checkInStation, checkInTime } = values;
    const newTravelLog = [...travelLog];
    newTravelLog.push({
      name: passengerName,
      station: checkInStation,
      time: checkInTime.format("HH:mm"),
    });
    stationSet.add(checkInStation);
    checkOutForm.setFieldsValue({
      passengerName,
    });
    setStationSet(stationSet);
    setTravelLog(newTravelLog);
    setIsDisabledCheckIn(true);
  };
  const handleSubmitCheckOut = (values) => {
    const { passengerName, checkInStation, checkInTime } = checkInForm.getFieldsValue();
    const { checkOutStation, checkOutTime } = values;
    const newTravelLog = [...travelLog];
    const newTravelPairLog = [...travelPairLog];
    newTravelLog.push({
      name: passengerName,
      station: checkOutStation,
      time: checkOutTime.format("HH:mm"),
    });
    newTravelPairLog.push({
      inStation: checkInStation,
      outStation: checkOutStation,
      diffTime: (checkOutTime.valueOf() - checkInTime.valueOf()) / 60000,
    });
    stationSet.add(checkOutStation);
    setStationSet(stationSet);
    setTravelLog(newTravelLog);
    setTravelPairLog(newTravelPairLog);
    setIsDisabledCheckIn(false);
    checkInForm.resetFields();
    checkOutForm.resetFields();
  };

  const calculateAverageTime = () => {
    const newAverageTime = [];
    const stationList = [...stationSet];
    for (let i = 0; i < stationList.length - 1; i++) {
      for (let j = i; j < stationList.length; j++) {
        const filter = travelPairLog.filter(
          (log) =>
            (log.inStation === stationList[i] && log.outStation === stationList[j]) ||
            (log.outStation === stationList[i] && log.inStation === stationList[j])
        );
        if (filter.length > 0) {
          let total = 0;
          for (const travel of filter) {
            total += parseFloat(travel.diffTime);
          }
          const average = total / filter.length;
          newAverageTime.push({
            station1: filter[0].inStation,
            station2: filter[0].outStation,
            time: average.toFixed(2),
          });
        }
      }
    }
    setAverageTime(newAverageTime);
  };

  return (
    <Container>
      <Title>Check In</Title>
      <FormContainer form={checkInForm} layout="inline" onFinish={handleSubmitCheckIn}>
        <Form.Item
          name="passengerName"
          rules={[{ required: true, message: "Please input Passenger's Name!" }]}
        >
          <Input placeholder="Name" disabled={isDisabledCheckIn} />
        </Form.Item>
        <Form.Item
          name="checkInStation"
          rules={[{ required: true, message: "Please input Station's Name!" }]}
        >
          <Input placeholder="Station" disabled={isDisabledCheckIn} />
        </Form.Item>
        <Form.Item
          name="checkInTime"
          rules={[{ required: true, message: "Please select check-in time!" }]}
        >
          <TimePicker format="HH:mm" disabled={isDisabledCheckIn} />
        </Form.Item>
        <Button type="primary" htmlType="submit" disabled={isDisabledCheckIn}>
          Submit
        </Button>
      </FormContainer>
      <Title>Check Out</Title>
      <FormContainer form={checkOutForm} layout="inline" onFinish={handleSubmitCheckOut}>
        <Form.Item
          name="passengerName"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input placeholder="Name" disabled={true} />
        </Form.Item>
        <Form.Item
          name="checkOutStation"
          rules={[{ required: true, message: "Please input Station's Name!" }]}
        >
          <Input placeholder="Station" disabled={!isDisabledCheckIn} />
        </Form.Item>
        <Form.Item
          name="checkOutTime"
          rules={[{ required: true, message: "Please input check-out time!" }]}
        >
          <TimePicker format="HH:mm" disabled={!isDisabledCheckIn} />
        </Form.Item>
        <Button type="primary" htmlType="submit" disabled={!isDisabledCheckIn}>
          Submit
        </Button>
      </FormContainer>
      <LogContainer>
        <Title>Travel Log</Title>
        <Table
          dataSource={travelLog}
          pagination={{ pageSize: 10 }}
          columns={travelLogColumns}
          rowKey={(record, i) => "travelLog" + i}
        />
      </LogContainer>
      <LogContainer>
        <Title>Average Time</Title>
        <Table
          dataSource={averageTime}
          pagination={{ pageSize: 10 }}
          columns={averageTimeColumns}
          rowKey={(record, i) => "averageTime" + i}
        />
      </LogContainer>
    </Container>
  );
};

export default App;
