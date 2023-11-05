FROM node:latest

# Copy resources and make directories

WORKDIR /app
COPY . ./
RUN mkdir -p /app/homebrews

# Install deps

RUN apt-get update && apt-get install -y git curl python-is-python3 python3-pip python3-poetry jq ghostscript poppler-utils awscli

# Prep scriptmaker 

RUN git clone https://github.com/rsarvar1a/scriptmaker
WORKDIR /app/scriptmaker
RUN poetry install

# I hate whatever NTFS->ext4 did to my repo

RUN chmod -R +x *
RUN bin/update

# Start the server

WORKDIR /app
RUN npm install
RUN npm run build
CMD ["npm", "run", "start"]
