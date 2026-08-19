FROM postgres:16-alpine

RUN apk add --no-cache aws-cli coreutils jq

COPY backup.sh /opt/teachx/backup.sh
COPY restore-drill.sh /opt/teachx/restore-drill.sh
RUN chmod 0555 /opt/teachx/backup.sh /opt/teachx/restore-drill.sh

CMD ["/opt/teachx/backup.sh"]

