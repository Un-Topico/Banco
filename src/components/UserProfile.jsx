import React from "react";
import { ProfileImageUpload } from "./ProfileImageUpload";
import {Row, Col } from "react-bootstrap";

export const UserProfile = ({ accountData, currentUser, onImageUpdate }) => {
  return (
    <Row className="text-center mb-4">
      <Col>
        <ProfileImageUpload
          currentImageUrl={accountData?.profileImage}
          onImageUpdate={onImageUpdate}
        />
        <h2>Perfil</h2>
        <p className="h4">Bienvenido, {accountData.name}</p>
        <p className="text-muted">{currentUser.email}</p>
      </Col>
    </Row>
  );
};
