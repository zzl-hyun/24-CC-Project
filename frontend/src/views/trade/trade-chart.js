import React, { useEffect, useRef, memo } from 'react';
// import './profit.css';

const Chart = () => {
    const container = useRef();
    useEffect(() => {
        if (container.current) {
          const existingScript = container.current.querySelector("script[src='https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js']");
          if (!existingScript) {
            const script = document.createElement("script");
            script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
            script.type = "text/javascript";
            script.async = true;
            script.innerHTML = `
              {
                "width": "100%",
                "height": "610",
                "symbol": "UPBIT:BTCKRW",
                "interval": "3",
                "timezone": "Etc/UTC",
                "theme": "dark",
                "style": "1",
                "locale": "kr",
                "backgroundColor": "rgba(255, 255, 255, 1)",
                "gridColor": "rgba(0, 255, 0, 0.06)",
                "allow_symbol_change": false,
                "calendar": false,
                "support_host": "https://www.tradingview.com"
              }`;
            container.current.appendChild(script);
          }
        }
      }, []);

      return (
        <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
          <div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }}></div>
          <div className="tradingview-widget-copyright"><a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span className="blue-text">Track all markets on TradingView</span></a></div>
        </div>
      );
};

export default memo(Chart);





