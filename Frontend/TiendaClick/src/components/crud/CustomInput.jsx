import React from "react";
import { Form } from "react-bootstrap";

export default function CustomInput({ label, icon, type, placeholder, register }) {
  return (
    <Form.Group className="mb-1">
      <Form.Label>{label}</Form.Label>
      <div className="input-group">
        {icon && (
          <span className="input-group-text bg-white">
            <i className={icon}></i>
          </span>
        )}
        <Form.Control
          type={type}
          placeholder={placeholder}
          {...register}
        />
      </div>
    </Form.Group>
  );
}