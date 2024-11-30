import React, { useEffect, useRef } from 'react';
import Chart from '../../views/trade/trade-chart';
import Order from '../../views/trade/order';
import './trade.css';

const TradingViewWidget = () => {
  const widgetContainerRef = useRef(null);

  useEffect(() => {
    if (widgetContainerRef.current.querySelector("script")) {
        return;
      }
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = `
    {
      "symbols": [
        {
          "proName": "FOREXCOM:SPXUSD",
          "title": "S&P 500 Index"
        },
        {
          "proName": "FOREXCOM:NSXUSD",
          "title": "US 100 Cash CFD"
        },
        {
          "proName": "FX_IDC:EURUSD",
          "title": "EUR to USD"
        },
        {
          "proName": "BITSTAMP:BTCUSD",
          "title": "Bitcoin"
        },
        {
          "proName": "BITSTAMP:ETHUSD",
          "title": "Ethereum"
        }
      ],
      "showSymbolLogo": true,
      "isTransparent": false,
      "displayMode": "adaptive",
      "colorTheme": "dark",
      "locale": "en"
    }
    `;
    widgetContainerRef.current.appendChild(script);
  }, []);

  return (
    <div className="tradingview-widget-container" ref={widgetContainerRef}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
};

const Trade = () => {
    return (
      <div className="trade">
 
          <TradingViewWidget />
   
        <section className="chart-section">
          <Chart />
        </section>
        <section className="order-section">
          <Order />
        </section>
      </div>
    );
  };

export default Trade;
