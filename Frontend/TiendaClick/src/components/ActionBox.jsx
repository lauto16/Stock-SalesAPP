import React from 'react';

const ActionBox = ({ name, number, url }) => {

    return (
        <div className="col-lg-3 col-6">
            <div className="small-box text-bg-primary">
                <div className="inner">
                    <h3>{number}</h3>
                    <p>{name}</p>
                </div>

                <img src="/public/cart-icon.svg" alt="Carrito" className="small-box-icon" />
                <a href={url} className="small-box-footer link-light link-underline-opacity-0 link-underline-opacity-50-hover">
                    More info <i className="bi bi-link-45deg" />
                </a>
            </div>
        </div>
    );
};

export default ActionBox;
