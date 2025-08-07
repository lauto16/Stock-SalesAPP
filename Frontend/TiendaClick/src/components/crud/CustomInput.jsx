import React from "react";
import { Form } from "react-bootstrap";

export default function CustomInput({ label, icon, type, placeholder, register, step, disabled }) {
  // hola amigo, el prop disabled es temporal hasta que tercerices el form de product info (el de modificar
  // productos), cuando lo hagas lo podes sacar :)
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
          step={step}
          placeholder={placeholder}
          {...register}
          disabled={disabled}
        />
      </div>
    </Form.Group>
  );
}