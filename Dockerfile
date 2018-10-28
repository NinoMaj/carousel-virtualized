FROM mhart/alpine-node

# Set the default working directory
WORKDIR /usr/src/app

# Install dependencies
# COPY package.json yarn.lock ./
# RUN yarn
COPY . .

# Copy the relevant files to the working directory
# COPY /examples/ .
# RUN yarn

# Build and export the app
# RUN yarn build && yarn start
RUN yarn
RUN yarn build
WORKDIR /usr/src/app/examples
RUN yarn
RUN yarn build

CMD [ "yarn", "start" ]
