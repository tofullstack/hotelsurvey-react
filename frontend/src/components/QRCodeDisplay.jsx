import React from 'react';
//import QRCode from 'qrcode.react'; // biblioteca para gerar QR Code
import { QRCodeSVG } from 'qrcode.react';


const QRCodeDisplay = ({ url, size = 256, level = 'H', includeMargin = true }) => {
  if (!url) {
    return <p className="text-danger">Erro ao gerar QR Code! URL necessária.</p>;
  }

  return (
    <div className="text-center my-3">
      <p>Escaneie o QR Code para acessar a pesquisa:</p>
      <QRCodeSVG
        value={url}
        size={size}
        level={level}
        includeMargin={includeMargin}
      />
      <p className="mt-2 small text-muted">Ou clique no link: <a href={url} target="_blank" rel="noopener noreferrer">{url}</a></p>
    </div>
  );
};

export default QRCodeDisplay;