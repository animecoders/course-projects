FROM node:26-alpine

# 2. Set WORKDIR. It can be whatever you want. 
WORKDIR /app

# 3. Copy all your source code into the container
COPY . .

# 4. Install dependencies
RUN npm install

# 5. no build step requried

# 6. Run your app.The exact file name depends on the package.json file.  
CMD ["node", "index.js"]