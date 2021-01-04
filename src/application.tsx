import React from 'react';
import './application.css';

function Application() {
  return (
    <div className="application">
      <header className="application__header">
        <img src={`${process.env.PUBLIC_URL}/logo.svg`} className="application__logo" alt="logo" />
      </header>
    </div>
  );
}

export default Application;
