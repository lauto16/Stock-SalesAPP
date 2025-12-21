import { Button } from 'react-bootstrap';
export default function DownloadButton({ onClick, name }) {
    return (<li className="nav-item">
        <Button onClick={() => onClick()} className='nav-link'>
            <i className="nav-icon bi bi-circle" />
            {name}</Button>
    </li>)
}