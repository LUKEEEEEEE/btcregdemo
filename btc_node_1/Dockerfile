FROM ubuntu:16.04
RUN apt-get update
RUN apt-get install --yes software-properties-common
RUN add-apt-repository --yes ppa:bitcoin/bitcoin
RUN apt-get update
RUN apt-get install --yes bitcoind
ADD ./conf /root/.bitcoin    
WORKDIR /root/
EXPOSE 11000
EXPOSE 11001
CMD ["bitcoind", "-debug"]

#CMD ["/bin/bash"]