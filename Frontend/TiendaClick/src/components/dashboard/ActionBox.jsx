import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const ActionBox = ({ name, number, svgName, cardClass, subtext, subtext_value }) => {
    const [showValue, setShowValue] = useState(false)
    const containerClass = `small-box ${cardClass}`
    const image_path = `/${svgName}.svg`

    const parsedNumber =
        subtext_value !== undefined && subtext_value !== null
            ? parseFloat(subtext_value).toFixed(2)
            : '0.00'

    return (
        <div className="col-lg-3 col-md-6 col-12">
            <div className={containerClass}>
                <div className="inner">
                    <h3>{number}</h3>
                    <p>{name}</p>

                    {subtext && (
                        <div
                            className="d-flex align-items-center justify-content-between mt-2"
                            style={{ fontSize: '0.9rem' }}
                        >
                            <span>{subtext}</span>
                            <button
                                type="button"
                                onClick={() => setShowValue(!showValue)}
                                className="btn btn-sm p-0 border-0 bg-transparent eye-button"
                            >
                                {showValue ? (
                                    <EyeOff size={25} />
                                ) : (
                                    <Eye size={25} />
                                )}
                            </button>
                        </div>
                    )}

                    {subtext && (
                        <p className="mt-1 mb-0" style={{ fontSize: '0.95rem' }}>
                            {showValue ? `$${parsedNumber}` : '***'}
                        </p>
                    )}
                </div>

                <img
                    src={image_path}
                    alt={svgName}
                    className="small-box-icon"
                />
            </div>
        </div>
    )
}

export default ActionBox
