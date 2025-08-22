import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation, Trans } from "react-i18next";

const QRCodeDisplay = ({ url, size = 256, level = 'H', includeMargin = true }) => {
  const { t } = useTranslation();

  if (!url) {
    return <p className="text-danger">{t("qrcodeError")}</p>;
  }

  return (
    <div className="text-center my-3">
      <p>{t("scanQrCode")}</p>
      <QRCodeSVG
        value={url}
        size={size}
        level={level}
        includeMargin={includeMargin}
      />
      <p className="mt-2 small text-muted">
        <Trans
          i18nKey="orclickLink"
          components={{ a: <a href={url} target="_blank" rel="noopener noreferrer" /> }}
          values={{ url: url }} 
        />
      </p>
    </div>
  );
};

export default QRCodeDisplay;