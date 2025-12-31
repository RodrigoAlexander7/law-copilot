FROM python:3.14-slim


# Create app directory  
WORKDIR app/

COPY . .

RUN pip   install -r requirements.txt

CMD ["uvicorn", "main:app", "--reload"]