import React from "react";
import { Card } from "react-bootstrap";
import { Chat } from "./Chat";
import { SoporteChat } from "./SoporteChat";

export const RealTimeChat = ({ userRole }) => {
  return (
    <Card className="mt-4">
      <Card.Body>
        <Card.Title>Chat en Tiempo Real</Card.Title>
        {userRole === "soporte" ? <SoporteChat /> : <Chat />}
      </Card.Body>
    </Card>
  );
};
