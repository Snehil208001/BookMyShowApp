const QRCode = require('qrcode')
QRCode.toFile('expo-qr.png', 'exp://192.168.1.8:8083', { width: 300 })
  .then(() => console.log('QR saved to expo-qr.png'))
  .catch(console.error)
