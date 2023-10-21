FROM node:latest

# Copy resources and make directories

WORKDIR /app
COPY . ./
RUN mkdir -p homebrews
RUN mkdir -p public

# Install deps

RUN apt-get update && apt-get install -y git curl python-is-python3 python3-pip python3-poetry

# Prep scriptmaker 

RUN git clone https://github.com/rsarvar1a/scriptmaker
WORKDIR /app/scriptmaker
RUN poetry install
RUN bin/update

# Start the server

WORKDIR /app
RUN npm install
RUN npm run build
CMD ["npm", "run", "start"]