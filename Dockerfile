FROM node:alpine

# Copy over

WORKDIR /app
COPY * .

# Install git and clone scriptmaker

RUN apk add --update git curl python3 py3-pip
RUN git clone https://github.com/rsarvar1a/scriptmaker

# Prep scriptmaker 

WORKDIR /app/scriptmaker
RUN bin/install
RUN bin/update

# Start the server

WORKDIR /app
RUN npm install
RUN npm run watch

CMD ["npm", "run", "start"]