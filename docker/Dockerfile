FROM christroutner/ct-base-ubuntu
MAINTAINER Chris Troutner <chris.troutner@gmail.com>

RUN apt-get update -y

#Set the working directory to be the home directory
WORKDIR /home/safeuser

# Switch to user account.
USER safeuser
# Prep 'sudo' commands.
#RUN echo 'abcd8765' | sudo -S pwd

# Clone the repository
WORKDIR /home/safeuser
RUN git clone https://github.com/Bitcoin-com/ws.bitcoin.com
WORKDIR /home/safeuser/ws.bitcoin.com
RUN npm install

EXPOSE 3000

#CMD ["npm", "start"]

COPY startup.sh startup.sh
CMD ["./startup.sh"]
