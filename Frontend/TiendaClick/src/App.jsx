import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SalesChart from './components/SalesChart.jsx'
import ActionBox from './components/ActionBox.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <div className="app-wrapper">
        {/* <topbar path="{path}"> */}
        {/* <sidenav path="{path}" mainpage="{mainPage}" page="{page}"> */}
        <main className="app-main">
          <div className="app-content-header">
            <div className="container-fluid">
              <div className="row">
                <div className="col-sm-6">
                  <h3 className="mb-0">Dashboard</h3>
                </div>
                <div className="col-sm-6">
                  <ol className="breadcrumb float-sm-end">
                    <li className="breadcrumb-item"><a href="#">Home</a></li>
                    <li className="breadcrumb-item active" aria-current="page">
                      Dashboard
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
          <div className="app-content">
            <div className="container-fluid">
              <div className="row">
                <ActionBox name="New Orders" number="150" url="#" />

                <div className="col-lg-3 col-6">
                  <div className="small-box text-bg-primary">
                    <div className="inner">
                      <h3>150</h3>
                      <p>New Orders</p>
                    </div>
                    <svg className="small-box-icon" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
                    </svg>
                    <a href="#" className="small-box-footer link-light link-underline-opacity-0 link-underline-opacity-50-hover">
                      More info <i className="bi bi-link-45deg" />
                    </a>
                  </div>
                </div>

                <div className="col-lg-3 col-6">
                  <div className="small-box text-bg-success">
                    <div className="inner">
                      <h3>53<sup className="fs-5">%</sup></h3>
                      <p>Bounce Rate</p>
                    </div>
                    <svg className="small-box-icon" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" />
                    </svg>
                    <a href="#" className="small-box-footer link-light link-underline-opacity-0 link-underline-opacity-50-hover">
                      More info <i className="bi bi-link-45deg" />
                    </a>
                  </div>
                </div>

                <div className="col-lg-3 col-6">
                  <div className="small-box text-bg-warning">
                    <div className="inner">
                      <h3>44</h3>
                      <p>User Registrations</p>
                    </div>
                    <svg className="small-box-icon" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M6.25 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM3.25 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM19.75 7.5a.75.75 0 00-1.5 0v2.25H16a.75.75 0 000 1.5h2.25v2.25a.75.75 0 001.5 0v-2.25H22a.75.75 0 000-1.5h-2.25V7.5z" />
                    </svg>
                    <a href="#" className="small-box-footer link-dark link-underline-opacity-0 link-underline-opacity-50-hover">
                      More info <i className="bi bi-link-45deg" />
                    </a>
                  </div>
                </div>

                <div className="col-lg-3 col-6">
                  <div className="small-box text-bg-danger">
                    <div className="inner">
                      <h3>65</h3>
                      <p>Unique Visitors</p>
                    </div>
                    <svg className="small-box-icon" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path clipRule="evenodd" fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0z" />
                      <path clipRule="evenodd" fillRule="evenodd" d="M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75V3z" />
                    </svg>
                    <a href="#" className="small-box-footer link-light link-underline-opacity-0 link-underline-opacity-50-hover">
                      More info <i className="bi bi-link-45deg" />
                    </a>
                  </div>
                </div>

              </div>
              <div className="row">
                <div className="col-lg-7 connectedSortable">
                  <div className="card mb-4">
                    <div className="card-header">
                      <h3 className="card-title">Sales Value</h3>
                      <SalesChart />
                    </div>
                    <div className="card-body">
                      <div id="revenue-chart" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        {/* <footer></footer> */}
        {/* </sidenav> */}
        {/* </topbar> */}
      </div>
    </div>

  )
}

export default App
