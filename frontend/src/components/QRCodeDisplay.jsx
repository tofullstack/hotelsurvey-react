import React from 'react';
//import QRCode from 'qrcode.react'; // biblioteca para gerar QR Code
import { QRCodeSVG } from 'qrcode.react';


const QRCodeDisplay = ({ url, size = 256, level = 'H', includeMargin = true }) => {
  if (!url) {
    return <p className="text-danger">Please provide a URL to generate the QR Code.</p>;
  }

  return (
    <div className="text-center my-3">
      <p>Scan this QR Code to access the survey:</p>
      <QRCodeSVG
        value={url}
        size={size}
        level={level}
        includeMargin={includeMargin}
      />
      <p className="mt-2 small text-muted">Direct Link: <a href={url} target="_blank" rel="noopener noreferrer">{url}</a></p>
    </div>
  );
};

export default QRCodeDisplay;