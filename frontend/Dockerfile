FROM node:8 as builder

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run compile_and_run

######NGINX######

FROM nginx

RUN rm /etc/nginx/conf.d/default.conf
RUN rm /usr/share/nginx/html/*

COPY --from=builder /usr/src/app/dist/frontend /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d

CMD ["nginx", "-g", "daemon off;"]
#CMD ["/bin/bash"]
