#!/bin/bash
echo "========================================================"
echo "Dang khoi tao ket noi ra ngoai Internet..."
echo "Copy duong dan HTTPS (vi du: https://xxxx.localhost.run) va gui cho ban be."
echo "Nhan Ctrl+C de dung chia se."
echo "========================================================"
echo ""
# Su dung dich vu mien phi localhost.run
ssh -R 80:localhost:5173 nokey@localhost.run
