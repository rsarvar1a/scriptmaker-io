FROM node:alpine

# Copy over

WORKDIR /app
COPY * ./

# Include scriptmaker util in server root, and prep it

RUN git clone https://github.com/rsarvar1a/scriptmaker
WORKDIR /app/scriptmaker
RUN bin/install
RUN bin/update

# Start the server

WORKDIR /app
RUN npm install
RUN npm run watch

CMD ["npm", "run", "start"]