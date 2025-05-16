FROM python:3.13-alpine

WORKDIR /app
ENV PYTHONPATH=/app

# Install dependencies
COPY requirements.txt requirements.txt 
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]
