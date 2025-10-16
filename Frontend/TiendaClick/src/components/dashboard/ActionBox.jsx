import React from 'react'

const ActionBox = ({ name, number, url, svgName, cardClass, linkTxt }) => {
    const containerClass = `${'small-box ' + cardClass}`
    const image_path = `/${svgName}.svg`
    return (
        <div className="col-lg-3 col-md-6 col-12">
            <div className={containerClass}>
                <div className="inner">
                    <h3>{number}</h3>
                    <p>{name}</p>
                </div>
                <img
                    src={image_path}
                    alt={svgName}
                    className="small-box-icon"
                />
                <a
                    href={url}
                    className="small-box-footer link-light link-underline-opacity-0 link-underline-opacity-50-hover"
                >
                    {linkTxt}
                </a>
            </div>
        </div>
    )
}

export default ActionBox
