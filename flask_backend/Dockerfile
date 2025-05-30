# Use explicit Python version with digest for deterministic builds
FROM python:3.10-slim@sha256:2bac43769ace90ebd3ad83e5392295e25dfc58e58543d3ab326c3330b505283d

# Set Python optimizations
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# Configure APT sources and install system dependencies
RUN echo "deb http://deb.debian.org/debian bullseye main" > /etc/apt/sources.list && \
    echo "deb http://deb.debian.org/debian bullseye-updates main" >> /etc/apt/sources.list && \
    echo "deb http://security.debian.org/debian-security bullseye-security main" >> /etc/apt/sources.list && \
    apt-get update -o Acquire::Check-Valid-Until=false && \
    apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    libopenblas-dev \
    liblapack-dev \
    libx11-dev \
    libgtk-3-dev \
    python3-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN adduser --disabled-password --gecos "" --no-create-home appuser
WORKDIR /app
RUN chown appuser:appuser /app

# Install Python dependencies first for layer caching
COPY --chown=appuser:appuser requirements.txt .
RUN pip install -r requirements.txt

# Copy application code
COPY --chown=appuser:appuser . .

# Switch to non-privileged user
USER appuser

# Runtime configuration
EXPOSE 5000
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
