import React from "react";
import { Col, Form } from "react-bootstrap";
import Select from "react-select";
import { Controller } from "react-hook-form";
import CustomInput from "./CustomInput";

export default function Input({ field, register, control, errors, index }) {
    switch (field.type) {
        case 'select':
            return (
                <Col md={6} key={index} className="d-flex flex-column">
                    <Form.Group className="mb-3">
                        <Form.Label>{field.label}</Form.Label>
                        <Controller
                            name={field.name}
                            control={control}
                            rules={{ required: field.required }}
                            render={({ field: controllerField }) => {
                                const selectedOption = field.selectedOption
                                    ? field.selectedOption(controllerField.value)
                                    : null;
                                return (
                                    <Select
                                        {...controllerField}
                                        value={selectedOption}
                                        onChange={(option) =>
                                            controllerField.onChange(option?.value ?? null)
                                        }
                                        //select dropdown 
                                        options={field.selectOptions.map((p) => ({
                                            value: p.id,
                                            label: p.name,
                                        }))}
                                        isSearchable
                                        placeholder={field.placeholder}
                                        noOptionsMessage={() =>
                                            field.errorMsg || "No se encontraron opciones"
                                        }
                                    />
                                );
                            }}
                        />
                        {errors[field.name] && (
                            <small className="text-danger">
                                {field.errorMsg || "Este campo es requerido"}
                            </small>
                        )}
                    </Form.Group>
                </Col>
            );

        case 'input_disabled':
            return (
                <Col md={6} key={index} className="d-flex flex-column">
                    <Form.Group className="mb-3 w-100">
                        <Form.Label>{field.label}</Form.Label>
                        <div className="input-group">
                            <span className="input-group-text bg-white">%</span>
                            <Form.Control
                                value={field.defaultValue}
                                disabled={field.disabled ?? true}
                                style={field.style}
                            />
                        </div>
                    </Form.Group>
                </Col>
            );

        default:
            return (
                <Col md={6} key={index} className="d-flex flex-column">
                    <CustomInput
                        label={field.label}
                        icon={field.icon}
                        type={field.type}
                        value={field.defaultValue}
                        placeholder={field.placeholder}
                        register={register(field.name, {
                            required: field.required,
                            valueAsNumber: field.valueAsNumber,
                        })}
                        step={field.step}
                    />
                </Col>
            );
    }
}
