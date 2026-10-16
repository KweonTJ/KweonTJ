FROM ros:humble-ros-base@sha256:860e53793ccf575e5369b5e9a19939de2bfcfb46a299954d06f54f2af54fed19
RUN apt-get update && apt-get install -y --no-install-recommends \
      ros-humble-domain-bridge python3-aiohttp \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /opt/shelf-web-bridge
COPY domain_bridge.yaml gateway.py protocol.py run_bridge.py ./
ENV PYTHONDONTWRITEBYTECODE=1
EXPOSE 8769
CMD ["python3", "run_bridge.py", "--help"]
