FROM resin/raspberrypi3-debian
RUN [ "cross-build-start" ]

RUN curl -sL https://deb.nodesource.com/setup_8.x | bash - \
&& apt-get install -yqq --no-install-recommends nodejs   && rm -rf /var/lib/apt/lists/*

RUN apt-get update && \
apt-get install -yqq --no-install-recommends g++ gcc make libudev-dev  && rm -rf /var/lib/apt/lists/*


RUN curl -o openzwave-1.4.164.tar.gz  http://old.openzwave.com/downloads/openzwave-1.4.164.tar.gz \
&& tar -xzf openzwave-1.4.164.tar.gz \
&& cd openzwave-1.4.164/ \
&& make \
&& make install 

ENV LD_LIBRARY_PATH /usr/local/lib


RUN mkdir /ClimaValvesApp/
COPY App/package.json  /ClimaValvesApp/package.json

RUN cd /ClimaValvesApp \
&& npm  install 


COPY App /ClimaValvesApp
RUN mkdir /ClimaValvesApp/DB


RUN [ "cross-build-end" ]  



ENTRYPOINT ["node","/ClimaValvesApp/app.js"]