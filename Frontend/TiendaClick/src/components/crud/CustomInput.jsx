import React from "react";
import { Form } from "react-bootstrap";

export default function CustomInput({ label, icon, type, placeholder, register, step, disabled = false, value, inputStyle, defaultValue }) {
  // hola amigo, el prop disabled es temporal hasta que tercerices el form de product info (el de modificar
  // productos), cuando lo hagas lo podes sacar :)
  const inputId = register?.name ?? label?.toLowerCase();

  return (
    <Form.Group className="mb-1">
      <Form.Label htmlFor={inputId}>{label}</Form.Label>
      <div className="input-group">
        {icon && (
          <span className="input-group-text bg-white">
            <i className={icon}></i>
          </span>
        )}
        <Form.Control
          id={inputId}
          type={type}
          step={step}
          placeholder={placeholder}
          defaultValue={defaultValue}
          value={value}
          {...register}
          style={inputStyle}
          disabled={disabled}
        />
      </div>
    </Form.Group>
  );
}