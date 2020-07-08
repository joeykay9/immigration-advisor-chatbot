FROM node

LABEL Name=immibot Version=0.0.1 Author="Joel Klo"


# ENV NODE_ENV=test
# ENV DEV_DB=mongodb://localhost:27017/dephli
# ENV GOOGLE_APPLICATION_CREDENTIALS=/app/dephli-firebase-adminsdk-55k52-55e1e7ce09.json


COPY . /app
WORKDIR /app
RUN npm install
RUN npm rebuild --build-from-source

CMD [ "npm", "start" ]
